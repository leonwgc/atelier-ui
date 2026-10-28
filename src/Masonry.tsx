import { Children, useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/masonry.css';
import { cx } from './utils';

export type MasonryColumns = number | Record<number, number>;

export interface MasonryProps<T = ReactNode> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Legacy node array; prefer `children` or `dataSource` + `renderItem`. */
  items?: T[];
  dataSource?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  itemKey?: (item: T, index: number) => string | number;
  children?: ReactNode;
  /** Fixed count, or a breakpoint map keyed by minimum container width, e.g. `{ 0: 1, 600: 2, 900: 3 }`. */
  columns?: MasonryColumns;
  gap?: number | [number, number];
  /** Reorder items so the shortest column always receives the next one. */
  sequential?: boolean;
  onLayout?: (info: { columns: number; height: number }) => void;
}

interface Placement { x: number; y: number; width: number }

function resolveColumns(columns: MasonryColumns, width: number) {
  if (typeof columns === 'number') return Math.max(1, columns);
  const breakpoints = Object.keys(columns).map(Number).sort((a, b) => a - b);
  let result = columns[breakpoints[0]] ?? 1;
  breakpoints.forEach((point) => { if (width >= point) result = columns[point]; });
  return Math.max(1, result);
}

export function Masonry<T = ReactNode>({ items, dataSource, renderItem, itemKey, children, columns = 3, gap = 16, sequential = false, onLayout, className, style, ...props }: MasonryProps<T>) {
  const source = dataSource ?? items ?? null;
  const nodes = source ? source.map((item, index) => (renderItem ? renderItem(item, index) : (item as ReactNode))) : Children.toArray(children);
  const count = nodes.length;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [height, setHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [columnGap, rowGap] = Array.isArray(gap) ? gap : [gap, gap];
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;

  const layout = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const width = root.clientWidth;
    const columnCount = resolveColumns(columns, width);
    const columnWidth = (width - columnGap * (columnCount - 1)) / columnCount;
    const heights = new Array<number>(columnCount).fill(0);
    const next: Placement[] = [];
    itemRefs.current.slice(0, count).forEach((element, index) => {
      const itemHeight = element?.getBoundingClientRect().height ?? 0;
      const column = sequential ? index % columnCount : heights.indexOf(Math.min(...heights));
      next[index] = { x: column * (columnWidth + columnGap), y: heights[column], width: columnWidth };
      heights[column] += itemHeight + rowGap;
    });
    const total = Math.max(0, Math.max(...heights, 0) - rowGap);
    setPlacements((previous) => (previous.length === next.length && previous.every((item, index) => item.x === next[index].x && item.y === next[index].y && item.width === next[index].width) ? previous : next));
    setHeight(total);
    setReady(true);
    onLayoutRef.current?.({ columns: columnCount, height: total });
  }, [columns, columnGap, rowGap, count, sequential]);

  useLayoutEffect(() => {
    layout();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => layout());
    observer.observe(root);
    itemRefs.current.slice(0, count).forEach((element) => { if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [layout, nodes.length]);

  return <div {...props} ref={rootRef} className={cx('at-masonry', ready && 'at-masonry--ready', className)} style={{ height: ready ? height : undefined, ...style }}>
    {nodes.map((node, index) => {
      const placement = placements[index];
      const key = itemKey && source ? itemKey(source[index], index) : index;
      const itemStyle: CSSProperties = placement
        ? { transform: `translate(${placement.x}px, ${placement.y}px)`, width: placement.width }
        : { width: `calc((100% - ${columnGap}px * ${(typeof columns === 'number' ? columns : 3) - 1}) / ${typeof columns === 'number' ? columns : 3})`, visibility: 'hidden' };
      return <div key={key} ref={(element) => { itemRefs.current[index] = element; }} className="at-masonry__item" style={itemStyle}>{node}</div>;
    })}
  </div>;
}
