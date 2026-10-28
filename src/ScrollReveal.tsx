import './styles/theme.css';
import './styles/scroll-reveal.css';
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type ScrollRevealDirection = 'left' | 'right' | 'up' | 'down';

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: ScrollRevealDirection;
  distance?: number;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 16,
  delay = 0,
  duration = 600,
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  className = '',
  style,
  ...props
}: ScrollRevealProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const offset = Math.max(0, distance);
  const animationStyle = {
    '--at-scroll-reveal-x': `${direction === 'left' ? -offset : direction === 'right' ? offset : 0}px`,
    '--at-scroll-reveal-y': `${direction === 'up' ? offset : direction === 'down' ? -offset : 0}px`,
    '--at-scroll-reveal-delay': `${Math.max(0, delay)}ms`,
    '--at-scroll-reveal-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (once) observer.unobserve(node);
      } else if (!once) {
        setIsVisible(false);
      }
    }, { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <div
      {...props}
      ref={nodeRef}
      className={`at-scroll-reveal ${className}`}
      data-visible={isVisible ? 'true' : 'false'}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
