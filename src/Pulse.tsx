import './styles/theme.css';
import './styles/pulse.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface PulseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
}

export function Pulse({ children, duration = 1400, className = '', style, ...props }: PulseProps) {
  const animationStyle = {
    '--at-pulse-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  return <div {...props} className={`at-pulse ${className}`} style={animationStyle}>{children}</div>;
}
