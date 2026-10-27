import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/input.css';
import { cx, type Size } from './utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: Size;
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', label, hint, error, prefix, suffix, clearable, value, defaultValue, onChange, disabled, className, id, ...props },
  ref,
) {
  const inputId = id ?? (label ? `at-input-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const currentValue = value == null ? uncontrolledValue : String(value);
  const hasValue = currentValue.length > 0;
  return (
    <div className={cx('at-field', className)}>
      {label && <label className="at-field__label" htmlFor={inputId}>{label}</label>}
      <div className={cx('at-input-wrap', `at-input-wrap--${size}`, error && 'at-input-wrap--error', disabled && 'at-input-wrap--disabled')}>
        {prefix && <span className="at-input-wrap__adornment">{prefix}</span>}
        <input {...props} id={inputId} ref={ref} className="at-input" value={value} defaultValue={value == null ? defaultValue : undefined} onChange={(event) => { if (value == null) setUncontrolledValue(event.target.value); onChange?.(event); }} disabled={disabled} aria-invalid={Boolean(error) || undefined} />
        {clearable && hasValue && !disabled && (
          <button type="button" className="at-input-wrap__clear" aria-label="清空输入" onClick={() => { if (value == null) setUncontrolledValue(''); onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>); }}>
            ×
          </button>
        )}
        {suffix && <span className="at-input-wrap__adornment">{suffix}</span>}
      </div>
      {error ? <span className="at-field__error" role="alert">{error}</span> : hint ? <span className="at-field__hint">{hint}</span> : null}
    </div>
  );
});
