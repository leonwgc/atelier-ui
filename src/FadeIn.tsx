import './styles/theme.css';
import './styles/fade-in.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 500, className = '', style, ...props }: FadeInProps) {
  const animationStyle = {
    '--at-fade-in-delay': `${Math.max(0, delay)}ms`,
    '--at-fade-in-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;
  return <div {...props} className={`at-fade-in ${className}`} style={animationStyle}>{children}</div>;
}
