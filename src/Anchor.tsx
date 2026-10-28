import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/anchor.css';
import { cx } from './utils';

export interface AnchorItem { key?: string; href: string; title: ReactNode; children?: AnchorItem[] }

export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'onClick'> {
  items: AnchorItem[];
  /** Pixels between the viewport top and the section considered "active". */
  offsetTop?: number;
  /** Extra tolerance applied to `offsetTop` when deciding the active section. */
  bounds?: number;
  /** Scroll position offset applied when jumping to a section. */
  targetOffset?: number;
  direction?: 'vertical' | 'horizontal';
  /** Keep the anchor pinned while its parent scrolls. */
  affix?: boolean;
  /** Scroll container; defaults to the window. */
  getContainer?: () => HTMLElement | Window;
  replace?: boolean;
  onChange?: (activeHref: string) => void;
  onClick?: (event: MouseEvent<HTMLAnchorElement>, item: AnchorItem) => void;
}

function flatten(items: AnchorItem[]): AnchorItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
}

function resolveTarget(href: string) {
  if (!href.startsWith('#') || href.length < 2) return null;
  try { return document.getElementById(decodeURIComponent(href.slice(1))); } catch { return null; }
}

export function Anchor({ items, offsetTop = 0, bounds = 5, targetOffset, direction = 'vertical', affix = true, getContainer, replace = false, onChange, onClick, className, style, ...props }: AnchorProps) {
  const [active, setActive] = useState('');
  const [ink, setInk] = useState<CSSProperties | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const lockUntil = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const getScrollTop = useCallback((container: HTMLElement | Window) => (container instanceof Window ? container.scrollY : container.scrollTop), []);
  const containerTop = useCallback((container: HTMLElement | Window) => (container instanceof Window ? 0 : container.getBoundingClientRect().top), []);

  const updateActive = useCallback(() => {
    if (Date.now() < lockUntil.current) return;
    const container = getContainer?.() ?? window;
    const threshold = offsetTop + bounds;
    let current = '';
    let best = Number.NEGATIVE_INFINITY;
    flatten(items).forEach((item) => {
      const target = resolveTarget(item.href);
      if (!target) return;
      const top = target.getBoundingClientRect().top - containerTop(container);
      if (top <= threshold && top > best) { best = top; current = item.href; }
    });
    setActive((previous) => {
      if (previous !== current) onChangeRef.current?.(current);
      return current;
    });
  }, [items, offsetTop, bounds, getContainer, containerTop]);

  useEffect(() => {
    const container = getContainer?.() ?? window;
    updateActive();
    container.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => { container.removeEventListener('scroll', updateActive); window.removeEventListener('resize', updateActive); };
  }, [updateActive, getContainer]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('.at-anchor__link--active');
    if (!nav || !link) { setInk(null); return; }
    setInk(direction === 'vertical'
      ? { top: link.offsetTop, height: link.offsetHeight }
      : { left: link.offsetLeft, width: link.offsetWidth });
  }, [active, direction, items]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
    onClick?.(event, item);
    if (event.defaultPrevented) return;
    const target = resolveTarget(item.href);
    if (!target) return;
    event.preventDefault();
    const container = getContainer?.() ?? window;
    const top = target.getBoundingClientRect().top - containerTop(container) + getScrollTop(container) - (targetOffset ?? offsetTop);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    lockUntil.current = Date.now() + (reduced ? 0 : 500);
    setActive(item.href);
    onChangeRef.current?.(item.href);
    if (replace) window.history.replaceState(null, '', item.href); else window.history.pushState(null, '', item.href);
  };

  const renderItems = (list: AnchorItem[], depth: number) => <ul className="at-anchor__list" role={depth === 0 ? undefined : 'group'}>
    {list.map((item) => {
      const isActive = active === item.href;
      return <li key={item.key ?? item.href} className="at-anchor__item">
        <a
          href={item.href}
          className={cx('at-anchor__link', isActive && 'at-anchor__link--active')}
          style={direction === 'vertical' ? { paddingLeft: 14 + depth * 14 } : undefined}
          aria-current={isActive ? 'location' : undefined}
          onClick={(event) => jump(event, item)}
        >{item.title}</a>
        {item.children?.length ? renderItems(item.children, depth + 1) : null}
      </li>;
    })}
  </ul>;

  return <nav
    {...props}
    ref={navRef}
    aria-label={props['aria-label'] ?? '页面锚点'}
    className={cx('at-anchor', `at-anchor--${direction}`, affix && 'at-anchor--affix', className)}
    style={affix ? { top: offsetTop, ...style } : style}
  >
    <span className={cx('at-anchor__ink', ink && 'at-anchor__ink--visible')} style={ink ?? undefined} aria-hidden="true" />
    {renderItems(items, 0)}
  </nav>;
}
