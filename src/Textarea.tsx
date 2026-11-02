import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
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
  const generatedId = useId();
  const textareaId = id ?? `at-textarea-${generatedId}`;
  const descriptionId = error || hint ? `${textareaId}-description` : undefined;
  const describedBy = [props['aria-describedby'], descriptionId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('at-field', className)}>
      {label && <label className="at-field__label" htmlFor={textareaId}>{label}</label>}
      <textarea {...props} id={textareaId} ref={ref} className={cx('at-textarea', error && 'at-textarea--error')} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} />
      {error ? <span id={descriptionId} className="at-field__error" role="alert">{error}</span> : hint ? <span id={descriptionId} className="at-field__hint">{hint}</span> : null}
    </div>
  );
});
