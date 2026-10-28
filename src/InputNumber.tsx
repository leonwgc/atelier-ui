import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/input.css';
import './styles/input-number.css';
import { FieldShell } from './internal/Field';
import { ChevronDown, Minus, Plus } from './internal/icons';
import { assignRef, clamp, cx, useControllableState, type Size, type Status } from './utils';

export interface InputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'min' | 'max' | 'step'> {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Fixed number of decimals; inferred from `step` when omitted. */
  precision?: number;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** `'stacked'` shows up/down arrows on the right, `'inline'` places − / + on both ends. */
  controls?: boolean | 'stacked' | 'inline';
  keyboard?: boolean;
  formatter?: (value: number) => string;
  parser?: (text: string) => number | null;
}

function decimalsOf(value: number) {
  const text = String(value);
  const index = text.indexOf('.');
  return index < 0 ? 0 : text.length - index - 1;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value, defaultValue = null, onChange, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, step = 1, precision,
    size = 'md', status, label, hint, error, prefix, suffix, controls = 'stacked', keyboard = true, formatter, parser,
    className, id, disabled, readOnly, onBlur, onFocus, onKeyDown, placeholder, ...inputProps
  }, ref,
) {
  const reactId = useId();
  const inputId = id ?? `at-input-number-${reactId}`;
  const [current, setCurrent] = useControllableState<number | null>(value, defaultValue, onChange);
  const resolvedPrecision = precision ?? decimalsOf(step);
  const format = (next: number | null) => (next == null ? '' : formatter ? formatter(next) : next.toFixed(resolvedPrecision));
  const [text, setText] = useState(() => format(current));
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (!focused) setText(format(current)); // eslint-disable-line react-hooks/exhaustive-deps
  }, [current, focused, resolvedPrecision]);

  const normalize = (raw: number | null) => {
    if (raw == null || Number.isNaN(raw)) return null;
    const clamped = clamp(raw, min, max);
    return Number(clamped.toFixed(resolvedPrecision));
  };
  const parse = (raw: string): number | null => {
    if (parser) return parser(raw);
    const cleaned = raw.replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const commitText = (raw: string) => {
    const next = normalize(parse(raw));
    setCurrent(next);
    setText(format(next));
  };
  const bump = (direction: 1 | -1) => {
    if (disabled || readOnly) return;
    const base = current ?? (Number.isFinite(min) && min > 0 ? min : 0);
    const next = normalize(base + direction * step);
    setCurrent(next);
    setText(format(next));
  };
  const stopHold = () => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; } };
  const startHold = (direction: 1 | -1) => {
    bump(direction);
    const repeat = (delay: number) => { holdTimer.current = setTimeout(() => { bump(direction); repeat(Math.max(40, delay * 0.85)); }, delay); };
    repeat(400);
  };
  useEffect(() => stopHold, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !keyboard) return;
    if (event.key === 'ArrowUp') { event.preventDefault(); bump(1); }
    if (event.key === 'ArrowDown') { event.preventDefault(); bump(-1); }
    if (event.key === 'Enter') commitText(event.currentTarget.value);
  };

  const canDecrease = !disabled && !readOnly && (current == null || current > min);
  const canIncrease = !disabled && !readOnly && (current == null || current < max);
  const resolvedStatus = status ?? (error ? 'error' : undefined);
  const mode = controls === true ? 'stacked' : controls;

  const stepButton = (direction: 1 | -1, icon: ReactNode, extraClass: string) => <button
    type="button"
    tabIndex={-1}
    className={cx('at-input-number__step', extraClass)}
    aria-label={direction === 1 ? '增加' : '减少'}
    disabled={direction === 1 ? !canIncrease : !canDecrease}
    onPointerDown={(event) => { event.preventDefault(); startHold(direction); }}
    onPointerUp={stopHold}
    onPointerLeave={stopHold}
    onPointerCancel={stopHold}
  >{icon}</button>;

  return <FieldShell label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
    <div className={cx('at-input-wrap', `at-input-wrap--${size}`, 'at-input-number', mode && `at-input-number--${mode}`, resolvedStatus === 'error' && 'at-input-wrap--error', resolvedStatus === 'warning' && 'at-input-wrap--warning', disabled && 'at-input-wrap--disabled')}>
      {mode === 'inline' && stepButton(-1, <Minus size={14} />, 'at-input-number__step--inline')}
      {prefix && <span className="at-input-wrap__adornment">{prefix}</span>}
      <input
        {...inputProps}
        id={inputId}
        ref={(node) => { inputRef.current = node; assignRef(ref, node); }}
        className="at-input at-input-number__input"
        type="text"
        inputMode={resolvedPrecision > 0 ? 'decimal' : 'numeric'}
        role="spinbutton"
        aria-valuenow={current ?? undefined}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-invalid={resolvedStatus === 'error' || undefined}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); commitText(event.target.value); onBlur?.(event); }}
        onKeyDown={handleKeyDown}
      />
      {suffix && <span className="at-input-wrap__adornment">{suffix}</span>}
      {mode === 'inline' && stepButton(1, <Plus size={14} />, 'at-input-number__step--inline')}
      {mode === 'stacked' && <span className="at-input-number__handlers">
        {stepButton(1, <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} />, '')}
        {stepButton(-1, <ChevronDown size={12} />, '')}
      </span>}
    </div>
  </FieldShell>;
});
