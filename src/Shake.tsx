import './styles/theme.css';
import './styles/shake.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ShakeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
  duration?: number;
}

export function Shake({ children, active = true, duration = 650, className = '', style, ...props }: ShakeProps) {
  const animationStyle = {
    '--at-shake-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={`at-shake${active ? ' at-shake--active' : ''} ${className}`}
      data-active={active}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
