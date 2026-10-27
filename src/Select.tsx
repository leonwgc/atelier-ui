import { forwardRef, useMemo, type SelectHTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/select.css';
import { cx, type Size } from './utils';

export interface SelectOption { label: string; value: string; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
  options: SelectOption[];
  size?: Size;
  label?: string;
  hint?: string;
  error?: string;
  searchable?: boolean;
  multiple?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[], event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, size = 'md', label, hint, error, searchable = false, multiple = false, className, id, onChange, value, defaultValue, ...props }, ref,
) {
  const selectId = id ?? (label ? `at-select-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined);
  const normalizedValue = Array.isArray(value) ? value : value == null ? undefined : String(value);
  const normalizedDefault = Array.isArray(defaultValue) ? defaultValue : defaultValue == null ? undefined : String(defaultValue);
  const searchId = `${selectId ?? 'at-select'}-search`;
  const renderedOptions = searchable ? options : options;
  const optionCount = useMemo(() => renderedOptions.length, [renderedOptions.length]);
  return (
    <div className={cx('at-field', className)}>
      {label && <label className="at-field__label" htmlFor={searchable ? searchId : selectId}>{label}</label>}
      <div className={cx('at-select-wrap', `at-select-wrap--${size}`, error && 'at-select-wrap--error')}>
        {searchable && <input id={searchId} className="at-select-search" placeholder="搜索选项…" aria-label={`${label ?? '选项'}搜索`} onChange={(event) => {
          const select = event.currentTarget.parentElement?.querySelector('select');
          if (select) {
            const query = event.currentTarget.value.toLowerCase();
            Array.from(select.options).forEach((option) => { option.hidden = !option.text.toLowerCase().includes(query) && option.value !== ''; });
          }
        }} />}
        <select
          {...props}
          ref={ref}
          id={selectId}
          className={cx('at-select', searchable && 'at-select--searchable')}
          multiple={multiple}
          value={normalizedValue as string | string[] | undefined}
          defaultValue={normalizedDefault as string | string[] | undefined}
          onChange={(event) => {
            const selected = multiple ? Array.from(event.currentTarget.selectedOptions, (option) => option.value) : event.currentTarget.value;
            onChange?.(selected, event);
          }}
          aria-invalid={Boolean(error) || undefined}
          size={multiple ? Math.min(Math.max(optionCount, 2), 5) : undefined}
        >
          {!multiple && <option value="">请选择…</option>}
          {renderedOptions.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        {!multiple && <span className="at-select-chevron" aria-hidden="true">⌄</span>}
      </div>
      {error ? <span className="at-field__error" role="alert">{error}</span> : hint ? <span className="at-field__hint">{hint}</span> : null}
    </div>
  );
});
