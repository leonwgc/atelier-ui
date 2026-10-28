import './styles/theme.css';
import './styles/animated-list.css';
import { isValidElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface AnimatedListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  items: ReactNode[];
  staggerDelay?: number;
  duration?: number;
  itemClassName?: string;
}

export function AnimatedList({ items, staggerDelay = 70, duration = 420, itemClassName = '', className = '', style, ...props }: AnimatedListProps) {
  return (
    <ul {...props} className={`at-animated-list ${className}`} style={style}>
      {items.map((item, index) => {
        const itemStyle = {
          '--at-animated-list-delay': `${Math.max(0, index * staggerDelay)}ms`,
          '--at-animated-list-duration': `${Math.max(0, duration)}ms`,
        } as CSSProperties;
        const key = isValidElement(item) && item.key !== null ? item.key : index;
        return <li key={key} className={`at-animated-list__item ${itemClassName}`} style={itemStyle}>{item}</li>;
      })}
    </ul>
  );
}