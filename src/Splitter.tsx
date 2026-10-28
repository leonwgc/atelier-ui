import { Children, Fragment, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/splitter.css';
import { ChevronLeft, ChevronRight } from './internal/icons';
import { clamp, cx } from './utils';

export interface SplitterPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Pixels or percentage string. */
  size?: number | string;
  defaultSize?: number | string;
  min?: number | string;
  max?: number | string;
  resizable?: boolean;
  collapsible?: boolean | { start?: boolean; end?: boolean };
  children?: ReactNode;
}

export interface SplitterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  layout?: 'horizontal' | 'vertical';
  onResizeStart?: (sizes: number[]) => void;
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  /** Only apply the new size when the drag ends. */
  lazy?: boolean;
  children: ReactNode;
}

const CONFIG_KEYS = new Set(['size', 'defaultSize', 'min', 'max', 'resizable', 'collapsible']);
function panelDomProps(props: SplitterPanelProps) {
  const result: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => { if (!CONFIG_KEYS.has(key)) result[key] = value; });
  return result as HTMLAttributes<HTMLDivElement> & { children?: ReactNode };
}

/** Declarative panel config; `Splitter` reads its props and renders the panel itself. */
export function SplitterPanel(props: SplitterPanelProps) {
  const { children, className, ...rest } = panelDomProps(props);
  return <div {...rest} className={cx('at-splitter__panel', className)}>{children}</div>;
}

function toPixels(value: number | string | undefined, total: number) {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  if (value.endsWith('%')) return (parseFloat(value) / 100) * total;
  return parseFloat(value);
}

