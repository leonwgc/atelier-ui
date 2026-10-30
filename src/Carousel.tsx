import { useLocale } from './locale';
import { Children, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/carousel.css';
import { ChevronLeft, ChevronRight } from './internal/icons';
import { cx, useControllableState } from './utils';

export type CarouselEffect = 'slide' | 'fade';
export type DotPosition = 'bottom' | 'top' | 'left' | 'right';

export interface CarouselRef { next: () => void; prev: () => void; goTo: (index: number) => void }

export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Slides; legacy `items` array is also accepted. */
  children?: ReactNode;
  items?: ReactNode[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  /** Pause autoplay while hovering or focused. */
  pauseOnHover?: boolean;
  effect?: CarouselEffect;
  dots?: boolean;
  dotPosition?: DotPosition;
  arrows?: boolean;
  infinite?: boolean;
  draggable?: boolean;
  speed?: number;
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  beforeChange?: (from: number, to: number) => void;
  afterChange?: (current: number) => void;
  /** Visible aspect ratio, e.g. `16 / 9`; omit to size by content. */
  aspectRatio?: number;
  label?: string;
}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(function Carousel(
  { children, items, autoplay = false, autoplaySpeed = 4000, pauseOnHover = true, effect = 'slide', dots = true, dotPosition = 'bottom', arrows = false, infinite = true, draggable = true, speed = 450, current: currentProp, defaultCurrent = 0, onChange, beforeChange, afterChange, aspectRatio, label: labelProp, className, style, ...props }, ref,
) {
  const { t } = useLocale();
  const label = labelProp === undefined ? t('carousel.label') : labelProp;

  const slides = items ?? Children.toArray(children);
  const count = slides.length;
  const [current, setCurrent] = useControllableState(currentProp, defaultCurrent, onChange);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; width: number } | null>(null);
  const vertical = dotPosition === 'left' || dotPosition === 'right';

  const goTo = useCallback((next: number) => {
    if (count === 0) return;
    const target = infinite ? ((next % count) + count) % count : Math.min(Math.max(next, 0), count - 1);
    if (target === current) return;
    beforeChange?.(current, target);
    setCurrent(target);
  }, [count, infinite, current, beforeChange, setCurrent]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);
  useImperativeHandle(ref, () => ({ next, prev, goTo }), [next, prev, goTo]);

  const afterRef = useRef(afterChange);
  afterRef.current = afterChange;
  useEffect(() => {
    if (speed <= 0) { afterRef.current?.(current); return; }
    const timer = window.setTimeout(() => afterRef.current?.(current), speed);
    return () => window.clearTimeout(timer);
  }, [current, speed]);

  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setInterval(next, Math.max(reduced ? 6000 : 1000, autoplaySpeed));
    return () => window.clearInterval(timer);
  }, [autoplay, paused, count, autoplaySpeed, next]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggable || count < 2 || event.button !== 0) return;
    dragStart.current = { x: vertical ? event.clientY : event.clientX, width: vertical ? event.currentTarget.offsetHeight : event.currentTarget.offsetWidth };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    setDragOffset((vertical ? event.clientY : event.clientX) - dragStart.current.x);
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    const threshold = dragStart.current.width * 0.18;
    if (dragOffset < -threshold) next(); else if (dragOffset > threshold) prev();
    dragStart.current = null;
    setDragOffset(0);
    setDragging(false);
  };

  const canPrev = infinite || current > 0;
  const canNext = infinite || current < count - 1;
  const trackStyle: CSSProperties = effect === 'slide'
    ? { transform: vertical ? `translateY(calc(${-current * 100}% + ${dragOffset}px))` : `translateX(calc(${-current * 100}% + ${dragOffset}px))`, transition: dragging ? 'none' : `transform ${speed}ms var(--at-ease-emphasized)` }
    : {};

  return <div
    {...props}
    className={cx('at-carousel', `at-carousel--${effect}`, `at-carousel--dots-${dotPosition}`, vertical && 'at-carousel--vertical', dragging && 'at-carousel--dragging', className)}
    style={{ ...(aspectRatio ? { '--at-carousel-ratio': String(aspectRatio) } as CSSProperties : {}), ...style }}
    role="region"
    aria-roledescription="carousel"
    aria-label={label}
    onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
    onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    onFocus={pauseOnHover ? () => setPaused(true) : undefined}
    onBlur={pauseOnHover ? (event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); } : undefined}
    onKeyDown={(event) => {
      if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) { event.preventDefault(); next(); }
      if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) { event.preventDefault(); prev(); }
    }}
  >
    <div className="at-carousel__viewport" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div ref={trackRef} className="at-carousel__track" style={trackStyle} aria-live={autoplay && !paused ? 'off' : 'polite'}>
        {slides.map((slide, index) => <div
          key={index}
          className={cx('at-carousel__slide', index === current && 'at-carousel__slide--active')}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${count}`}
          aria-hidden={index !== current}
          style={effect === 'fade' ? { transition: `opacity ${speed}ms var(--at-ease-standard)` } : undefined}
        >{slide}</div>)}
      </div>
    </div>
    {arrows && count > 1 && <>
      <button type="button" className="at-carousel__arrow at-carousel__arrow--prev" aria-label={t('common.previousImage')} disabled={!canPrev} onClick={prev}><ChevronLeft size={18} /></button>
      <button type="button" className="at-carousel__arrow at-carousel__arrow--next" aria-label={t('common.nextImage')} disabled={!canNext} onClick={next}><ChevronRight size={18} /></button>
    </>}
    {dots && count > 1 && <div className="at-carousel__dots" role="tablist" aria-label={t('carousel.select')}>
      {slides.map((_, index) => <button key={index} type="button" role="tab" aria-selected={index === current} aria-label={t('carousel.slide', { index: index + 1 })} className={cx('at-carousel__dot', index === current && 'at-carousel__dot--active')} onClick={() => goTo(index)}>
        {autoplay && index === current && !paused && <span className="at-carousel__progress" style={{ animationDuration: `${autoplaySpeed}ms` }} />}
      </button>)}
    </div>}
  </div>;
});
