import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/divider.css';
import { cx } from './utils';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  dashed?: boolean;
  plain?: boolean;
  children?: ReactNode;
}

export function Divider({ orientation = 'horizontal', dashed = false, plain = false, children, className, ...props }: DividerProps) {
  if (orientation === 'vertical') return <div {...props} role="separator" aria-orientation="vertical" className={cx('at-divider', 'at-divider--vertical', dashed && 'at-divider--dashed', className)} />;
  return <div {...props} role="separator" aria-orientation="horizontal" className={cx('at-divider', Boolean(children) && 'at-divider--with-text', dashed && 'at-divider--dashed', className)}>{children && <span className={cx('at-divider__text', plain && 'at-divider__text--plain')}>{children}</span>}</div>;
}
