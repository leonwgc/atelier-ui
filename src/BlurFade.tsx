import './styles/theme.css';
import './styles/blur-fade.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface BlurFadeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  blur?: number;
  offsetY?: number;
}

export function BlurFade({ children, delay = 0, duration = 500, blur = 6, offsetY = 8, className = '', style, ...props }: BlurFadeProps) {
  const animationStyle = {
    '--at-blur-fade-delay': `${Math.max(0, delay)}ms`,
    '--at-blur-fade-duration': `${Math.max(0, duration)}ms`,
    '--at-blur-fade-blur': `${Math.max(0, blur)}px`,
    '--at-blur-fade-y': `${offsetY}px`,
    ...style,
  } as CSSProperties;
  return <div {...props} className={`at-blur-fade ${className}`} style={animationStyle}>{children}</div>;
}