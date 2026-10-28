import './styles/theme.css';
import './styles/wobble.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface WobbleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
  duration?: number;
}

export function Wobble({ children, active = true, duration = 900, className = '', style, ...props }: WobbleProps) {
  const animationStyle = {
    '--at-wobble-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={`at-wobble${active ? ' at-wobble--active' : ''} ${className}`}
      data-active={active}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