export function Splitter({ layout = 'horizontal', onResizeStart, onResize, onResizeEnd, lazy = false, className, children, ...props }: SplitterProps) {
  const panels = Children.toArray(children).filter((child): child is ReactElement<SplitterPanelProps> => isValidElement(child)) as Array<ReactElement<SplitterPanelProps>>;
  const count = panels.length;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [total, setTotal] = useState(0);
  const [sizes, setSizes] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState<Record<number, number>>({});
  const [preview, setPreview] = useState<number[] | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const horizontal = layout === 'horizontal';
  const barSize = 8;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return 0;
    return (horizontal ? root.clientWidth : root.clientHeight) - barSize * Math.max(0, count - 1);
  }, [horizontal, count]);

  // Resolve initial sizes: explicit pixel/percent values first, then distribute the remainder.
  useLayoutEffect(() => {
    const available = measure();
    if (!available) return;
    setTotal(available);
    setSizes((current) => {
      if (current.length === count && current.some((value) => value > 0)) {
        const sum = current.reduce((a, b) => a + b, 0) || 1;
        return current.map((value) => (value / sum) * available);
      }
      const explicit = panels.map((panel) => toPixels(panel.props.size ?? panel.props.defaultSize, available));
      const used = explicit.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      const flexible = explicit.filter((value) => value == null).length;
      const remainder = Math.max(0, available - used);
      return explicit.map((value) => value ?? (flexible ? remainder / flexible : 0));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, measure]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const available = measure();
      if (!available) return;
      setTotal(available);
      setSizes((current) => { const sum = current.reduce((a, b) => a + b, 0) || 1; return current.map((value) => (value / sum) * available); });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  // Controlled `size` props win over internal state.
  const resolved = sizes.map((value, index) => { const controlled = toPixels(panels[index]?.props.size, total); return controlled ?? value; });
  const shown = preview ?? resolved;

  const limits = (index: number) => ({
    min: toPixels(panels[index]?.props.min, total) ?? 0,
    max: toPixels(panels[index]?.props.max, total) ?? Number.POSITIVE_INFINITY,
  });

  const applyDelta = (barIndex: number, delta: number, base: number[]) => {
    const next = [...base];
    const left = limits(barIndex); const right = limits(barIndex + 1);
    let proposedLeft = clamp(base[barIndex] + delta, left.min, left.max);
    let proposedRight = base[barIndex] + base[barIndex + 1] - proposedLeft;
    if (proposedRight < right.min) { proposedRight = right.min; proposedLeft = base[barIndex] + base[barIndex + 1] - proposedRight; }
    if (proposedRight > right.max) { proposedRight = right.max; proposedLeft = base[barIndex] + base[barIndex + 1] - proposedRight; }
    next[barIndex] = proposedLeft;
    next[barIndex + 1] = proposedRight;
    return next;
  };

  const commit = (next: number[]) => {
    setSizes(next);
    setCollapsed({});
    onResize?.(next);
  };

  const onBarPointerDown = (barIndex: number) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (panels[barIndex]?.props.resizable === false || panels[barIndex + 1]?.props.resizable === false) return;
    event.preventDefault();
    const origin = horizontal ? event.clientX : event.clientY;
    const base = [...resolved];
    setActiveBar(barIndex);
    onResizeStart?.(base);
    const move = (moveEvent: PointerEvent) => {
      const delta = (horizontal ? moveEvent.clientX : moveEvent.clientY) - origin;
      const next = applyDelta(barIndex, delta, base);
      if (lazy) setPreview(next); else commit(next);
    };
    const up = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const delta = (horizontal ? upEvent.clientX : upEvent.clientY) - origin;
      const next = applyDelta(barIndex, delta, base);
      setPreview(null);
      setActiveBar(null);
      commit(next);
      onResizeEnd?.(next);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onBarKeyDown = (barIndex: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    const grow = horizontal ? 'ArrowRight' : 'ArrowDown';
    const shrink = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const step = event.shiftKey ? 40 : 10;
    if (event.key !== grow && event.key !== shrink) return;
    event.preventDefault();
    const next = applyDelta(barIndex, event.key === grow ? step : -step, resolved);
    commit(next);
    onResizeEnd?.(next);
  };

  const toggleCollapse = (barIndex: number, side: 'start' | 'end') => {
    const target = side === 'start' ? barIndex : barIndex + 1;
    const other = side === 'start' ? barIndex + 1 : barIndex;
    const next = [...resolved];
    if (collapsed[target] != null) {
      const restore = collapsed[target];
      next[target] = restore;
      next[other] = resolved[other] - restore;
      const rest = { ...collapsed }; delete rest[target];
      setCollapsed(rest);
    } else {
      setCollapsed({ ...collapsed, [target]: resolved[target] });
      next[other] = resolved[other] + resolved[target];
      next[target] = 0;
    }
    setSizes(next);
    onResize?.(next);
    onResizeEnd?.(next);
  };

  return <div {...props} ref={rootRef} className={cx('at-splitter', `at-splitter--${layout}`, activeBar != null && 'at-splitter--resizing', className)}>
    {panels.map((panel, index) => {
      const panelSize = shown[index] ?? 0;
      const collapsible = panels[index].props.collapsible;
      const nextCollapsible = panels[index + 1]?.props.collapsible;
      const canCollapseStart = collapsible === true || (typeof collapsible === 'object' && collapsible.end);
      const canCollapseEnd = nextCollapsible === true || (typeof nextCollapsible === 'object' && nextCollapsible.start);
      const resizable = panel.props.resizable !== false && panels[index + 1]?.props.resizable !== false;
      const { children: panelChildren, className: panelClassName, style: panelStyle, ...panelRest } = panelDomProps(panel.props);
      return <Fragment key={panel.key ?? index}>
        <div {...panelRest} className={cx('at-splitter__panel', panelClassName, collapsed[index] != null && 'at-splitter__panel--collapsed')} style={{ ...panelStyle, flex: `0 0 ${panelSize}px`, [horizontal ? 'width' : 'height']: panelSize }}>{panelChildren}</div>
        {index < count - 1 && <div
          className={cx('at-splitter__bar', activeBar === index && 'at-splitter__bar--active', !resizable && 'at-splitter__bar--static')}
          role="separator"
          aria-orientation={horizontal ? 'vertical' : 'horizontal'}
          aria-valuenow={total ? Math.round((panelSize / total) * 100) : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`调整第 ${index + 1} 与第 ${index + 2} 个面板`}
          tabIndex={resizable ? 0 : -1}
          onPointerDown={resizable ? onBarPointerDown(index) : undefined}
          onKeyDown={resizable ? onBarKeyDown(index) : undefined}
        >
          {(canCollapseStart || canCollapseEnd) && <span className="at-splitter__collapse">
            {canCollapseStart && <button type="button" className="at-splitter__collapse-button" aria-label={collapsed[index] != null ? '展开面板' : '收起左侧面板'} onPointerDown={(event) => event.stopPropagation()} onClick={() => toggleCollapse(index, 'start')}>{horizontal ? <ChevronLeft size={12} style={collapsed[index] != null ? { transform: 'rotate(180deg)' } : undefined} /> : <ChevronLeft size={12} style={{ transform: collapsed[index] != null ? 'rotate(-90deg)' : 'rotate(90deg)' }} />}</button>}
            {canCollapseEnd && <button type="button" className="at-splitter__collapse-button" aria-label={collapsed[index + 1] != null ? '展开面板' : '收起右侧面板'} onPointerDown={(event) => event.stopPropagation()} onClick={() => toggleCollapse(index, 'end')}>{horizontal ? <ChevronRight size={12} style={collapsed[index + 1] != null ? { transform: 'rotate(180deg)' } : undefined} /> : <ChevronRight size={12} style={{ transform: collapsed[index + 1] != null ? 'rotate(-90deg)' : 'rotate(90deg)' }} />}</button>}
          </span>}
          {!canCollapseStart && !canCollapseEnd && <span className="at-splitter__grip" aria-hidden="true" />}
        </div>}
      </Fragment>;
    })}
  </div>;
}

Splitter.Panel = SplitterPanel;
