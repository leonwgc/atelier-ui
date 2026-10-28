import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import './styles/theme.css';
import './styles/tour.css';
import { Button } from './Button';
import { positionForRects, type FloatingPosition, type PopupPlacement } from './internal/floating';
import { Close } from './internal/icons';
import { cx, useControllableState } from './utils';

export type TourTarget = HTMLElement | null | undefined | (() => HTMLElement | null | undefined) | RefObject<HTMLElement | null>;

export interface TourStep {
  title: ReactNode;
  description?: ReactNode;
  /** Media shown above the title. */
  cover?: ReactNode;
  target?: TourTarget;
  placement?: PopupPlacement;
  mask?: boolean;
  nextButtonProps?: { children?: ReactNode; onClick?: () => void };
  prevButtonProps?: { children?: ReactNode; onClick?: () => void };
}

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  onClose?: (current: number) => void;
  onFinish?: () => void;
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  mask?: boolean;
  type?: 'default' | 'primary';
  arrow?: boolean;
  /** Padding between the highlighted target and the spotlight edge. */
  gap?: number;
  /** Corner radius of the spotlight. */
  radius?: number;
  closable?: boolean;
  indicatorsRender?: (current: number, total: number) => ReactNode;
  zIndex?: number;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  className?: string;
}

function resolveTarget(target: TourTarget): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'function') return target() ?? null;
  if ('current' in target) return target.current ?? null;
  return target;
}

export function Tour({
  steps, open = false, onClose, onFinish, current: currentProp, defaultCurrent = 0, onChange, mask = true, type = 'default', arrow = true, gap = 6, radius = 10, closable = true, indicatorsRender, zIndex = 1200, scrollIntoViewOptions = { block: 'center', behavior: 'smooth' }, className,
}: TourProps) {
  const id = useId();
  const [current, setCurrent] = useControllableState(currentProp, defaultCurrent, onChange);
  const [spot, setSpot] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<Element | null>(null);
  const total = steps.length;
  const index = Math.min(Math.max(current, 0), Math.max(total - 1, 0));
  const step = steps[index];
  const placement = step?.placement ?? 'bottom';
  const showMask = step?.mask ?? mask;
  // Steps are usually recreated each render; read them through refs so effects key off the index only.
  const stepRef = useRef(step);
  stepRef.current = step;
  const scrollOptionsRef = useRef(scrollIntoViewOptions);
  scrollOptionsRef.current = scrollIntoViewOptions;

  const update = useCallback(() => {
    const target = resolveTarget(stepRef.current?.target);
    if (!target) { setSpot(null); setPosition(null); return; }
    const rect = target.getBoundingClientRect();
    const padded = { top: rect.top - gap, left: rect.left - gap, width: rect.width + gap * 2, height: rect.height + gap * 2, right: rect.right + gap, bottom: rect.bottom + gap };
    setSpot((previous) => (previous && previous.top === padded.top && previous.left === padded.left && previous.width === padded.width && previous.height === padded.height ? previous : { top: padded.top, left: padded.left, width: padded.width, height: padded.height }));
    if (cardRef.current) {
      const next = positionForRects(padded, cardRef.current.getBoundingClientRect(), placement, arrow ? 14 : 8);
      setPosition((previous) => (previous && previous.top === next.top && previous.left === next.left && previous.placement === next.placement ? previous : next));
    }
  }, [gap, placement, arrow]);

  useLayoutEffect(() => {
    if (!open || !stepRef.current) return;
    const target = resolveTarget(stepRef.current.target);
    const scrollOptions = scrollOptionsRef.current;
    if (target && scrollOptions) target.scrollIntoView(typeof scrollOptions === 'object' ? { ...scrollOptions, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : scrollOptions.behavior } : undefined);
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (cardRef.current) observer?.observe(cardRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
  }, [open, index, update]);

  useEffect(() => {
    if (!open) return;
    if (currentProp === undefined) setCurrent(defaultCurrent);
    lastFocused.current = document.activeElement;
    requestAnimationFrame(() => cardRef.current?.focus());
    return () => { (lastFocused.current as HTMLElement | null)?.focus?.({ preventScroll: true }); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => { if (open) requestAnimationFrame(() => cardRef.current?.focus()); }, [open, index]);

  if (!open || !step || typeof document === 'undefined') return null;

  const close = () => onClose?.(index);
  const next = () => {
    step.nextButtonProps?.onClick?.();
    if (index >= total - 1) { onFinish?.(); onClose?.(index); return; }
    setCurrent(index + 1);
  };
  const previous = () => { step.prevButtonProps?.onClick?.(); setCurrent(Math.max(0, index - 1)); };
  const maskId = `${id}-mask`;
  const hasTarget = Boolean(spot);
  const cardStyle: CSSProperties = hasTarget
    ? { top: position?.top ?? -9999, left: position?.left ?? -9999, visibility: position ? undefined : 'hidden' }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return createPortal(
    <div className={cx('at-tour', `at-tour--${type}`, className)} style={{ zIndex }}>
      {showMask && <svg className="at-tour__mask" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
            {spot && <rect x={spot.left} y={spot.top} width={spot.width} height={spot.height} rx={radius} fill="#000" className="at-tour__hole" />}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgb(20 22 45 / 55%)" mask={`url(#${maskId})`} />
      </svg>}
      {spot && <div className="at-tour__spotlight" style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height, borderRadius: radius }} aria-hidden="true" />}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={step.description ? `${id}-description` : undefined}
        tabIndex={-1}
        className={cx('at-tour__card', hasTarget && arrow && 'at-tour__card--arrow', !hasTarget && 'at-tour__card--centered')}
        data-placement={position?.placement ?? placement}
        style={cardStyle}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); close(); }
          if (event.key === 'ArrowRight' && index < total - 1) { event.preventDefault(); next(); }
          if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); previous(); }
        }}
      >
        {closable && <button type="button" className="at-tour__close" aria-label="关闭引导" onClick={close}><Close size={14} /></button>}
        {step.cover && <div className="at-tour__cover">{step.cover}</div>}
        <div className="at-tour__body">
          <h3 id={`${id}-title`} className="at-tour__title">{step.title}</h3>
          {step.description && <p id={`${id}-description`} className="at-tour__description">{step.description}</p>}
        </div>
        <footer className="at-tour__footer">
          <div className="at-tour__indicators" aria-label={`第 ${index + 1} 步，共 ${total} 步`}>
            {indicatorsRender ? indicatorsRender(index, total) : steps.map((_, dot) => <span key={dot} className={cx('at-tour__dot', dot === index && 'at-tour__dot--active')} />)}
          </div>
          <div className="at-tour__actions">
            {index > 0 && <Button size="sm" variant={type === 'primary' ? 'ghost' : 'secondary'} className="at-tour__button" onClick={previous}>{step.prevButtonProps?.children ?? '上一步'}</Button>}
            <Button size="sm" variant="primary" className="at-tour__button at-tour__button--next" onClick={next}>{step.nextButtonProps?.children ?? (index === total - 1 ? '完成' : '下一步')}</Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
