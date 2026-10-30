import { useLocale } from '../locale';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import '../styles/theme.css';
import '../styles/field.css';
import '../styles/selector.css';
import { cx, type Size, type Status } from '../utils';
import { ChevronDown, Close } from './icons';

export interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  labelId?: string;
  className?: string;
  children: ReactNode;
}

/** Label / hint / error wrapper shared by every form control. */
export function FieldShell({ label, hint, error, htmlFor, labelId, className, children }: FieldShellProps) {
  return <div className={cx('at-field', className)}>
    {label && <label className="at-field__label" id={labelId} htmlFor={htmlFor}>{label}</label>}
    {children}
    {error ? <span className="at-field__error" role="alert">{error}</span> : hint ? <span className="at-field__hint">{hint}</span> : null}
  </div>;
}

export interface SelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'prefix'> {
  size?: Size;
  status?: Status;
  open?: boolean;
  disabled?: boolean;
  hasValue?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearLabel?: string;
  children: ReactNode;
}

/** Visual trigger box used by Select, Cascader, TreeSelect, TimePicker and ColorPicker. */
export const Selector = forwardRef<HTMLDivElement, SelectorProps>(function Selector(
  { size = 'md', status, open = false, disabled = false, hasValue = false, allowClear = false, onClear, prefix, suffix, clearLabel: clearLabelProp, className, children, ...props }, ref,
) {
  const { t } = useLocale();
  const clearLabel = clearLabelProp === undefined ? t('common.clear') : clearLabelProp;

  return <div
    {...props}
    ref={ref}
    className={cx('at-selector', `at-selector--${size}`, open && 'at-selector--open', disabled && 'at-selector--disabled', status && `at-selector--${status}`, className)}
    aria-disabled={disabled || undefined}
  >
    {prefix && <span className="at-selector__adornment">{prefix}</span>}
    {children}
    {allowClear && hasValue && !disabled && <button type="button" tabIndex={-1} className="at-selector__clear" aria-label={clearLabel} onMouseDown={(event) => event.preventDefault()} onClick={(event) => { event.stopPropagation(); onClear?.(); }}><Close size={12} /></button>}
    <span className="at-selector__arrow" aria-hidden="true">{suffix ?? <ChevronDown size={16} />}</span>
  </div>;
});

export interface SelectorTagProps { label: ReactNode; disabled?: boolean; onRemove?: () => void; removeLabel?: string }
export function SelectorTag({ label, disabled, onRemove, removeLabel: removeLabelProp }: SelectorTagProps) {
  const { t } = useLocale();
  const removeLabel = removeLabelProp === undefined ? t('common.remove') : removeLabelProp;

  return <span className="at-selector__tag">
    <span className="at-selector__tag-label">{label}</span>
    {onRemove && !disabled && <button type="button" tabIndex={-1} className="at-selector__tag-remove" aria-label={`${removeLabel} ${typeof label === 'string' ? label : ''}`.trim()} onMouseDown={(event) => event.preventDefault()} onClick={(event) => { event.stopPropagation(); onRemove(); }}><Close size={10} /></button>}
  </span>;
}

export function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index < 0) return text;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}
