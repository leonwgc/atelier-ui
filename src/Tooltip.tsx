import { useCallback, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './styles/theme.css';
import './styles/tooltip.css';
import { cx } from './utils';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content' | 'title'> {
  title: ReactNode;
  placement?: TooltipPlacement;
  children: ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const GAP = 8;
const VIEWPORT_PADDING = 8;

function getTooltipPosition(triggerElement: HTMLElement, tooltip: DOMRect, preferred: TooltipPlacement): TooltipPosition {
  const trigger = triggerElement.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const fallbackCandidates: TooltipPlacement[] = preferred === 'top' || preferred === 'bottom'
    ? ['bottom', 'right', 'left']
    : ['right', 'left', 'top', 'bottom'];
  const candidates: TooltipPlacement[] = [preferred, ...fallbackCandidates];
  const uniqueCandidates = [...new Set(candidates)];
  const fits = (side: TooltipPlacement) => {
    if (side === 'top') return trigger.top - tooltip.height - GAP >= VIEWPORT_PADDING;
    if (side === 'bottom') return trigger.bottom + tooltip.height + GAP <= viewportHeight - VIEWPORT_PADDING;
    if (side === 'left') return trigger.left - tooltip.width - GAP >= VIEWPORT_PADDING;
    return trigger.right + tooltip.width + GAP <= viewportWidth - VIEWPORT_PADDING;
  };
  const area = triggerElement.closest('.example-card') ?? triggerElement.parentElement;
  const obstacles = area
    ? [...area.querySelectorAll<HTMLElement>('h1, h2, h3, p, button, a, input, select, textarea, [role="button"]')]
      .filter((element) => element !== triggerElement && !element.contains(triggerElement) && !triggerElement.contains(element))
      .map((element) => element.getBoundingClientRect())
    : [];
  const getCandidate = (side: TooltipPlacement) => {
    let left = trigger.left + trigger.width / 2 - tooltip.width / 2;
    let top = trigger.top + trigger.height / 2 - tooltip.height / 2;
    if (side === 'top') top = trigger.top - tooltip.height - GAP;
    if (side === 'bottom') top = trigger.bottom + GAP;
    if (side === 'left') left = trigger.left - tooltip.width - GAP;
    if (side === 'right') left = trigger.right + GAP;
    return { left, top };
  };
  const overlapArea = (candidate: { left: number; top: number }) => obstacles.reduce((overlap, obstacle) => {
    const width = Math.max(0, Math.min(candidate.left + tooltip.width, obstacle.right) - Math.max(candidate.left, obstacle.left));
    const height = Math.max(0, Math.min(candidate.top + tooltip.height, obstacle.bottom) - Math.max(candidate.top, obstacle.top));
    return overlap + width * height;
  }, 0);
  const availableCandidates = uniqueCandidates.filter(fits);
  const placement = [...(availableCandidates.length ? availableCandidates : uniqueCandidates)]
    .sort((first, second) => overlapArea(getCandidate(first)) - overlapArea(getCandidate(second)))[0] ?? preferred;
  const { left, top } = getCandidate(placement);

  return {
    top: Math.max(VIEWPORT_PADDING, Math.min(top, viewportHeight - tooltip.height - VIEWPORT_PADDING)),
    left: Math.max(VIEWPORT_PADDING, Math.min(left, viewportWidth - tooltip.width - VIEWPORT_PADDING)),
    placement,
  };
}

export function Tooltip({ title, placement = 'top', children, className, ...props }: TooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    setPosition(getTooltipPosition(
      triggerRef.current,
      tooltipRef.current.getBoundingClientRect(),
      placement,
    ));
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition, title]);

  return (
    <span {...props} className={cx('at-tooltip', className)}>
      <span
        ref={triggerRef}
        className="at-tooltip__trigger"
        tabIndex={0}
        aria-describedby={tooltipId}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        {children}
      </span>
      {open && typeof document !== 'undefined' && createPortal(
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cx('at-tooltip__content', position && `at-tooltip__content--${position.placement}`)}
          style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
        >
          {title}
        </span>,
        document.body,
      )}
    </span>
  );
}
