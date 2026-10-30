import { useLocale } from './locale';
import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/progress.css';
import { cx } from './utils';

export type ProgressStatus = 'normal' | 'active' | 'success' | 'exception';
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  percent: number;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeColor?: string;
  label?: ReactNode;
}

export function Progress({ percent, status, showInfo = true, strokeColor, label, className, ...props }: ProgressProps) {
  const { t } = useLocale();

  const value = Math.max(0, Math.min(100, percent));
  const resolvedStatus = status ?? (value === 100 ? 'success' : 'normal');
  return <div {...props} className={cx('at-progress', `at-progress--${resolvedStatus}`, className)}><div className="at-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={typeof label === 'string' ? label : t('progress.label')}><span className="at-progress__bar" style={{ width: `${value}%`, ...(strokeColor ? { backgroundColor: strokeColor } : {}) }} /></div>{showInfo && <span className="at-progress__info">{label ?? `${value}%`}</span>}</div>;
}
