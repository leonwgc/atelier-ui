import './styles/theme.css';
import './styles/slide-in.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type SlideInDirection = 'left' | 'right' | 'up' | 'down';

export interface SlideInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: SlideInDirection;
  distance?: number;
  delay?: number;
  duration?: number;
}

export function SlideIn({ children, direction = 'up', distance = 16, delay = 0, duration = 500, className = '', style, ...props }: SlideInProps) {
  const offset = Math.max(0, distance);
  const animationStyle = {
    '--at-slide-in-x': `${direction === 'left' ? -offset : direction === 'right' ? offset : 0}px`,
    '--at-slide-in-y': `${direction === 'up' ? offset : direction === 'down' ? -offset : 0}px`,
    '--at-slide-in-delay': `${Math.max(0, delay)}ms`,
    '--at-slide-in-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;
  return <div {...props} className={`at-slide-in ${className}`} style={animationStyle}>{children}</div>;
}
