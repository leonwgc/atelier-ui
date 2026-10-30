import { useLocale } from './locale';
import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/badge.css';
import { cx } from './utils';

export type BadgeStatus = 'default' | 'success' | 'processing' | 'warning' | 'error';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: ReactNode;
  dot?: boolean;
  overflowCount?: number;
  showZero?: boolean;
  status?: BadgeStatus;
  text?: ReactNode;
  children?: ReactNode;
}

export function Badge({ count, dot = false, overflowCount = 99, showZero = false, status, text, children, className, ...props }: BadgeProps) {
  const { t } = useLocale();

  const numericCount = typeof count === 'number' ? count : null;
  const visible = dot || (count !== null && count !== undefined && (showZero || numericCount === null || numericCount > 0));
  const displayCount = numericCount !== null && numericCount > overflowCount ? `${overflowCount}+` : count;
  if (!children) return <span {...props} className={cx('at-badge__standalone', className)}><i className={cx('at-badge__status', `at-badge__status--${status ?? 'default'}`)} />{text ?? count}</span>;
  return <span {...props} className={cx('at-badge', className)}>{children}{visible && <sup className={cx('at-badge__count', status && `at-badge__count--${status}`, dot && 'at-badge__count--dot')} aria-label={dot ? t('badge.new') : t('badge.count', { count: String(displayCount) })}>{!dot && displayCount}</sup>}</span>;
}
