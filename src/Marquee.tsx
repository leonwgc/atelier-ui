import './styles/theme.css';
import './styles/marquee.css';
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface MarqueeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  duration?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  gradient?: boolean;
}

export function Marquee({
  children,
  duration = 28,
  direction = 'left',
  pauseOnHover = true,
  gradient = false,
  className = '',
  style,
  ...props
}: MarqueeProps) {
  const duplicateGroupRef = useRef<HTMLDivElement>(null);
  const animationDuration = `${Math.max(0.5, duration)}s`;
  const marqueeStyle = {
    '--at-marquee-duration': animationDuration,
    ...style,
  } as CSSProperties;

  useEffect(() => {
    if (duplicateGroupRef.current) duplicateGroupRef.current.inert = true;
  }, []);

  return (
    <div
      {...props}
      className={`at-marquee at-marquee--${direction}${pauseOnHover ? ' at-marquee--pause-on-hover' : ''}${gradient ? ' at-marquee--gradient' : ''} ${className}`}
      style={marqueeStyle}
      aria-roledescription="marquee"
    >
      <div className="at-marquee__track">
        <div className="at-marquee__group">{children}</div>
        <div ref={duplicateGroupRef} className="at-marquee__group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}