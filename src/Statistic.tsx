import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/statistic.css';
import { cx } from './utils';

export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: ReactNode;
  value: number | string;
  precision?: number;
  groupSeparator?: string;
  decimalSeparator?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: number | string) => ReactNode;
  loading?: boolean;
  valueStyle?: CSSProperties;
  /** Colours the value and shows a direction arrow. */
  trend?: 'up' | 'down';
  trendLabel?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function formatStatistic(value: number | string, { precision, groupSeparator = ',', decimalSeparator = '.' }: Pick<StatisticProps, 'precision' | 'groupSeparator' | 'decimalSeparator'>) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { integer: String(value), decimal: '' };
  const fixed = precision != null ? Math.abs(value).toFixed(precision) : String(Math.abs(value));
  const [integerPart, decimalPart = ''] = fixed.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  return { integer: `${value < 0 ? '-' : ''}${grouped}`, decimal: decimalPart ? `${decimalSeparator}${decimalPart}` : '' };
}

const TrendIcon = ({ direction }: { direction: 'up' | 'down' }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: direction === 'down' ? 'rotate(180deg)' : undefined }}><path d="M12 19V5M5 12l7-7 7 7" /></svg>;

export function Statistic({ title, value, precision, groupSeparator, decimalSeparator, prefix, suffix, formatter, loading = false, valueStyle, trend, trendLabel, size = 'md', className, ...props }: StatisticProps) {
  const { integer, decimal } = formatStatistic(value, { precision, groupSeparator, decimalSeparator });
  return <div {...props} className={cx('at-statistic', `at-statistic--${size}`, trend && `at-statistic--${trend}`, className)}>
    {title && <div className="at-statistic__title">{title}</div>}
    {loading ? <div className="at-statistic__skeleton" aria-busy="true" aria-label="加载中" /> : <div className="at-statistic__content" style={valueStyle}>
      {prefix != null && <span className="at-statistic__prefix">{prefix}</span>}
      {trend && <span className="at-statistic__trend" aria-label={trend === 'up' ? '上升' : '下降'}><TrendIcon direction={trend} /></span>}
      <span className="at-statistic__value">{formatter ? formatter(value) : <><span className="at-statistic__int">{integer}</span>{decimal && <span className="at-statistic__decimal">{decimal}</span>}</>}</span>
      {suffix != null && <span className="at-statistic__suffix">{suffix}</span>}
    </div>}
    {trendLabel && !loading && <div className="at-statistic__trend-label">{trendLabel}</div>}
  </div>;
}

export interface CountdownProps extends Omit<StatisticProps, 'value' | 'formatter' | 'precision' | 'groupSeparator' | 'decimalSeparator' | 'trend' | 'trendLabel' | 'onChange'> {
  /** Target timestamp (ms) or Date. */
  value: number | Date;
  /** Tokens: D (days), H, m, s, S (milliseconds). */
  format?: string;
  onFinish?: () => void;
  onChange?: (remainingMs: number) => void;
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

export function formatCountdown(remaining: number, format = 'HH:mm:ss') {
  let rest = Math.max(0, remaining);
  const hasDays = /D/.test(format);
  const hasHours = /H/.test(format);
  const hasMinutes = /m/.test(format);
  const days = hasDays ? Math.floor(rest / 86_400_000) : 0;
  rest -= days * 86_400_000;
  const hours = hasHours ? Math.floor(rest / 3_600_000) : 0;
  rest -= hours * 3_600_000;
  const minutes = hasMinutes ? Math.floor(rest / 60_000) : 0;
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  const millis = rest - seconds * 1000;
  return format
    .replace(/D+/g, (token) => pad(days, token.length))
    .replace(/H+/g, (token) => pad(hours, token.length))
    .replace(/m+/g, (token) => pad(minutes, token.length))
    .replace(/s+/g, (token) => pad(seconds, token.length))
    .replace(/S+/g, (token) => pad(millis, 3).slice(0, token.length));
}

export function Countdown({ value, format = 'HH:mm:ss', onFinish, onChange, ...props }: CountdownProps) {
  const target = value instanceof Date ? value.getTime() : value;
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));
  const finished = useRef(false);
  useEffect(() => {
    finished.current = false;
    const interval = /S/.test(format) ? 50 : 1000 / 30;
    const tick = () => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      onChange?.(next);
      if (next === 0 && !finished.current) { finished.current = true; onFinish?.(); }
    };
    tick();
    const timer = window.setInterval(tick, interval);
    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, format]);
  return <Statistic {...props} value={formatCountdown(remaining, format)} className={cx('at-statistic--countdown', props.className)} />;
}

Statistic.Countdown = Countdown;
