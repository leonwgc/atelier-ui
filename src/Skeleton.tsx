import { type HTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/skeleton.css';
import { cx } from './utils';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  active?: boolean;
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean | { rows?: number };
}

export function Skeleton({ active = false, avatar = false, title = true, paragraph = true, className, ...props }: SkeletonProps) {
  const rows = typeof paragraph === 'object' ? Math.max(1, paragraph.rows ?? 3) : 3;
  return <div {...props} className={cx('at-skeleton', active && 'at-skeleton--active', className)} aria-busy="true" aria-label="内容加载中"><div className="at-skeleton__avatar-row">{avatar && <span className="at-skeleton__avatar" />}{(title || paragraph) && <div className="at-skeleton__body">{title && <span className="at-skeleton__title" />}{paragraph && <div className="at-skeleton__paragraph">{Array.from({ length: rows }, (_, index) => <span key={index} style={{ width: index === rows - 1 ? '62%' : '100%' }} />)}</div>}</div>}</div></div>;
}
