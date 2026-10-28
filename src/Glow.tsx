import './styles/theme.css';
import './styles/glow.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface GlowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
  color?: string;
}

export function Glow({ children, duration = 1800, color = '#8b7dff', className = '', style, ...props }: GlowProps) {
  const animationStyle = {
    '--at-glow-duration': `${Math.max(0, duration)}ms`,
    '--at-glow-color': color,
    ...style,
  } as CSSProperties;

  return <div {...props} className={`at-glow ${className}`} style={animationStyle}>{children}</div>;
}
