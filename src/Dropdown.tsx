import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/dropdown.css';
import { Popup } from './internal/floating';
import { ChevronDown } from './internal/icons';
import { useOverlay, type OverlayProps } from './internal/overlay';
import { renderTrigger } from './internal/trigger';
import { cx } from './utils';

export interface DropdownItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Secondary text shown on the right, e.g. a shortcut hint. */
  extra?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: 'item' | 'divider' | 'group';
  /** Items of a `group`. */
  children?: DropdownItem[];
  onClick?: (item: DropdownItem) => void;
}

export interface DropdownProps extends OverlayProps {
  items: DropdownItem[];
  onSelect?: (key: string, item: DropdownItem) => void;
  /** Append a chevron that rotates while open. */
  showArrow?: boolean;
  /** Match the menu width to the trigger. */
  matchTriggerWidth?: boolean;
  menuClassName?: string;
  children: ReactNode;
  className?: string;
}

function flattenItems(items: DropdownItem[]): DropdownItem[] {
  return items.flatMap((item) => (item.type === 'group' ? flattenItems(item.children ?? []) : item.type === 'divider' ? [] : [item]));
}

export function Dropdown({ items, onSelect, showArrow = false, matchTriggerWidth = false, menuClassName, children, className, overlayClassName, overlayStyle, trigger = 'click', placement = 'bottom-start', ...overlayProps }: DropdownProps) {
  const overlay = useOverlay({ ...overlayProps, trigger, placement, matchWidth: matchTriggerWidth });
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const actionable = flattenItems(items);
  const enabledIndexes = actionable.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (!overlay.open) {
      setActiveIndex(-1);
      // Focus was inside the unmounted menu; hand it back to the trigger.
      if (wasOpen.current && document.activeElement === document.body) (overlay.anchorRef.current as HTMLElement | null)?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    requestAnimationFrame(() => menuRef.current?.focus());
  }, [overlay.open, overlay.anchorRef]);

  const select = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.(item);
    onSelect?.(item.key, item);
    overlay.setOpen(false);
    (overlay.anchorRef.current as HTMLElement | null)?.focus();
  };

  const move = (direction: 1 | -1) => {
    if (!enabledIndexes.length) return;
    const at = enabledIndexes.indexOf(activeIndex);
    setActiveIndex(at < 0 ? (direction === 1 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]) : enabledIndexes[(at + direction + enabledIndexes.length) % enabledIndexes.length]);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (overlayProps.disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || ((event.key === 'Enter' || event.key === ' ') && !overlay.open)) {
      event.preventDefault();
      overlay.setOpen(true);
      requestAnimationFrame(() => setActiveIndex(event.key === 'ArrowUp' ? enabledIndexes[enabledIndexes.length - 1] ?? -1 : enabledIndexes[0] ?? -1));
    }
  };
  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break;
      case 'ArrowUp': event.preventDefault(); move(-1); break;
      case 'Home': event.preventDefault(); setActiveIndex(enabledIndexes[0] ?? -1); break;
      case 'End': event.preventDefault(); setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1); break;
      case 'Enter': case ' ': event.preventDefault(); if (actionable[activeIndex]) select(actionable[activeIndex]); break;
      case 'Tab': overlay.setOpen(false); break;
      default: {
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const lower = event.key.toLocaleLowerCase();
          const start = activeIndex + 1;
          const match = [...actionable.slice(start), ...actionable.slice(0, start)].find((item) => !item.disabled && typeof item.label === 'string' && item.label.toLocaleLowerCase().startsWith(lower));
          if (match) setActiveIndex(actionable.indexOf(match));
        }
      }
    }
  };

  let runningIndex = -1;
  const renderItem = (item: DropdownItem) => {
    if (item.type === 'divider') return <li key={item.key} role="separator" className="at-dropdown__divider" />;
    if (item.type === 'group') return <li key={item.key} role="presentation" className="at-dropdown__group"><span className="at-dropdown__group-label">{item.label}</span><ul role="group">{item.children?.map(renderItem)}</ul></li>;
    runningIndex += 1;
    const index = runningIndex;
    const active = index === activeIndex;
    return <li
      key={item.key}
      id={`${overlay.id}-item-${index}`}
      role="menuitem"
      aria-disabled={item.disabled || undefined}
      className={cx('at-dropdown__item', active && 'at-dropdown__item--active', item.disabled && 'at-dropdown__item--disabled', item.danger && 'at-dropdown__item--danger')}
      onMouseEnter={() => !item.disabled && setActiveIndex(index)}
      onClick={() => select(item)}
    >
      {item.icon && <span className="at-dropdown__icon">{item.icon}</span>}
      <span className="at-dropdown__label">{item.label}</span>
      {item.extra && <span className="at-dropdown__extra">{item.extra}</span>}
    </li>;
  };

  const triggerNode = showArrow
    ? <span className={cx('at-dropdown__trigger-arrow', overlay.open && 'at-dropdown__trigger-arrow--open')}>{children}<ChevronDown size={14} /></span>
    : children;

  return <>
    {renderTrigger(triggerNode, { ...overlay.triggerProps, 'aria-haspopup': 'menu', className: cx('at-dropdown__trigger', className), onKeyDown: onTriggerKeyDown }, overlay.anchorRef, 'at-dropdown__trigger-wrap')}
    <Popup
      open={overlay.open}
      panelRef={overlay.panelRef}
      position={overlay.position}
      placement={overlay.placement}
      className={cx('at-dropdown__panel', overlayClassName)}
      style={overlayStyle}
      {...overlay.panelHoverProps}
    >
      <ul
        ref={menuRef}
        id={overlay.id}
        role="menu"
        tabIndex={-1}
        aria-activedescendant={activeIndex >= 0 ? `${overlay.id}-item-${activeIndex}` : undefined}
        className={cx('at-dropdown__menu', menuClassName)}
        onKeyDown={onMenuKeyDown}
      >
        {items.map(renderItem)}
      </ul>
    </Popup>
  </>;
}
