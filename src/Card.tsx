import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/card.css';
import { cx } from './utils';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  extra?: ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  children?: ReactNode;
}

export function Card({ title, extra, hoverable = false, bordered = true, children, className, ...props }: CardProps) {
  return <div {...props} className={cx('at-card', hoverable && 'at-card--hoverable', !bordered && 'at-card--borderless', className)}>{(title || extra) && <div className="at-card__header">{title && <h3>{title}</h3>}{extra && <div className="at-card__extra">{extra}</div>}</div>}<div className="at-card__body">{children}</div></div>;
}
