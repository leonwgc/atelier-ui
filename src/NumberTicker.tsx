import './styles/theme.css';
import './styles/number-ticker.css';
import { useEffect, useState, type HTMLAttributes } from 'react';

export interface NumberTickerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  value: number;
  startValue?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  startValue = 0,
  duration = 1200,
  delay = 0,
  decimals = 0,
  locale = 'zh-CN',
  prefix = '',
  suffix = '',
  ...props
}: NumberTickerProps) {
  const [current, setCurrent] = useState(startValue);

  useEffect(() => {
    let frame = 0;
    let timeout = 0;
    let startTime = 0;
    const from = startValue;
    const difference = value - from;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || duration <= 0) {
      setCurrent(value);
      return;
    }

    setCurrent(from);
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(from + difference * eased);
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    timeout = window.setTimeout(() => { frame = window.requestAnimationFrame(animate); }, Math.max(0, delay));
    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [delay, duration, startValue, value]);

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(current);
  const accessibleValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <span {...props} className={`at-number-ticker ${props.className ?? ''}`} aria-label={`${prefix}${accessibleValue}${suffix}`} aria-live="off">{prefix}{formatted}{suffix}</span>;
}