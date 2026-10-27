import { forwardRef, type TextareaHTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/textarea.css';
import { cx } from './utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, className, id, ...props }, ref) {
  const textareaId = id ?? (label ? `at-textarea-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={cx('at-field', className)}>
      {label && <label className="at-field__label" htmlFor={textareaId}>{label}</label>}
      <textarea {...props} id={textareaId} ref={ref} className={cx('at-textarea', error && 'at-textarea--error')} aria-invalid={Boolean(error) || undefined} />
      {error ? <span className="at-field__error" role="alert">{error}</span> : hint ? <span className="at-field__hint">{hint}</span> : null}
    </div>
  );
});
