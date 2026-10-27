import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/spin.css';
import { cx } from './utils';

export interface SpinProps extends HTMLAttributes<HTMLDivElement> {
  spinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tip?: ReactNode;
  children?: ReactNode;
}

export function Spin({ spinning = true, size = 'md', tip, children, className, ...props }: SpinProps) {
  const indicator = <span className={cx('at-spin', `at-spin--${size}`)} role="status" aria-label={typeof tip === 'string' ? tip : '加载中'}><span /><span /><span /><span /></span>;
  if (!children) return spinning ? <div {...props} className={cx('at-spin-standalone', className)}>{indicator}{tip && <span className="at-spin__tip">{tip}</span>}</div> : null;
  return <div {...props} className={cx('at-spin-container', className)}>{children}{spinning && <div className="at-spin-container__overlay">{indicator}{tip && <span className="at-spin__tip">{tip}</span>}</div>}</div>;
}
