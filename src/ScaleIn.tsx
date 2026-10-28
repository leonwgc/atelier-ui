import './styles/theme.css';
import './styles/scale-in.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ScaleInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  startScale?: number;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, startScale = 0.88, delay = 0, duration = 450, className = '', style, ...props }: ScaleInProps) {
  const animationStyle = {
    '--at-scale-in-start': String(Math.max(0, startScale)),
    '--at-scale-in-delay': `${Math.max(0, delay)}ms`,
    '--at-scale-in-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;
  return <div {...props} className={`at-scale-in ${className}`} style={animationStyle}>{children}</div>;
}
