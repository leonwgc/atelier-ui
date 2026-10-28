import './styles/theme.css';
import './styles/press.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface PressProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
}

export function Press({ children, duration = 500, className = '', style, ...props }: PressProps) {
  const animationStyle = {
    '--at-press-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  return <div {...props} className={`at-press ${className}`} style={animationStyle}>{children}</div>;
}
