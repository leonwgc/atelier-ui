import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/menu.css';
import { Popup, useDismiss, useFloatingPanel } from './internal/floating';
import { ChevronDown, ChevronRight } from './internal/icons';
import { cx, useControllableState } from './utils';

export interface MenuItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: 'item' | 'group' | 'divider';
  /** Submenu entries (type `item`) or group members (type `group`). */
  children?: MenuItem[];
  href?: string;
  onClick?: (item: MenuItem) => void;
}
export type MenuMode = 'inline' | 'vertical' | 'horizontal';

export interface MenuProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  items: MenuItem[];
  mode?: MenuMode;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string, item: MenuItem) => void;
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
  /** Inline rail with icons only; submenus open as flyouts. */
  collapsed?: boolean;
  theme?: 'light' | 'dark';
  inlineIndent?: number;
  selectable?: boolean;
  label?: string;
}

interface MenuContextValue {
  mode: MenuMode;
  collapsed: boolean;
  selectedKey?: string;
  openKeys: string[];
  select: (item: MenuItem) => void;
  toggleOpen: (key: string) => void;
}
const MenuContext = createContext<MenuContextValue | null>(null);

function containsKey(item: MenuItem, key: string | undefined): boolean {
  if (!key) return false;
  return (item.children ?? []).some((child) => child.key === key || containsKey(child, key));
}
const hasSubmenu = (item: MenuItem) => item.type !== 'group' && Boolean(item.children?.length);

function focusSibling(root: HTMLElement | null, current: HTMLElement, direction: 1 | -1 | 'first' | 'last') {
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')).filter((element) => window.getComputedStyle(element).visibility !== 'hidden' && element.offsetParent !== null);
  if (!items.length) return;
  if (direction === 'first') { items[0].focus(); return; }
  if (direction === 'last') { items[items.length - 1].focus(); return; }
  const index = items.indexOf(current);
  items[(index + direction + items.length) % items.length]?.focus();
}

function ItemContent({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  return <>
    {item.icon && <span className="at-menu__icon">{item.icon}</span>}
    {!item.icon && collapsed && typeof item.label === 'string' && <span className="at-menu__icon at-menu__icon--initial">{item.label.slice(0, 1)}</span>}
    <span className="at-menu__label">{item.label}</span>
  </>;
}

function LeafItem({ item, depth, inFlyout, onActivate }: { item: MenuItem; depth: number; inFlyout?: boolean; onActivate?: () => void }) {
  const menu = useContext(MenuContext)!;
  const selected = menu.selectedKey === item.key;
  const indent = menu.mode === 'inline' && !menu.collapsed && !inFlyout ? indentStyle(depth) : undefined;
  const shared = {
    role: 'menuitem',
    tabIndex: -1,
    'aria-disabled': item.disabled || undefined,
    'aria-current': selected ? ('page' as const) : undefined,
    title: menu.collapsed && depth === 0 && typeof item.label === 'string' ? item.label : undefined,
    className: cx('at-menu__item', selected && 'at-menu__item--selected', item.disabled && 'at-menu__item--disabled', item.danger && 'at-menu__item--danger'),
    style: indent,
    onClick: (event: MouseEvent) => { if (item.disabled) { event.preventDefault(); return; } menu.select(item); onActivate?.(); },
  };
  const content = <ItemContent item={item} collapsed={menu.collapsed && depth === 0 && !inFlyout} />;
  return <li role="none" className="at-menu__li">
    {item.href ? <a {...shared} href={item.href}>{content}</a> : <button {...shared} type="button" disabled={item.disabled}>{content}</button>}
  </li>;
}

const indentStyle = (depth: number): CSSProperties => ({ paddingLeft: `calc(12px + ${depth} * var(--at-menu-indent, 20px))` });

function InlineSubMenu({ item, depth }: { item: MenuItem; depth: number }) {
  const menu = useContext(MenuContext)!;
  const open = menu.openKeys.includes(item.key);
  const active = containsKey(item, menu.selectedKey);
  return <li role="none" className={cx('at-menu__li', 'at-menu__submenu', open && 'at-menu__submenu--open')}>
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="true"
      aria-expanded={open}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      className={cx('at-menu__item', 'at-menu__title', active && 'at-menu__title--active', item.disabled && 'at-menu__item--disabled')}
      style={indentStyle(depth)}
      onClick={() => !item.disabled && menu.toggleOpen(item.key)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' && !open) { event.preventDefault(); menu.toggleOpen(item.key); }
        if (event.key === 'ArrowLeft' && open) { event.preventDefault(); menu.toggleOpen(item.key); }
      }}
    >
      <ItemContent item={item} collapsed={false} />
      <span className="at-menu__arrow"><ChevronDown size={14} /></span>
    </button>
    <div className="at-menu__inline-panel" aria-hidden={!open}>
      <ul role="menu" className="at-menu__inline-list">{renderItems(item.children ?? [], depth + 1)}</ul>
    </div>
  </li>;
}

