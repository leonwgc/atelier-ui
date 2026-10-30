import { useLocale } from '../locale';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import '../styles/theme.css';
import '../styles/floating.css';
import { cx } from '../utils';

export type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopupPlacement = FloatingPlacement | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
export interface FloatingPosition { top: number; left: number; width?: number; placement: PopupPlacement }

const GAP = 6;
const EDGE = 12;

function splitPlacement(placement: PopupPlacement): { side: FloatingPlacement; align: 'center' | 'start' | 'end' } {
  const [side, align] = placement.split('-') as [FloatingPlacement, 'start' | 'end' | undefined];
  return { side, align: align ?? 'center' };
}
const oppositeSide: Record<FloatingPlacement, FloatingPlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function getFloatingPosition(anchor: HTMLElement, floating: HTMLElement, preferred: PopupPlacement, gap = GAP): FloatingPosition {
  return positionForRects(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), preferred, gap);
}

export interface RectLike { top: number; left: number; width: number; height: number; right: number; bottom: number }

export function positionForRects(a: RectLike, f: RectLike, preferred: PopupPlacement, gap = GAP): FloatingPosition {
  const { side: preferredSide, align } = splitPlacement(preferred);
  const spaces: Record<FloatingPlacement, number> = {
    top: a.top - EDGE,
    bottom: window.innerHeight - a.bottom - EDGE,
    left: a.left - EDGE,
    right: window.innerWidth - a.right - EDGE,
  };
  const required = preferredSide === 'top' || preferredSide === 'bottom' ? f.height + gap : f.width + gap;
  const alternate = oppositeSide[preferredSide];
  const side = spaces[preferredSide] >= required ? preferredSide
    : spaces[alternate] >= required ? alternate
      : spaces[preferredSide] >= spaces[alternate] ? preferredSide : alternate;

  let top: number;
  let left: number;
  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? a.top - f.height - gap : a.bottom + gap;
    left = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + (a.width - f.width) / 2;
  } else {
    left = side === 'left' ? a.left - f.width - gap : a.right + gap;
    top = align === 'start' ? a.top : align === 'end' ? a.bottom - f.height : a.top + (a.height - f.height) / 2;
  }
  return {
    top: Math.max(EDGE, Math.min(top, window.innerHeight - f.height - EDGE)),
    left: Math.max(EDGE, Math.min(left, window.innerWidth - f.width - EDGE)),
    placement: align === 'center' ? side : `${side}-${align}` as PopupPlacement,
  };
}

export interface UseFloatingPanelOptions { matchWidth?: boolean; gap?: number }

export function useFloatingPanel<TAnchor extends HTMLElement = HTMLElement, TPanel extends HTMLElement = HTMLElement>(open: boolean, placement: PopupPlacement, options: UseFloatingPanelOptions = {}) {
  const { matchWidth = false, gap } = options;
  const anchorRef = useRef<TAnchor | null>(null);
  const panelRef = useRef<TPanel | null>(null);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !panelRef.current) return;
    if (matchWidth) panelRef.current.style.width = `${anchorRef.current.getBoundingClientRect().width}px`;
    const next = getFloatingPosition(anchorRef.current, panelRef.current, placement, gap);
    if (matchWidth) next.width = anchorRef.current.getBoundingClientRect().width;
    setPosition((previous) => previous && previous.top === next.top && previous.left === next.left && previous.width === next.width && previous.placement === next.placement ? previous : next);
  }, [placement, matchWidth, gap]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition);
    if (anchorRef.current) observer?.observe(anchorRef.current);
    if (panelRef.current) observer?.observe(panelRef.current);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer?.disconnect();
    };
  }, [open, updatePosition]);

  return { anchorRef, panelRef, position, updatePosition };
}

/** Closes on outside pointer-down or Escape while `open`. */
export function useDismiss(open: boolean, refs: Array<RefObject<HTMLElement | null>>, onDismiss: () => void) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismissRef.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismissRef.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  // refs are stable ref objects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export interface PopupProps {
  open: boolean;
  panelRef: MutableRefObject<HTMLDivElement | null>;
  position: FloatingPosition | null;
  placement: PopupPlacement;
  id?: string;
  role?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-multiselectable'?: boolean;
  'aria-modal'?: boolean;
  tabIndex?: number;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Listbox-style panels keep focus on the trigger; dialogs let focus move inside. */
  keepTriggerFocus?: boolean;
}

/** Portal-rendered floating surface shared by every dropdown-style component. */
export function Popup({ open, panelRef, position, placement, className, style, children, onMouseDown, keepTriggerFocus = true, ...rest }: PopupProps) {
  const { locale } = useLocale();
  if (!open || typeof document === 'undefined') return null;
  const resolved = position?.placement ?? placement;
  return createPortal(
    <div
      lang={locale}
      {...rest}
      ref={(node) => { panelRef.current = node; }}
      className={cx('at-popup', `at-popup--${resolved.split('-')[0]}`, className)}
      data-placement={resolved}
      style={{ top: position?.top ?? -9999, left: position?.left ?? -9999, width: position?.width, visibility: position ? undefined : 'hidden', ...style }}
      onMouseDown={(event) => {
        const tag = (event.target as HTMLElement).tagName;
        if (keepTriggerFocus && tag !== 'INPUT' && tag !== 'TEXTAREA') event.preventDefault();
        onMouseDown?.(event);
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function scrollIntoViewIfNeeded(container: HTMLElement | null, index: number) {
  if (!container) return;
  const target = container.querySelector<HTMLElement>(`[data-index="${index}"]`);
  if (!target) return;
  const { offsetTop, offsetHeight } = target;
  if (offsetTop < container.scrollTop) container.scrollTop = offsetTop;
  else if (offsetTop + offsetHeight > container.scrollTop + container.clientHeight) container.scrollTop = offsetTop + offsetHeight - container.clientHeight;
}
