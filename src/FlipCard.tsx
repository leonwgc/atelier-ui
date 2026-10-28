import './styles/theme.css';
import './styles/flip-card.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';
import { useEffect, useRef } from 'react';

export interface FlipCardProps extends HTMLAttributes<HTMLDivElement> {
  front: ReactNode;
  back: ReactNode;
  flipped?: boolean;
  direction?: 'horizontal' | 'vertical';
}

export function FlipCard({
  front,
  back,
  flipped = false,
  direction = 'horizontal',
  className = '',
  style,
  ...props
}: FlipCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const cardStyle = {
    '--at-flip-card-rotation': direction === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)',
    ...style,
  } as CSSProperties;

  useEffect(() => {
    if (frontRef.current) frontRef.current.inert = flipped;
    if (backRef.current) backRef.current.inert = !flipped;
  }, [flipped]);

  return (
    <div
      {...props}
      className={cx('at-flip-card', flipped && 'at-flip-card--flipped', className)}
      style={cardStyle}
      role={props.role ?? 'group'}
      aria-label={props['aria-label'] ?? 'Flip card'}
    >
      <div className="at-flip-card__inner">
        <div ref={frontRef} className="at-flip-card__face at-flip-card__face--front" aria-hidden={flipped}>
          {front}
        </div>
        <div ref={backRef} className="at-flip-card__face at-flip-card__face--back" aria-hidden={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}
