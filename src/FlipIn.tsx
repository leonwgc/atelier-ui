import './styles/theme.css';
import './styles/flip-in.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export interface FlipInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'x' | 'y';
  delay?: number;
  duration?: number;
}

export function FlipIn({
  children,
  direction = 'y',
  delay = 0,
  duration = 600,
  className = '',
  style,
  ...props
}: FlipInProps) {
  const animationStyle = {
    '--at-flip-in-delay': `${Math.max(0, Number.isFinite(delay) ? delay : 0)}ms`,
    '--at-flip-in-duration': `${Math.max(0, Number.isFinite(duration) ? duration : 0)}ms`,
    ...style,
  } as CSSProperties;

  return <div {...props} className={cx('at-flip-in', `at-flip-in--${direction}`, className)} style={animationStyle}>{children}</div>;
}
