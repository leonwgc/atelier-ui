import './styles/theme.css';
import './styles/expand.css';
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface ExpandProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  open: boolean;
  duration?: number;
}

export function Expand({ children, open, duration = 300, className = '', style, ...props }: ExpandProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const animationStyle = {
    '--at-expand-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = !open;
  }, [open]);

  return (
    <div {...props} className={`at-expand ${className}`} data-open={open ? 'true' : 'false'} aria-hidden={!open} style={animationStyle}>
      <div ref={contentRef} className="at-expand__inner">{children}</div>
    </div>
  );
}
