import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/descriptions.css';
import { cx } from './utils';

export interface DescriptionItem { key: string; label: ReactNode; children: ReactNode; }
export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  items: DescriptionItem[];
  column?: number;
  bordered?: boolean;
}

export function Descriptions({ title, items, column = 3, bordered = false, className, ...props }: DescriptionsProps) {
  const columns = Math.max(1, Math.min(6, Number.isFinite(column) ? Math.floor(column) : 3));
  return <div {...props} className={cx('at-descriptions', bordered && 'at-descriptions--bordered', className)}>{title && <h3 className="at-descriptions__title">{title}</h3>}<dl className="at-descriptions__list" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{items.map((item) => <div className="at-descriptions__item" key={item.key}><dt>{item.label}</dt><dd>{item.children}</dd></div>)}</dl></div>;
}
