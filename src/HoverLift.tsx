import './styles/theme.css';
import './styles/hover-lift.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface HoverLiftProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
  lift?: number;
}

export function HoverLift({ children, duration = 500, lift = 6, className = '', style, ...props }: HoverLiftProps) {
  const animationStyle = {
    '--at-hover-lift-duration': `${Math.max(0, duration)}ms`,
    '--at-hover-lift-distance': `${Math.max(0, lift)}px`,
    ...style,
  } as CSSProperties;

  return <div {...props} className={`at-hover-lift ${className}`} style={animationStyle}>{children}</div>;
}
