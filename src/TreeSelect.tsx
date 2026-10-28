import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/tree-select.css';
import { FieldShell, Selector, SelectorTag, highlightMatch } from './internal/Field';
import { Popup, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { Check, ChevronRight } from './internal/icons';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export interface TreeSelectNode { label: string; value: string; children?: TreeSelectNode[]; disabled?: boolean; selectable?: boolean; icon?: ReactNode }
export type TreeSelectValue = string | string[];

export interface TreeSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'prefix'> {
  treeData: TreeSelectNode[];
  value?: TreeSelectValue;
  defaultValue?: TreeSelectValue;
  onChange?: (value: TreeSelectValue, nodes: TreeSelectNode | TreeSelectNode[] | undefined) => void;
  multiple?: boolean;
  /** Show checkboxes; checking a branch toggles all of its descendants. */
  treeCheckable?: boolean;
  showSearch?: boolean;
  treeDefaultExpandAll?: boolean;
  treeDefaultExpandedKeys?: string[];
  placeholder?: string;
  notFoundContent?: ReactNode;
  disabled?: boolean;
  allowClear?: boolean;
  maxTagCount?: number;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  popupMatchSelectWidth?: boolean;
}

interface FlatNode { node: TreeSelectNode; depth: number; parent?: string; hasChildren: boolean }

function flatten(nodes: TreeSelectNode[], depth = 0, parent?: string): FlatNode[] {
  return nodes.flatMap((node) => [{ node, depth, parent, hasChildren: Boolean(node.children?.length) }, ...(node.children ? flatten(node.children, depth + 1, node.value) : [])]);
}
function descendants(node: TreeSelectNode): TreeSelectNode[] {
  return (node.children ?? []).flatMap((child) => [child, ...descendants(child)]);
}

export const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(function TreeSelect(
  {
    treeData, value, defaultValue, onChange, multiple = false, treeCheckable = false, showSearch = false, treeDefaultExpandAll = false, treeDefaultExpandedKeys,
    placeholder = '请选择…', notFoundContent = '暂无匹配选项', disabled = false, allowClear = true, maxTagCount, size = 'md', status, label, hint, error,
    open: openProp, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, popupMatchSelectWidth = true, className, id, onKeyDown, ...rest
  }, ref,
) {
  const isMultiple = multiple || treeCheckable;
  const reactId = useId();
  const triggerId = id ?? `at-tree-select-${reactId}`;
  const treeId = `${triggerId}-tree`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const flat = useMemo(() => flatten(treeData), [treeData]);
  const byValue = useMemo(() => new Map(flat.map((item) => [item.node.value, item])), [flat]);
  const fallback = useMemo<TreeSelectValue>(() => (isMultiple ? [] : ''), [isMultiple]);
  const lookup = (next: TreeSelectValue) => (Array.isArray(next) ? next.map((item) => byValue.get(item)?.node).filter((item): item is TreeSelectNode => Boolean(item)) : byValue.get(next)?.node);
  const [current, setCurrent] = useControllableState<TreeSelectValue>(value, defaultValue ?? fallback, (next) => onChange?.(next, lookup(next)));
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const treeRef = useRef<HTMLUListElement | null>(null);
  const selected = useMemo(() => (Array.isArray(current) ? current : current ? [current] : []), [current]);

  const ancestorsOf = (key: string) => { const chain: string[] = []; let parent = byValue.get(key)?.parent; while (parent) { chain.push(parent); parent = byValue.get(parent)?.parent; } return chain; };
  const [expanded, setExpanded] = useState<string[]>(() => {
    if (treeDefaultExpandAll) return flat.filter((item) => item.hasChildren).map((item) => item.node.value);
    const fromSelection = selected.flatMap(ancestorsOf);
    return [...new Set([...(treeDefaultExpandedKeys ?? []), ...fromSelection])];
  });

  const showPopup = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement, { matchWidth: popupMatchSelectWidth });
  useDismiss(showPopup, [anchorRef, panelRef], () => setOpen(false));
  useEffect(() => {
    if (!showPopup) { setQuery(''); setActiveKey(null); return; }
    setExpanded((keys) => [...new Set([...keys, ...selected.flatMap(ancestorsOf)])]);
    setActiveKey(selected[0] ?? flat.find((item) => !item.node.disabled)?.node.value ?? null);
    if (showSearch) requestAnimationFrame(() => searchRef.current?.focus());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  const lower = query.trim().toLocaleLowerCase();
  const matchedKeys = useMemo(() => (lower ? new Set(flat.filter((item) => item.node.label.toLocaleLowerCase().includes(lower)).map((item) => item.node.value)) : null), [flat, lower]);
  const visibleKeys = useMemo(() => {
    if (!matchedKeys) return null;
    const keys = new Set<string>();
    matchedKeys.forEach((key) => { keys.add(key); ancestorsOf(key).forEach((ancestor) => keys.add(ancestor)); });
    return keys;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedKeys]);
  const rows = useMemo(() => flat.filter((item) => {
    if (visibleKeys) return visibleKeys.has(item.node.value);
    let parent = item.parent;
    while (parent) { if (!expanded.includes(parent)) return false; parent = byValue.get(parent)?.parent; }
    return true;
  }), [flat, visibleKeys, expanded, byValue]);
  useEffect(() => {
    const target = treeRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(activeKey ?? '')}"]`);
    target?.scrollIntoView({ block: 'nearest' });
  }, [activeKey]);

  const toggleExpand = (key: string) => setExpanded((keys) => (keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]));
  const choose = (node: TreeSelectNode) => {
    if (node.disabled || node.selectable === false) { if (node.children?.length) toggleExpand(node.value); return; }
    if (isMultiple) {
      const affected = treeCheckable ? [node, ...descendants(node)].filter((item) => !item.disabled).map((item) => item.value) : [node.value];
      const allSelected = affected.every((item) => selected.includes(item));
      setCurrent(allSelected ? selected.filter((item) => !affected.includes(item)) : [...new Set([...selected, ...affected])]);
      setQuery('');
      searchRef.current?.focus();
    } else {
      setCurrent(node.value);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as KeyboardEvent<HTMLDivElement>);
    if (event.defaultPrevented || disabled) return;
    if (!showPopup) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); }
      else if (event.key === 'Backspace' && isMultiple && selected.length) setCurrent(selected.slice(0, -1));
      return;
    }
    const enabledRows = rows.filter((item) => !item.node.disabled);
    const at = enabledRows.findIndex((item) => item.node.value === activeKey);
    const activeRow = rows.find((item) => item.node.value === activeKey);
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); if (enabledRows.length) setActiveKey(enabledRows[(at + 1) % enabledRows.length].node.value); break;
      case 'ArrowUp': event.preventDefault(); if (enabledRows.length) setActiveKey(enabledRows[(at - 1 + enabledRows.length) % enabledRows.length].node.value); break;
      case 'ArrowRight': if (activeRow?.hasChildren) { event.preventDefault(); if (!expanded.includes(activeRow.node.value)) toggleExpand(activeRow.node.value); else setActiveKey(activeRow.node.children![0].value); } break;
      case 'ArrowLeft': if (activeRow) { event.preventDefault(); if (activeRow.hasChildren && expanded.includes(activeRow.node.value)) toggleExpand(activeRow.node.value); else if (activeRow.parent) setActiveKey(activeRow.parent); } break;
      case 'Enter': case ' ': if (event.key === ' ' && showSearch) return; event.preventDefault(); if (activeRow) choose(activeRow.node); break;
      case 'Escape': event.preventDefault(); setOpen(false); break;
      case 'Backspace': if (isMultiple && !query && selected.length) setCurrent(selected.slice(0, -1)); break;
      case 'Tab': setOpen(false); break;
    }
  };

  const selectedNodes = lookup(current);
  const hasValue = selected.length > 0;
  let display: ReactNode;
  if (isMultiple) {
    const list = selectedNodes as TreeSelectNode[];
    const shown = maxTagCount != null ? list.slice(0, maxTagCount) : list;
    const extra = list.length - shown.length;
    display = <span className="at-selector__tags">
      {shown.map((node) => <SelectorTag key={node.value} label={node.label} disabled={disabled} onRemove={() => choose(node)} />)}
      {extra > 0 && <span className="at-selector__tag at-selector__tag--count">+{extra}</span>}
      {showSearch && showPopup
        ? <input ref={searchRef} className="at-selector__search" value={query} placeholder={hasValue ? '' : placeholder} aria-label={label ? `${label}搜索` : '搜索选项'} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} />
        : !hasValue && <span className="at-selector__placeholder">{placeholder}</span>}
    </span>;
  } else {
    const node = selectedNodes as TreeSelectNode | undefined;
    display = showSearch && showPopup
      ? <input ref={searchRef} className="at-selector__search" value={query} placeholder={node?.label ?? placeholder} aria-label={label ? `${label}搜索` : '搜索选项'} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} />
      : <span className={cx('at-selector__value', !node && 'at-selector__placeholder')}>{node?.label ?? placeholder}</span>;
  }

  return <FieldShell label={label} hint={hint} error={error} labelId={labelId} htmlFor={triggerId} className={className}>
    <Selector
      {...rest}
      ref={(node) => { triggerRef.current = node; anchorRef.current = node; assignRef(ref, node); }}
      id={triggerId}
      role="combobox"
      tabIndex={disabled ? -1 : 0}
      size={size}
      status={status ?? (error ? 'error' : undefined)}
      open={showPopup}
      disabled={disabled}
      hasValue={hasValue}
      allowClear={allowClear}
      onClear={() => setCurrent(fallback)}
      className={cx('at-tree-select', isMultiple && 'at-select--multiple')}
      aria-haspopup="tree"
      aria-expanded={showPopup}
      aria-controls={showPopup ? treeId : undefined}
      aria-labelledby={labelId}
      aria-invalid={Boolean(error) || status === 'error' || undefined}
      onClick={() => { if (!disabled) setOpen(!open); }}
      onKeyDown={handleKeyDown}
    >
      {display}
    </Selector>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} className={cx(`at-popup--${size}`, 'at-tree-select__popup', popupClassName)} style={popupStyle}>
      <ul ref={treeRef} id={treeId} className="at-popup__list at-tree-select__tree" role="tree" aria-multiselectable={isMultiple || undefined} aria-labelledby={labelId}>
        {rows.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
        {rows.map(({ node, depth, hasChildren }) => {
          const isExpanded = visibleKeys ? true : expanded.includes(node.value);
          const isSelected = selected.includes(node.value);
          const partially = treeCheckable && !isSelected && hasChildren && descendants(node).some((child) => selected.includes(child.value));
          const active = node.value === activeKey;
          return <li
            key={node.value}
            data-key={node.value}
            role="treeitem"
            aria-level={depth + 1}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
            aria-disabled={node.disabled || undefined}
            className={cx('at-option', 'at-tree-select__node', active && 'at-option--active', isSelected && 'at-option--selected', node.disabled && 'at-option--disabled', node.selectable === false && 'at-tree-select__node--branch')}
            style={{ '--at-tree-depth': depth } as CSSProperties}
            onMouseEnter={() => !node.disabled && setActiveKey(node.value)}
            onClick={() => choose(node)}
          >
            <button type="button" tabIndex={-1} className={cx('at-tree-select__switcher', !hasChildren && 'at-tree-select__switcher--leaf', isExpanded && 'at-tree-select__switcher--open')} aria-label={isExpanded ? '收起' : '展开'} aria-hidden={!hasChildren} onMouseDown={(event) => event.preventDefault()} onClick={(event) => { event.stopPropagation(); if (hasChildren) toggleExpand(node.value); }}>{hasChildren && <ChevronRight size={14} />}</button>
            {treeCheckable && <span className={cx('at-tree-select__checkbox', isSelected && 'at-tree-select__checkbox--checked', partially && 'at-tree-select__checkbox--partial')} aria-hidden="true">{isSelected && <Check size={12} />}</span>}
            {node.icon && <span className="at-tree-select__icon">{node.icon}</span>}
            <span className="at-option__label">{highlightMatch(node.label, query.trim())}</span>
            {!treeCheckable && <span className="at-option__check"><Check size={16} /></span>}
          </li>;
        })}
      </ul>
    </Popup>
  </FieldShell>;
});
