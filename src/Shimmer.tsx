import './styles/theme.css';
import './styles/shimmer.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ShimmerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
  highlight?: string;
}

export function Shimmer({ children, duration = 1800, highlight = 'rgb(255 255 255 / 62%)', className = '', style, ...props }: ShimmerProps) {
  const shimmerStyle = {
    '--at-shimmer-duration': `${Math.max(0, duration)}ms`,
    '--at-shimmer-highlight': highlight,
    ...style,
  } as CSSProperties;
  return <div {...props} className={`at-shimmer ${className}`} style={shimmerStyle}>{children}</div>;
}