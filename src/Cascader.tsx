import { useLocale } from './locale';
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/cascader.css';
import { FieldShell, Selector, highlightMatch } from './internal/Field';
import { Popup, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { Check, ChevronRight } from './internal/icons';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export interface CascaderOption { label: string; value: string; disabled?: boolean; children?: CascaderOption[]; isLeaf?: boolean }

export interface CascaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'prefix'> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], selectedOptions: CascaderOption[]) => void;
  placeholder?: string;
  expandTrigger?: 'click' | 'hover';
  /** Allow committing a non-leaf option. */
  changeOnSelect?: boolean;
  showSearch?: boolean;
  displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => ReactNode;
  notFoundContent?: ReactNode;
  disabled?: boolean;
  allowClear?: boolean;
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
}

function resolvePath(options: CascaderOption[], path: string[]) {
  const selected: CascaderOption[] = [];
  let level: CascaderOption[] | undefined = options;
  for (const value of path) {
    const match: CascaderOption | undefined = level?.find((item) => item.value === value);
    if (!match) break;
    selected.push(match);
    level = match.children;
  }
  return selected;
}

function collectPaths(options: CascaderOption[], includeBranches: boolean, trail: CascaderOption[] = []): CascaderOption[][] {
  return options.flatMap((option) => {
    const next = [...trail, option];
    const hasChildren = Boolean(option.children?.length);
    const own = !hasChildren || includeBranches ? [next] : [];
    return [...own, ...(hasChildren ? collectPaths(option.children!, includeBranches, next) : [])];
  });
}

