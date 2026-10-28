import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/input.css';
import './styles/auto-complete.css';
import { FieldShell, highlightMatch } from './internal/Field';
import { Popup, scrollIntoViewIfNeeded, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { Close } from './internal/icons';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export interface AutoCompleteOption { value: string; label?: ReactNode; description?: ReactNode; disabled?: boolean }
export type AutoCompleteOptionInput = string | AutoCompleteOption;

export interface AutoCompleteProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'prefix'> {
  options: AutoCompleteOptionInput[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onSearch?: (query: string) => void;
  /** `true` filters by substring, `false` shows every option, or supply a predicate. */
  filterOption?: boolean | ((query: string, option: AutoCompleteOption) => boolean);
  highlight?: boolean;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  notFoundContent?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  popupMatchSelectWidth?: boolean;
  /** Wraps the rendered option list, e.g. to append a footer. */
  popupRender?: (menu: ReactNode) => ReactNode;
  optionRender?: (option: AutoCompleteOption, state: { active: boolean; query: string }) => ReactNode;
}

function normalize(option: AutoCompleteOptionInput): AutoCompleteOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  {
    options, value, defaultValue = '', onChange, onSelect, onSearch, filterOption = true, highlight = true,
    size = 'md', status, label, hint, error, allowClear = false, prefix, suffix, notFoundContent = null,
    open: openProp, defaultOpen = false, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, popupMatchSelectWidth = true, popupRender, optionRender,
    className, id, disabled, placeholder = '输入以搜索…', onFocus, onBlur, onKeyDown, ...inputProps
  }, ref,
) {
  const reactId = useId();
  const inputId = id ?? `at-autocomplete-${reactId}`;
  const listId = `${inputId}-listbox`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const normalized = useMemo(() => options.map(normalize), [options]);
  const visible = useMemo(() => {
    if (filterOption === false) return normalized;
    const query = current.trim();
    if (!query) return normalized;
    if (typeof filterOption === 'function') return normalized.filter((option) => filterOption(query, option));
    const lower = query.toLocaleLowerCase();
    return normalized.filter((option) => option.value.toLocaleLowerCase().includes(lower) || (typeof option.label === 'string' && option.label.toLocaleLowerCase().includes(lower)));
  }, [normalized, current, filterOption]);

  const resolvedStatus = status ?? (error ? 'error' : undefined);
  const showPopup = open && !disabled && (visible.length > 0 || notFoundContent != null);
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement, { matchWidth: popupMatchSelectWidth });
  useDismiss(showPopup, [anchorRef, panelRef], () => setOpen(false));
  useEffect(() => { if (!showPopup) setActiveIndex(-1); }, [showPopup]);
  useEffect(() => { scrollIntoViewIfNeeded(listRef.current, activeIndex); }, [activeIndex]);

  const commit = (option: AutoCompleteOption) => {
    if (option.disabled) return;
    setCurrent(option.value);
    onSelect?.(option.value, option);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const enabled = visible.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
    const step = (direction: 1 | -1) => {
      if (!enabled.length) return;
      const at = enabled.indexOf(activeIndex);
      const next = at < 0 ? (direction === 1 ? enabled[0] : enabled[enabled.length - 1]) : enabled[(at + direction + enabled.length) % enabled.length];
      setActiveIndex(next);
    };
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); if (!showPopup) setOpen(true); else step(1); break;
      case 'ArrowUp': event.preventDefault(); if (!showPopup) setOpen(true); else step(-1); break;
      case 'Enter': if (showPopup && activeIndex >= 0 && visible[activeIndex]) { event.preventDefault(); commit(visible[activeIndex]); } break;
      case 'Escape': if (showPopup) { event.preventDefault(); setOpen(false); } break;
      case 'Tab': setOpen(false); break;
    }
  };

  const menu = <ul ref={listRef} id={listId} className="at-popup__list at-autocomplete__list" role="listbox" aria-label={label ?? placeholder}>
    {visible.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
    {visible.map((option, index) => {
      const active = index === activeIndex;
      const selected = option.value === current;
      return <li
        key={option.value}
        id={`${listId}-${index}`}
        data-index={index}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        className={cx('at-option', active && 'at-option--active', selected && 'at-option--selected', option.disabled && 'at-option--disabled')}
        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
        onClick={() => commit(option)}
      >
        {optionRender ? optionRender(option, { active, query: current }) : <span className="at-option__label">
          {typeof option.label === 'string' && highlight ? highlightMatch(option.label, current.trim()) : option.label ?? option.value}
          {option.description && <small className="at-option__description">{option.description}</small>}
        </span>}
      </li>;
    })}
  </ul>;

  return <FieldShell label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
    <div ref={anchorRef} className={cx('at-input-wrap', `at-input-wrap--${size}`, 'at-autocomplete', resolvedStatus === 'error' && 'at-input-wrap--error', resolvedStatus === 'warning' && 'at-input-wrap--warning', disabled && 'at-input-wrap--disabled', showPopup && 'at-autocomplete--open')}>
      {prefix && <span className="at-input-wrap__adornment">{prefix}</span>}
      <input
        {...inputProps}
        id={inputId}
        ref={(node) => { inputRef.current = node; assignRef(ref, node); }}
        className="at-input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPopup}
        aria-controls={showPopup ? listId : undefined}
        aria-activedescendant={showPopup && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={resolvedStatus === 'error' || undefined}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={current}
        onChange={(event) => { setCurrent(event.target.value); onSearch?.(event.target.value); setActiveIndex(-1); if (!open) setOpen(true); }}
        onFocus={(event) => { onFocus?.(event); setOpen(true); }}
        onBlur={onBlur}
        onClick={() => { if (!open) setOpen(true); }}
        onKeyDown={handleKeyDown}
      />
      {allowClear && current && !disabled && <button type="button" className="at-input-wrap__clear at-autocomplete__clear" aria-label="清空输入" onMouseDown={(event) => event.preventDefault()} onClick={() => { setCurrent(''); onSearch?.(''); inputRef.current?.focus(); }}><Close size={12} /></button>}
      {suffix && <span className="at-input-wrap__adornment">{suffix}</span>}
    </div>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} className={cx(`at-popup--${size}`, 'at-autocomplete__popup', popupClassName)} style={popupStyle}>
      {popupRender ? popupRender(menu) : menu}
    </Popup>
  </FieldShell>;
});