function FlyoutSubMenu({ item, depth, nested, onActivate }: { item: MenuItem; depth: number; nested?: boolean; onActivate?: () => void }) {
  const menu = useContext(MenuContext)!;
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placement = menu.mode === 'horizontal' && !nested ? 'bottom-start' : 'right-start';
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLButtonElement, HTMLDivElement>(open, placement, { gap: menu.mode === 'horizontal' && !nested ? 8 : 4 });
  const listRef = useRef<HTMLUListElement | null>(null);
  const active = containsKey(item, menu.selectedKey);
  const schedule = (next: boolean, delay = next ? 60 : 160) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(next), delay); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useDismiss(open, [anchorRef, panelRef], () => setOpen(false));
  const close = () => { setOpen(false); onActivate?.(); };

  return <li role="none" className={cx('at-menu__li', 'at-menu__submenu', open && 'at-menu__submenu--open')} onMouseEnter={() => !item.disabled && schedule(true)} onMouseLeave={() => schedule(false)}>
    <button
      ref={anchorRef}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="true"
      aria-expanded={open}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      title={menu.collapsed && depth === 0 && typeof item.label === 'string' ? item.label : undefined}
      className={cx('at-menu__item', 'at-menu__title', active && 'at-menu__title--active', item.disabled && 'at-menu__item--disabled')}
      onClick={() => !item.disabled && setOpen((value) => !value)}
      onKeyDown={(event) => {
        const openKey = menu.mode === 'horizontal' && !nested ? 'ArrowDown' : 'ArrowRight';
        if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
          requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus());
        }
      }}
    >
      <ItemContent item={item} collapsed={menu.collapsed && depth === 0 && !nested} />
      <span className="at-menu__arrow">{menu.mode === 'horizontal' && !nested ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
    </button>
    <Popup open={open} panelRef={panelRef} position={position} placement={placement} className="at-menu__flyout" onMouseEnter={() => schedule(true, 0)} onMouseLeave={() => schedule(false)}>
      <ul
        ref={listRef}
        role="menu"
        className="at-menu__flyout-list"
        onKeyDown={(event) => {
          const current = event.target as HTMLElement;
          const closeKey = menu.mode === 'horizontal' && !nested ? 'ArrowUp' : 'ArrowLeft';
          if (event.key === 'ArrowDown') { event.preventDefault(); event.stopPropagation(); focusSibling(listRef.current, current, 1); }
          else if (event.key === 'ArrowUp' && !(menu.mode === 'horizontal' && !nested && current === listRef.current?.querySelector('[role="menuitem"]'))) { event.preventDefault(); event.stopPropagation(); focusSibling(listRef.current, current, -1); }
          else if (event.key === closeKey || event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); anchorRef.current?.focus(); }
          else if (event.key === 'Tab') setOpen(false);
        }}
      >
        {renderItems(item.children ?? [], depth + 1, { inFlyout: true, onActivate: close })}
      </ul>
    </Popup>
  </li>;
}

