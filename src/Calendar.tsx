import { useLocale } from './locale';
import { useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/calendar.css';
import { ChevronLeft, ChevronRight } from './internal/icons';
import { cx, useControllableState } from './utils';

export type CalendarMode = 'month' | 'year';
export interface CalendarCellInfo { type: 'date' | 'month'; today: boolean; selected: boolean; outside: boolean; disabled: boolean }

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect' | 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Fires when the visible month or the panel mode changes. */
  onPanelChange?: (date: Date, mode: CalendarMode) => void;
  onSelect?: (date: Date, info: { source: 'date' | 'month' | 'today' | 'keyboard' }) => void;
  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  /** Large cells with room for extra content; `false` renders a compact card. */
  fullscreen?: boolean;
  /** Extra content inside a cell (events, badges). */
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  disabledDate?: (date: Date) => boolean;
  validRange?: [Date, Date];
  /** 0 = Sunday, 1 = Monday. */
  firstDayOfWeek?: 0 | 1;
  weekdayLabels?: string[];
  showToday?: boolean;
  headerRender?: (info: { value: Date; mode: CalendarMode; onChange: (date: Date) => void; onModeChange: (mode: CalendarMode) => void }) => ReactNode;
}

const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate()));
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

export function Calendar({
  value, defaultValue, onChange, onPanelChange, onSelect, mode: modeProp, defaultMode = 'month', fullscreen = true, cellRender, disabledDate, validRange, firstDayOfWeek = 1, weekdayLabels: weekdayLabelsProp, showToday = true, headerRender, className, ...props
}: CalendarProps) {
  const { t, formatLocale } = useLocale();
  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(formatLocale, options).format(date);
  const monthNames = Array.from({ length: 12 }, (_, month) => formatDate(new Date(2024, month, 1), { month: 'long' }));
  const weekdayLabels = weekdayLabelsProp ?? Array.from({ length: 7 }, (_, day) => formatDate(new Date(2024, 0, 7 + day), { weekday: formatLocale.startsWith('zh') ? 'narrow' : 'short' }));
  const id = useId();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selected, setSelected] = useControllableState<Date>(value, defaultValue ?? today, onChange);
  const [mode, setMode] = useControllableState<CalendarMode>(modeProp, defaultMode, undefined);
  const [viewing, setViewing] = useState<Date>(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [focused, setFocused] = useState<Date>(selected);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef(false);

  useEffect(() => { if (!isSameMonth(viewing, selected)) setViewing(new Date(selected.getFullYear(), selected.getMonth(), 1)); setFocused(selected); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  });

  const isDisabled = (date: Date) => {
    if (validRange && (startOfDay(date) < startOfDay(validRange[0]) || startOfDay(date) > startOfDay(validRange[1]))) return true;
    return disabledDate?.(date) ?? false;
  };
  const changePanel = (date: Date, nextMode: CalendarMode = mode) => {
    setViewing(new Date(date.getFullYear(), date.getMonth(), 1));
    if (nextMode !== mode) setMode(nextMode);
    onPanelChange?.(date, nextMode);
  };
  const select = (date: Date, source: 'date' | 'month' | 'today' | 'keyboard') => {
    if (isDisabled(date)) return;
    setSelected(date);
    setFocused(date);
    onSelect?.(date, { source });
    if (!isSameMonth(date, viewing)) changePanel(date);
  };

  const weeks = useMemo(() => {
    const first = new Date(viewing.getFullYear(), viewing.getMonth(), 1);
    const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
    const start = addDays(first, -offset);
    return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
  }, [viewing, firstDayOfWeek]);
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayLabels[(index + firstDayOfWeek) % 7]);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: Date | null = null;
    if (mode === 'month') {
      switch (event.key) {
        case 'ArrowLeft': next = addDays(focused, -1); break;
        case 'ArrowRight': next = addDays(focused, 1); break;
        case 'ArrowUp': next = addDays(focused, -7); break;
        case 'ArrowDown': next = addDays(focused, 7); break;
        case 'Home': next = addDays(focused, -((focused.getDay() - firstDayOfWeek + 7) % 7)); break;
        case 'End': next = addDays(focused, 6 - ((focused.getDay() - firstDayOfWeek + 7) % 7)); break;
        case 'PageUp': next = addMonths(focused, event.shiftKey ? -12 : -1); break;
        case 'PageDown': next = addMonths(focused, event.shiftKey ? 12 : 1); break;
        case 'Enter': case ' ': event.preventDefault(); select(focused, 'keyboard'); return;
      }
    } else {
      switch (event.key) {
        case 'ArrowLeft': next = addMonths(focused, -1); break;
        case 'ArrowRight': next = addMonths(focused, 1); break;
        case 'ArrowUp': next = addMonths(focused, -3); break;
        case 'ArrowDown': next = addMonths(focused, 3); break;
        case 'PageUp': next = addMonths(focused, -12); break;
        case 'PageDown': next = addMonths(focused, 12); break;
        case 'Enter': case ' ': event.preventDefault(); changePanel(focused, 'month'); pendingFocus.current = true; return;
      }
    }
    if (!next) return;
    event.preventDefault();
    setFocused(next);
    pendingFocus.current = true;
    if (mode === 'month' ? !isSameMonth(next, viewing) : next.getFullYear() !== viewing.getFullYear()) changePanel(next);
  };

  const header = headerRender ? headerRender({ value: viewing, mode, onChange: changePanel, onModeChange: (next) => changePanel(viewing, next) }) : <header className="at-calendar__header">
    <div className="at-calendar__nav">
      <button type="button" className="at-calendar__nav-button" aria-label={t('calendar.previousYear')} onClick={() => changePanel(addMonths(viewing, -12))}><ChevronLeft size={16} /><ChevronLeft size={16} className="at-calendar__nav-double" /></button>
      {mode === 'month' && <button type="button" className="at-calendar__nav-button" aria-label={t('calendar.previousMonth')} onClick={() => changePanel(addMonths(viewing, -1))}><ChevronLeft size={16} /></button>}
      <strong id={`${id}-label`} className="at-calendar__label" aria-live="polite">{t(mode === 'month' ? 'calendar.monthTitle' : 'calendar.yearTitle', { year: viewing.getFullYear(), month: formatLocale.startsWith('zh') ? viewing.getMonth() + 1 : formatDate(viewing, { month: 'long' }) })}</strong>
      {mode === 'month' && <button type="button" className="at-calendar__nav-button" aria-label={t('calendar.nextMonth')} onClick={() => changePanel(addMonths(viewing, 1))}><ChevronRight size={16} /></button>}
      <button type="button" className="at-calendar__nav-button" aria-label={t('calendar.nextYear')} onClick={() => changePanel(addMonths(viewing, 12))}><ChevronRight size={16} /><ChevronRight size={16} className="at-calendar__nav-double" /></button>
    </div>
    <div className="at-calendar__actions">
      {showToday && <button type="button" className="at-calendar__today" onClick={() => { select(today, 'today'); changePanel(today, 'month'); }}>{t('calendar.today')}</button>}
      <div className="at-calendar__mode" role="radiogroup" aria-label={t('calendar.view')}>
        {(['month', 'year'] as CalendarMode[]).map((item) => <button key={item} type="button" role="radio" aria-checked={mode === item} className={cx('at-calendar__mode-option', mode === item && 'at-calendar__mode-option--active')} onClick={() => changePanel(viewing, item)}>{t(item === 'month' ? 'calendar.month' : 'calendar.year')}</button>)}
      </div>
    </div>
  </header>;

  return <div {...props} className={cx('at-calendar', fullscreen ? 'at-calendar--fullscreen' : 'at-calendar--card', `at-calendar--${mode}`, className)}>
    {header}
    {mode === 'month' ? <div ref={gridRef} className="at-calendar__grid" role="grid" aria-labelledby={`${id}-label`} onKeyDown={onGridKeyDown}>
      <div className="at-calendar__weekdays" role="row">{weekdays.map((day) => <span key={day} className="at-calendar__weekday" role="columnheader">{day}</span>)}</div>
      {weeks.map((week, weekIndex) => <div key={weekIndex} className="at-calendar__week" role="row">
        {week.map((date) => {
          const outside = !isSameMonth(date, viewing);
          const info: CalendarCellInfo = { type: 'date', today: isSameDay(date, today), selected: isSameDay(date, selected), outside, disabled: isDisabled(date) };
          const extra = cellRender?.(date, info);
          return <div
            key={date.toISOString()}
            role="gridcell"
            tabIndex={isSameDay(date, focused) ? 0 : -1}
            aria-selected={info.selected}
            aria-disabled={info.disabled || undefined}
            aria-current={info.today ? 'date' : undefined}
            aria-label={formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })}
            className={cx('at-calendar__cell', info.selected && 'at-calendar__cell--selected', info.today && 'at-calendar__cell--today', outside && 'at-calendar__cell--outside', info.disabled && 'at-calendar__cell--disabled')}
            onClick={() => select(date, 'date')}
            onFocus={() => setFocused(date)}
          >
            <span className="at-calendar__date">{date.getDate()}</span>
            {fullscreen && extra != null && <div className="at-calendar__content">{extra}</div>}
            {!fullscreen && extra != null && <span className="at-calendar__dot-hint" aria-hidden="true" />}
          </div>;
        })}
      </div>)}
    </div> : <div ref={gridRef} className="at-calendar__months" role="grid" onKeyDown={onGridKeyDown}>
      {monthNames.map((name, month) => {
        const date = new Date(viewing.getFullYear(), month, 1);
        const info: CalendarCellInfo = { type: 'month', today: isSameMonth(date, today), selected: isSameMonth(date, selected), outside: false, disabled: validRange ? new Date(viewing.getFullYear(), month + 1, 0) < startOfDay(validRange[0]) || date > startOfDay(validRange[1]) : false };
        const extra = cellRender?.(date, info);
        return <div
          key={month}
          role="gridcell"
          tabIndex={focused.getFullYear() === viewing.getFullYear() && focused.getMonth() === month ? 0 : -1}
          aria-selected={info.selected}
          aria-disabled={info.disabled || undefined}
          aria-label={formatDate(date, { year: 'numeric', month: 'long' })}
          className={cx('at-calendar__cell', 'at-calendar__cell--month', info.selected && 'at-calendar__cell--selected', info.today && 'at-calendar__cell--today', info.disabled && 'at-calendar__cell--disabled')}
          onClick={() => { if (info.disabled) return; setFocused(date); changePanel(date, 'month'); onSelect?.(date, { source: 'month' }); }}
          onFocus={() => setFocused(date)}
        >
          <span className="at-calendar__date">{name}</span>
          {fullscreen && extra != null && <div className="at-calendar__content">{extra}</div>}
        </div>;
      })}
    </div>}
  </div>;
}
