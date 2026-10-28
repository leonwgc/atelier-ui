import './styles/theme.css';
import './styles/stagger.css';
import { Children, isValidElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  itemClassName?: string;
}

export function Stagger({ children, staggerDelay = 70, duration = 420, itemClassName = '', className = '', style, ...props }: StaggerProps) {
  return (
    <div {...props} className={`at-stagger ${className}`} style={style}>
      {Children.toArray(children).map((child, index) => {
        const itemStyle = {
          '--at-stagger-delay': `${Math.max(0, index * staggerDelay)}ms`,
          '--at-stagger-duration': `${Math.max(0, duration)}ms`,
        } as CSSProperties;
        const key = isValidElement(child) && child.key !== null ? child.key : index;
        return <div key={key} className={`at-stagger__item ${itemClassName}`} style={itemStyle}>{child}</div>;
      })}
    </div>
  );
}
