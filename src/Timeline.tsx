import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/timeline.css';
import { cx } from './utils';

export interface TimelineItem { key: string; content: ReactNode; label?: ReactNode; color?: string; }
export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
  pending?: ReactNode;
}

export function Timeline({ items, pending, className, ...props }: TimelineProps) {
  return <ol {...props} className={cx('at-timeline', className)}>{items.map((item, index) => <li key={item.key} className="at-timeline__item"><span className="at-timeline__dot" style={item.color ? { backgroundColor: item.color, borderColor: item.color } : undefined} aria-hidden="true" /><div className="at-timeline__body">{item.label && <time className="at-timeline__label">{item.label}</time>}<div className="at-timeline__content">{item.content}</div></div>{index < items.length - 1 || pending ? <span className="at-timeline__line" aria-hidden="true" /> : null}</li>)}{pending && <li className="at-timeline__item at-timeline__item--pending"><span className="at-timeline__dot" aria-hidden="true" /><div className="at-timeline__content">{pending}</div></li>}</ol>;
}
