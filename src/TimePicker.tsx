import { useLocale } from './locale';
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/time-picker.css';
import { FieldShell, Selector } from './internal/Field';
import { Popup, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { Clock } from './internal/icons';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export type TimeFormat = 'HH:mm' | 'HH:mm:ss';
export interface TimeParts { hour: number; minute: number; second: number }

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'prefix'> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, parts: TimeParts | null) => void;
  format?: TimeFormat;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  /** Inclusive "HH:mm" bounds; a quick alternative to the disabled* callbacks. */
  minTime?: string;
  maxTime?: string;
  placeholder?: string;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showNow?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const [hour, minute, second = 0] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { hour, minute, second };
}

export function formatTime(parts: TimeParts, format: TimeFormat = 'HH:mm') {
  return format === 'HH:mm:ss' ? `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}` : `${pad(parts.hour)}:${pad(parts.minute)}`;
}

const range = (count: number, step: number) => Array.from({ length: Math.ceil(count / step) }, (_, index) => index * step);

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
  {
    value, defaultValue = null, onChange, format = 'HH:mm', hourStep = 1, minuteStep = 1, secondStep = 1, disabledHours, disabledMinutes, disabledSeconds, minTime, maxTime,
    placeholder: placeholderProp, size = 'md', status, label, hint, error, disabled = false, allowClear = true, showNow = true,
    open: openProp, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, className, id, onKeyDown, ...rest
  }, ref,
) {
  const { t } = useLocale();
  const placeholder = placeholderProp === undefined ? t('time.placeholder') : placeholderProp;

  const reactId = useId();
  const triggerId = id ?? `at-time-picker-${reactId}`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue, (next) => onChange?.(next, parseTime(next)));
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const parts = useMemo(() => parseTime(current), [current]);
  const [draft, setDraft] = useState<TimeParts>(() => parts ?? { hour: 0, minute: 0, second: 0 });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const columnRefs = useRef<Array<HTMLUListElement | null>>([]);

  const showPopup = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement);
  useDismiss(showPopup, [anchorRef, panelRef], () => setOpen(false));

  const bounds = useMemo(() => ({ min: parseTime(minTime), max: parseTime(maxTime) }), [minTime, maxTime]);
  const toSeconds = (p: TimeParts) => p.hour * 3600 + p.minute * 60 + p.second;
  const outOfBounds = (p: TimeParts) => (bounds.min && toSeconds(p) < toSeconds(bounds.min)) || (bounds.max && toSeconds(p) > toSeconds(bounds.max));

  const isHourDisabled = (hour: number) => disabledHours?.().includes(hour) || Boolean((bounds.min && hour < bounds.min.hour) || (bounds.max && hour > bounds.max.hour));
  const isMinuteDisabled = (hour: number, minute: number) => disabledMinutes?.(hour).includes(minute) || Boolean(outOfBounds({ hour, minute, second: 0 }) && outOfBounds({ hour, minute, second: 59 }));
  const isSecondDisabled = (hour: number, minute: number, second: number) => disabledSeconds?.(hour, minute).includes(second) || Boolean(outOfBounds({ hour, minute, second }));

  useEffect(() => {
    if (!showPopup) return;
    setDraft(parts ?? { hour: 0, minute: 0, second: 0 });
    requestAnimationFrame(() => columnRefs.current.forEach((column) => {
      const selected = column?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (column && selected) column.scrollTop = selected.offsetTop - column.clientHeight / 2 + selected.offsetHeight / 2;
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  const commit = (next: TimeParts, close = false) => {
    setDraft(next);
    setCurrent(formatTime(next, format));
    if (close) { setOpen(false); triggerRef.current?.focus(); }
  };
  const setNow = () => {
    const now = new Date();
    commit({ hour: now.getHours(), minute: now.getMinutes(), second: format === 'HH:mm:ss' ? now.getSeconds() : 0 }, true);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); if (!showPopup) setOpen(true); else if (event.key === 'Enter') { commit(draft, true); } }
    if (event.key === 'Escape' && showPopup) { event.preventDefault(); setOpen(false); }
    if (event.key === 'Backspace' && allowClear && current) { setCurrent(null); }
  };

  const columns: Array<{ key: keyof TimeParts; label: string; values: number[]; isDisabled: (v: number) => boolean }> = [
    { key: 'hour', label: t('time.hour'), values: range(24, hourStep), isDisabled: isHourDisabled },
    { key: 'minute', label: t('time.minute'), values: range(60, minuteStep), isDisabled: (minute) => isMinuteDisabled(draft.hour, minute) },
  ];
  if (format === 'HH:mm:ss') columns.push({ key: 'second', label: t('time.second'), values: range(60, secondStep), isDisabled: (second) => isSecondDisabled(draft.hour, draft.minute, second) });

  const onColumnKeyDown = (column: typeof columns[number]) => (event: KeyboardEvent<HTMLUListElement>) => {
    const enabled = column.values.filter((item) => !column.isDisabled(item));
    const at = enabled.indexOf(draft[column.key]);
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = enabled[Math.min(at + 1, enabled.length - 1)];
    if (event.key === 'ArrowUp') next = enabled[Math.max(at - 1, 0)];
    if (event.key === 'Home') next = enabled[0];
    if (event.key === 'End') next = enabled[enabled.length - 1];
    if (event.key === 'Enter') { event.preventDefault(); commit(draft, true); return; }
    if (next == null) return;
    event.preventDefault();
    commit({ ...draft, [column.key]: next });
  };

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
      hasValue={Boolean(current)}
      allowClear={allowClear}
      onClear={() => setCurrent(null)}
      suffix={<Clock size={16} />}
      className="at-time-picker"
      aria-haspopup="dialog"
      aria-expanded={showPopup}
      aria-labelledby={labelId}
      aria-invalid={Boolean(error) || status === 'error' || undefined}
      onClick={() => { if (!disabled) setOpen(!open); }}
      onKeyDown={handleKeyDown}
    >
      <span className={cx('at-selector__value', !current && 'at-selector__placeholder')}>{parts ? formatTime(parts, format) : placeholder}</span>
    </Selector>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} role="dialog" aria-label={label ?? placeholder} className={cx('at-time-picker__popup', popupClassName)} style={popupStyle}>
      <div className="at-time-picker__columns">
        {columns.map((column, columnIndex) => <ul
          key={column.key}
          ref={(node) => { columnRefs.current[columnIndex] = node; }}
          className="at-time-picker__column"
          role="listbox"
          aria-label={column.label}
          tabIndex={0}
          onKeyDown={onColumnKeyDown(column)}
        >
          {column.values.map((item) => {
            const selected = draft[column.key] === item;
            const isDisabled = column.isDisabled(item);
            return <li
              key={item}
              role="option"
              aria-selected={selected}
              aria-disabled={isDisabled || undefined}
              className={cx('at-time-picker__cell', selected && 'at-time-picker__cell--selected', isDisabled && 'at-time-picker__cell--disabled')}
              onClick={() => { if (!isDisabled) commit({ ...draft, [column.key]: item }); }}
            >{pad(item)}</li>;
          })}
        </ul>)}
      </div>
      <div className="at-popup__footer at-time-picker__footer">
        {showNow ? <button type="button" className="at-time-picker__link" onClick={setNow}>{t('time.now')}</button> : <span />}
        <button type="button" className="at-time-picker__ok" onClick={() => commit(draft, true)}>{t('common.ok')}</button>
      </div>
    </Popup>
  </FieldShell>;
});
