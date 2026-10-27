import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/date-picker.css';
import { cx } from './utils';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function DatePicker({ label, hint, error, id, className, ...props }: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? `at-date-${generatedId}`;
  const helpId = `${inputId}-help`;
  return <div className={cx('at-date-picker', className)}>{label && <label className="at-date-picker__label" htmlFor={inputId}>{label}</label>}<input {...props} id={inputId} type="date" className={cx('at-date-picker__input', Boolean(error) && 'at-date-picker__input--error')} aria-invalid={Boolean(error) || undefined} aria-describedby={hint || error ? helpId : undefined} />{(hint || error) && <span id={helpId} className={cx('at-date-picker__help', Boolean(error) && 'at-date-picker__help--error')}>{error ?? hint}</span>}</div>;
}