function renderItems(items: MenuItem[], depth: number, options: { inFlyout?: boolean; onActivate?: () => void } = {}): ReactNode {
  return items.map((item) => {
    if (item.type === 'divider') return <li key={item.key} role="separator" className="at-menu__divider" />;
    if (item.type === 'group') {
      return <li key={item.key} role="none" className="at-menu__group">
        <span className="at-menu__group-label" style={!options.inFlyout ? indentStyle(depth) : undefined}>{item.label}</span>
        <ul role="group">{renderItems(item.children ?? [], depth, options)}</ul>
      </li>;
    }
    if (hasSubmenu(item)) {
      return <SubMenuSwitch key={item.key} item={item} depth={depth} inFlyout={options.inFlyout} onActivate={options.onActivate} />;
    }
    return <LeafItem key={item.key} item={item} depth={depth} inFlyout={options.inFlyout} onActivate={options.onActivate} />;
  });
}

function SubMenuSwitch({ item, depth, inFlyout, onActivate }: { item: MenuItem; depth: number; inFlyout?: boolean; onActivate?: () => void }) {
  const menu = useContext(MenuContext)!;
  const flyout = inFlyout || menu.mode !== 'inline' || menu.collapsed;
  return flyout ? <FlyoutSubMenu item={item} depth={depth} nested={inFlyout} onActivate={onActivate} /> : <InlineSubMenu item={item} depth={depth} />;
}

export function Menu({
  items, mode = 'inline', selectedKey, defaultSelectedKey, onSelect, openKeys, defaultOpenKeys, onOpenChange, collapsed = false, theme = 'light', inlineIndent = 20, selectable = true, label = '菜单',
  className, style, onKeyDown, ...props
}: MenuProps) {
  const [selected, setSelected] = useControllableState<string | undefined>(selectedKey, defaultSelectedKey, (key) => { if (key !== undefined) onSelect?.(key, findItem(items, key)!); });
  const [open, setOpen] = useControllableState<string[]>(openKeys, defaultOpenKeys ?? [], onOpenChange);
  const rootRef = useRef<HTMLUListElement | null>(null);

  const context: MenuContextValue = {
    mode, collapsed, selectedKey: selected, openKeys: open,
    select: (item) => { item.onClick?.(item); if (selectable) setSelected(item.key); },
    toggleOpen: (key) => setOpen(open.includes(key) ? open.filter((item) => item !== key) : [...open, key]),
  };

  // Roving tabindex: the selected (or first) item is the single tab stop.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
    const target = focusable.find((element) => element.getAttribute('aria-current') === 'page') ?? focusable[0];
    focusable.forEach((element) => element.setAttribute('tabindex', element === target ? '0' : '-1'));
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const current = event.target as HTMLElement;
    if (current.getAttribute('role') !== 'menuitem' || !rootRef.current?.contains(current)) return;
    const horizontal = mode === 'horizontal';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previous = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === next) { event.preventDefault(); focusSibling(rootRef.current, current, 1); }
    else if (event.key === previous) { event.preventDefault(); focusSibling(rootRef.current, current, -1); }
    else if (event.key === 'Home') { event.preventDefault(); focusSibling(rootRef.current, current, 'first'); }
    else if (event.key === 'End') { event.preventDefault(); focusSibling(rootRef.current, current, 'last'); }
  };

  return <MenuContext.Provider value={context}>
    <ul
      {...props}
      ref={rootRef}
      role="menubar"
      aria-label={label}
      aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      className={cx('at-menu', `at-menu--${mode}`, `at-menu--${theme}`, collapsed && mode === 'inline' && 'at-menu--collapsed', className)}
      style={{ '--at-menu-indent': `${inlineIndent}px`, ...style } as CSSProperties}
      onKeyDown={handleKeyDown}
    >
      {renderItems(items, 0)}
    </ul>
  </MenuContext.Provider>;
}

function findItem(items: MenuItem[], key: string): MenuItem | undefined {
  for (const item of items) {
    if (item.key === key) return item;
    const nested = item.children ? findItem(item.children, key) : undefined;
    if (nested) return nested;
  }
  return undefined;
}