export const Cascader = forwardRef<HTMLDivElement, CascaderProps>(function Cascader(
  {
    options, value, defaultValue = [], onChange, placeholder: placeholderProp, expandTrigger = 'click', changeOnSelect = false, showSearch = false, displayRender, notFoundContent: notFoundContentProp,
    disabled = false, allowClear = true, size = 'md', status, label, hint, error, open: openProp, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, className, id, onKeyDown, ...rest
  }, ref,
) {
  const { t } = useLocale();
  const placeholder = placeholderProp === undefined ? t('common.select') : placeholderProp;
  const notFoundContent = notFoundContentProp === undefined ? t('common.noOptions') : notFoundContentProp;

  const reactId = useId();
  const triggerId = id ?? `at-cascader-${reactId}`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const [current, setCurrent] = useControllableState<string[]>(value, defaultValue, (next) => onChange?.(next, resolvePath(options, next)));
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const [activePath, setActivePath] = useState<string[]>(current);
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const showPopup = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement);
  useDismiss(showPopup, [anchorRef, panelRef], () => setOpen(false));
  useEffect(() => {
    if (!showPopup) { setQuery(''); return; }
    setActivePath(current);
    if (showSearch) requestAnimationFrame(() => searchRef.current?.focus());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  const selectedOptions = useMemo(() => resolvePath(options, current), [options, current]);
  const columns = useMemo(() => {
    const result: CascaderOption[][] = [options];
    let level: CascaderOption[] | undefined = options;
    for (const segment of activePath) {
      const match: CascaderOption | undefined = level?.find((item) => item.value === segment);
      if (!match?.children?.length) break;
      result.push(match.children);
      level = match.children;
    }
    return result;
  }, [options, activePath]);

  const searchResults = useMemo(() => {
    if (!query) return [];
    const lower = query.toLocaleLowerCase();
    return collectPaths(options, changeOnSelect).filter((path) => path.map((item) => item.label).join(' / ').toLocaleLowerCase().includes(lower) && !path.some((item) => item.disabled)).slice(0, 50);
  }, [options, query, changeOnSelect]);
  useEffect(() => setSearchIndex(0), [query]);

  const commit = (path: CascaderOption[]) => {
    setCurrent(path.map((item) => item.value));
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };
  const activate = (depth: number, option: CascaderOption, viaHover = false) => {
    if (option.disabled) return;
    const next = [...activePath.slice(0, depth), option.value];
    setActivePath(next);
    const isLeaf = option.isLeaf ?? !option.children?.length;
    if (viaHover) return;
    if (isLeaf || changeOnSelect) {
      const resolved = resolvePath(options, next);
      if (isLeaf) commit(resolved);
      else setCurrent(next);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as KeyboardEvent<HTMLDivElement>);
    if (event.defaultPrevented || disabled) return;
    if (!showPopup) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); }
      return;
    }
    if (query) {
      if (event.key === 'ArrowDown') { event.preventDefault(); setSearchIndex((index) => Math.min(index + 1, searchResults.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setSearchIndex((index) => Math.max(index - 1, 0)); }
      if (event.key === 'Enter' && searchResults[searchIndex]) { event.preventDefault(); commit(searchResults[searchIndex]); }
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      return;
    }
    const depth = Math.max(0, activePath.length - 1);
    const column = columns[depth] ?? options;
    const index = column.findIndex((item) => item.value === activePath[depth]);
    const moveWithin = (direction: 1 | -1) => {
      const enabled = column.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
      if (!enabled.length) return;
      const at = enabled.indexOf(index);
      const nextIndex = at < 0 ? enabled[0] : enabled[(at + direction + enabled.length) % enabled.length];
      setActivePath([...activePath.slice(0, depth), column[nextIndex].value]);
    };
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); moveWithin(1); break;
      case 'ArrowUp': event.preventDefault(); moveWithin(-1); break;
      case 'ArrowRight': {
        event.preventDefault();
        const option = column[index];
        const child = option?.children?.find((item) => !item.disabled);
        if (child) setActivePath([...activePath.slice(0, depth + 1), child.value]);
        break;
      }
      case 'ArrowLeft': event.preventDefault(); if (depth > 0) setActivePath(activePath.slice(0, depth)); break;
      case 'Enter': { event.preventDefault(); const option = column[index]; if (option) activate(depth, option); break; }
      case 'Escape': event.preventDefault(); setOpen(false); break;
      case 'Tab': setOpen(false); break;
    }
  };

  const labels = selectedOptions.map((item) => item.label);
  const hasValue = selectedOptions.length > 0;
  const display = hasValue ? (displayRender ? displayRender(labels, selectedOptions) : labels.join(' / ')) : placeholder;

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
      onClear={() => { setCurrent([]); setActivePath([]); }}
      className={cx('at-cascader', showSearch && 'at-cascader--searchable')}
      aria-haspopup="tree"
      aria-expanded={showPopup}
      aria-labelledby={labelId}
      aria-invalid={Boolean(error) || status === 'error' || undefined}
      onClick={() => { if (!disabled) setOpen(!open); }}
      onKeyDown={handleKeyDown}
    >
      {showSearch && showPopup
        ? <input ref={searchRef} className="at-selector__search" value={query} placeholder={hasValue ? labels.join(' / ') : placeholder} aria-label={label ? t('common.searchLabel', { label }) : t('common.searchOptions')} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} />
        : <span className={cx('at-selector__value', !hasValue && 'at-selector__placeholder')}>{display}</span>}
    </Selector>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} className={cx(`at-popup--${size}`, 'at-cascader__popup', popupClassName)} style={popupStyle}>
      {query ? <ul className="at-popup__list at-cascader__search-list" role="listbox" aria-label={t('common.searchResults')}>
        {searchResults.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
        {searchResults.map((path, index) => {
          const key = path.map((item) => item.value).join('/');
          const text = path.map((item) => item.label).join(' / ');
          return <li key={key} role="option" aria-selected={index === searchIndex} className={cx('at-option', index === searchIndex && 'at-option--active')} onMouseEnter={() => setSearchIndex(index)} onClick={() => commit(path)}>
            <span className="at-option__label">{highlightMatch(text, query)}</span>
          </li>;
        })}
      </ul> : <div className="at-cascader__columns">
        {columns.map((column, depth) => <ul key={depth} className="at-cascader__column" role="listbox" aria-label={t('cascader.level', { level: depth + 1 })}>
          {column.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
          {column.map((option) => {
            const active = activePath[depth] === option.value;
            const selected = current[depth] === option.value && current.length === depth + 1;
            const hasChildren = !(option.isLeaf ?? !option.children?.length);
            return <li
              key={option.value}
              role="option"
              aria-selected={current[depth] === option.value}
              aria-disabled={option.disabled || undefined}
              className={cx('at-option', 'at-cascader__option', active && 'at-option--active', (selected || current[depth] === option.value) && 'at-option--selected', option.disabled && 'at-option--disabled')}
              onClick={() => activate(depth, option)}
              onMouseEnter={expandTrigger === 'hover' && hasChildren ? () => activate(depth, option, true) : undefined}
            >
              <span className="at-option__label">{option.label}</span>
              {hasChildren ? <span className="at-cascader__arrow"><ChevronRight size={14} /></span> : <span className="at-option__check"><Check size={16} /></span>}
            </li>;
          })}
        </ul>)}
      </div>}
    </Popup>
  </FieldShell>;
});
