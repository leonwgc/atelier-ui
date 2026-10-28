import { useCallback, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/affix.css';
import { cx } from './utils';

export interface AffixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Pin when the element scrolls this far from the container top. */
  offsetTop?: number;
  /** Pin to the bottom instead; takes precedence over `offsetTop` when set. */
  offsetBottom?: number;
  /** Scroll container; defaults to the window. */
  target?: () => HTMLElement | Window | null;
  onChange?: (affixed: boolean) => void;
  children: ReactNode;
}

interface AffixState { fixed: CSSProperties; placeholder: { width: number; height: number } }

export function Affix({ offsetTop, offsetBottom, target, onChange, children, className, style, ...props }: AffixProps) {
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<AffixState | null>(null);
  const stateRef = useRef<AffixState | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const resolvedTop = offsetBottom == null ? offsetTop ?? 0 : undefined;

  const measure = useCallback(() => {
    const placeholder = placeholderRef.current;
    const content = contentRef.current;
    if (!placeholder || !content) return;
    const container = target?.() ?? window;
    const bounds = container instanceof Window ? { top: 0, bottom: window.innerHeight } : container.getBoundingClientRect();
    const rect = placeholder.getBoundingClientRect();
    const height = stateRef.current ? stateRef.current.placeholder.height : rect.height;
    let fixed: CSSProperties | null = null;
    if (resolvedTop != null) {
      const limit = bounds.top + resolvedTop;
      if (rect.top < limit) fixed = { position: 'fixed', top: limit, left: rect.left, width: rect.width };
    } else if (offsetBottom != null) {
      const limit = bounds.bottom - offsetBottom;
      if (rect.top + height > limit) fixed = { position: 'fixed', bottom: window.innerHeight - limit, left: rect.left, width: rect.width };
    }
    const next = fixed ? { fixed, placeholder: { width: rect.width, height } } : null;
    const previous = stateRef.current;
    if (Boolean(previous) !== Boolean(next)) onChangeRef.current?.(Boolean(next));
    if (previous && next && JSON.stringify(previous.fixed) === JSON.stringify(next.fixed)) return;
    stateRef.current = next;
    setState(next);
  }, [resolvedTop, offsetBottom, target]);

  // Runs after the whole tree committed so a `target` pointing at a parent ref is already set.
  useEffect(() => {
    measure();
    const container = target?.() ?? window;
    container.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => measure());
    if (contentRef.current) observer?.observe(contentRef.current);
    return () => {
      container.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure, target]);

  return <div {...props} ref={placeholderRef} className={cx('at-affix', state && 'at-affix--fixed', className)} style={{ ...state?.placeholder, ...style }}>
    <div ref={contentRef} className="at-affix__content" style={state ? { ...state.fixed, zIndex: 10 } : undefined}>{children}</div>
  </div>;
}
