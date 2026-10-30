import { useLocale } from './locale';
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/select.css';
import { FieldShell, Selector, SelectorTag, highlightMatch } from './internal/Field';
import { Popup, scrollIntoViewIfNeeded, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { Check } from './internal/icons';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export interface SelectOption { label: string; value: string; disabled?: boolean; description?: ReactNode; icon?: ReactNode }
export interface SelectOptionGroup { label: string; options: SelectOption[] }
export type SelectValue = string | string[];

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'prefix'> {
  options: Array<SelectOption | SelectOptionGroup>;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  /** Collapse extra tags into a "+N" badge in multiple mode. */
  maxTagCount?: number;
  name?: string;
  prefix?: ReactNode;
  value?: SelectValue;
  defaultValue?: SelectValue;
  onChange?: (value: SelectValue, option: SelectOption | SelectOption[] | undefined) => void;
  onSearch?: (query: string) => void;
  filterOption?: boolean | ((query: string, option: SelectOption) => boolean);
  notFoundContent?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  popupMatchSelectWidth?: boolean;
  popupRender?: (menu: ReactNode) => ReactNode;
  optionRender?: (option: SelectOption, state: { active: boolean; selected: boolean; query: string }) => ReactNode;
  labelRender?: (option: SelectOption) => ReactNode;
}

type FlatItem = { kind: 'group'; label: string } | { kind: 'option'; option: SelectOption; index: number };

function isGroup(item: SelectOption | SelectOptionGroup): item is SelectOptionGroup {
  return 'options' in item;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    options, size = 'md', status, label, hint, error, placeholder: placeholderProp, searchable = false, multiple = false, disabled = false, allowClear = false, maxTagCount, name, prefix,
    value, defaultValue, onChange, onSearch, filterOption = true, notFoundContent: notFoundContentProp,
    open: openProp, defaultOpen = false, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, popupMatchSelectWidth = true, popupRender, optionRender, labelRender,
    className, id, onKeyDown, onBlur, onFocus, ...rest
  }, ref,
) {
  const { t } = useLocale();
  const placeholder = placeholderProp === undefined ? t('common.select') : placeholderProp;
  const notFoundContent = notFoundContentProp === undefined ? t('common.noOptions') : notFoundContentProp;

  const reactId = useId();
  const triggerId = id ?? `at-select-${reactId}`;
  const listId = `${triggerId}-listbox`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const fallback = useMemo<SelectValue>(() => (multiple ? [] : ''), [multiple]);
  const [current, setCurrent] = useControllableState<SelectValue>(value, defaultValue ?? fallback, (next) => onChange?.(next, lookup(next)));
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const flatOptions = useMemo(() => options.flatMap((item) => (isGroup(item) ? item.options : [item])), [options]);
  const byValue = useMemo(() => new Map(flatOptions.map((option) => [option.value, option])), [flatOptions]);
  function lookup(next: SelectValue) {
    return Array.isArray(next) ? next.map((item) => byValue.get(item)).filter((item): item is SelectOption => Boolean(item)) : byValue.get(next);
  }
  const selectedValues = useMemo(() => (Array.isArray(current) ? current : current ? [current] : []), [current]);
  const matches = (option: SelectOption) => {
    if (filterOption === false || !query) return true;
    if (typeof filterOption === 'function') return filterOption(query, option);
    return option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  };
  const items = useMemo<FlatItem[]>(() => {
    const result: FlatItem[] = [];
    let index = 0;
    options.forEach((item) => {
      if (isGroup(item)) {
        const visible = item.options.filter(matches);
        if (!visible.length) return;
        result.push({ kind: 'group', label: item.label });
        visible.forEach((option) => result.push({ kind: 'option', option, index: index++ }));
      } else if (matches(item)) {
        result.push({ kind: 'option', option: item, index: index++ });
      }
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query, filterOption]);
  const visibleOptions = useMemo(() => items.filter((item): item is Extract<FlatItem, { kind: 'option' }> => item.kind === 'option').map((item) => item.option), [items]);

  const showPopup = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement, { matchWidth: popupMatchSelectWidth });
  useDismiss(showPopup, [anchorRef, panelRef], () => setOpen(false));

  useEffect(() => {
    if (!showPopup) { setQuery(''); setActiveIndex(-1); return; }
    const firstSelected = visibleOptions.findIndex((option) => selectedValues.includes(option.value));
    setActiveIndex(firstSelected >= 0 ? firstSelected : visibleOptions.findIndex((option) => !option.disabled));
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);
  useEffect(() => { scrollIntoViewIfNeeded(listRef.current, activeIndex); }, [activeIndex]);

  const toggle = (option: SelectOption) => {
    if (option.disabled) return;
    if (multiple) {
      const next = selectedValues.includes(option.value) ? selectedValues.filter((item) => item !== option.value) : [...selectedValues, option.value];
      setCurrent(next);
      setQuery('');
      searchRef.current?.focus();
    } else {
      setCurrent(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };
  const clear = () => { setCurrent(fallback); setQuery(''); };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as KeyboardEvent<HTMLDivElement>);
    if (event.defaultPrevented || disabled) return;
    const enabled = visibleOptions.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
    const step = (direction: 1 | -1) => {
      if (!enabled.length) return;
      const at = enabled.indexOf(activeIndex);
      setActiveIndex(at < 0 ? (direction === 1 ? enabled[0] : enabled[enabled.length - 1]) : enabled[(at + direction + enabled.length) % enabled.length]);
    };
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); if (!showPopup) setOpen(true); else step(1); break;
      case 'ArrowUp': event.preventDefault(); if (!showPopup) setOpen(true); else step(-1); break;
      case 'Home': if (showPopup && enabled.length) { event.preventDefault(); setActiveIndex(enabled[0]); } break;
      case 'End': if (showPopup && enabled.length) { event.preventDefault(); setActiveIndex(enabled[enabled.length - 1]); } break;
      case 'Enter':
      case ' ':
        if (event.key === ' ' && searchable && showPopup) return;
        event.preventDefault();
        if (!showPopup) setOpen(true);
        else if (visibleOptions[activeIndex]) toggle(visibleOptions[activeIndex]);
        break;
      case 'Escape': if (showPopup) { event.preventDefault(); setOpen(false); } break;
      case 'Backspace': if (multiple && !query && selectedValues.length && (searchable || event.currentTarget === triggerRef.current)) { setCurrent(selectedValues.slice(0, -1)); } break;
      case 'Tab': setOpen(false); break;
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (anchorRef.current?.contains(event.relatedTarget as Node) || panelRef.current?.contains(event.relatedTarget as Node)) return;
    onBlur?.(event);
  };

  const selectedOptions = lookup(current);
  const renderLabel = (option: SelectOption) => (labelRender ? labelRender(option) : option.label);
  const hasValue = selectedValues.length > 0;

  let display: ReactNode;
  if (multiple) {
    const list = selectedOptions as SelectOption[];
    const shown = maxTagCount != null ? list.slice(0, maxTagCount) : list;
    const extra = list.length - shown.length;
    display = <span className="at-selector__tags">
      {shown.map((option) => <SelectorTag key={option.value} label={renderLabel(option)} disabled={disabled} onRemove={() => toggle(option)} />)}
      {extra > 0 && <span className="at-selector__tag at-selector__tag--count">+{extra}</span>}
      {searchable && showPopup
        ? <input ref={searchRef} className="at-selector__search" value={query} placeholder={hasValue ? '' : placeholder} aria-label={label ? t('common.searchLabel', { label }) : t('common.searchOptions')} aria-autocomplete="list" aria-controls={listId} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} onChange={(event) => { setQuery(event.target.value); onSearch?.(event.target.value); setActiveIndex(0); }} onKeyDown={handleKeyDown} />
        : !hasValue && <span className="at-selector__placeholder">{placeholder}</span>}
    </span>;
  } else {
    const option = selectedOptions as SelectOption | undefined;
    display = searchable && showPopup
      ? <input ref={searchRef} className="at-selector__search" value={query} placeholder={option ? option.label : placeholder} aria-label={label ? t('common.searchLabel', { label }) : t('common.searchOptions')} aria-autocomplete="list" aria-controls={listId} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} onChange={(event) => { setQuery(event.target.value); onSearch?.(event.target.value); setActiveIndex(0); }} onKeyDown={handleKeyDown} />
      : <span className={cx('at-selector__value', !option && 'at-selector__placeholder')}>{option ? <>{option.icon && <span className="at-select__option-icon">{option.icon}</span>}{renderLabel(option)}</> : placeholder}</span>;
  }

  const menu = <ul ref={listRef} id={listId} className="at-popup__list at-select__list" role="listbox" aria-multiselectable={multiple || undefined} aria-labelledby={labelId}>
    {visibleOptions.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
    {items.map((item) => {
      if (item.kind === 'group') return <li key={`group-${item.label}`} className="at-popup__group" role="presentation">{item.label}</li>;
      const { option, index } = item;
      const active = index === activeIndex;
      const selected = selectedValues.includes(option.value);
      return <li
        key={option.value}
        id={`${listId}-${index}`}
        data-index={index}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        className={cx('at-option', active && 'at-option--active', selected && 'at-option--selected', option.disabled && 'at-option--disabled')}
        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
        onClick={() => toggle(option)}
      >
        {optionRender ? optionRender(option, { active, selected, query }) : <>
          {option.icon && <span className="at-select__option-icon">{option.icon}</span>}
          <span className="at-option__label">{highlightMatch(option.label, query)}{option.description && <small className="at-option__description">{option.description}</small>}</span>
          <span className="at-option__check"><Check size={16} /></span>
        </>}
      </li>;
    })}
  </ul>;

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
      onClear={clear}
      prefix={prefix}
      className={cx('at-select', multiple && 'at-select--multiple', searchable && 'at-select--searchable')}
      aria-haspopup="listbox"
      aria-expanded={showPopup}
      aria-controls={showPopup ? listId : undefined}
      aria-labelledby={labelId}
      aria-activedescendant={showPopup && activeIndex >= 0 && !searchable ? `${listId}-${activeIndex}` : undefined}
      aria-invalid={Boolean(error) || status === 'error' || undefined}
      onClick={() => { if (!disabled) setOpen(!open); }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onFocus={onFocus}
    >
      {display}
      {name && selectedValues.map((item) => <input key={item} type="hidden" name={name} value={item} />)}
    </Selector>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} className={cx(`at-popup--${size}`, 'at-select__popup', popupClassName)} style={popupStyle}>
      {popupRender ? popupRender(menu) : menu}
    </Popup>
  </FieldShell>;
});
