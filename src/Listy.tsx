import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import './styles/theme.css';
import './styles/listy.css';
import { cx } from './utils';

export interface ListyRef { scrollTo: (index: number, align?: 'start' | 'center' | 'end') => void; scrollToTop: () => void }

export interface ListyProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemKey?: (item: T, index: number) => string | number;
  height?: number;
  /** Fixed row height, or an estimate when `dynamicHeight` is on. */
  itemHeight?: number;
  /** Measure rows after render and correct their offsets. */
  dynamicHeight?: boolean;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  onVisibleRangeChange?: (range: { start: number; end: number }) => void;
  emptyText?: ReactNode;
  footer?: ReactNode;
  /** Visual divider between rows. */
  split?: boolean;
}

function ListyInner<T>({
  items, renderItem, itemKey, height = 320, itemHeight = 44, dynamicHeight = false, overscan = 4, onEndReached, endReachedThreshold = 120, onVisibleRangeChange, emptyText = '暂无数据', footer, split = true, className, style, ...props
}: ListyProps<T>, ref: Ref<ListyRef>) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const endFired = useRef(false);

  const offsets = useMemo(() => {
    const result = new Array<number>(items.length + 1);
    result[0] = 0;
    for (let index = 0; index < items.length; index++) result[index + 1] = result[index] + (dynamicHeight ? heights[index] ?? itemHeight : itemHeight);
    return result;
  }, [items.length, heights, dynamicHeight, itemHeight]);
  const total = offsets[items.length] ?? 0;

  const findIndex = useCallback((offset: number) => {
    let low = 0; let high = items.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (offsets[mid + 1] <= offset) low = mid + 1; else high = mid;
    }
    return low;
  }, [offsets, items.length]);

  const start = Math.max(0, findIndex(scrollTop) - overscan);
  const end = Math.min(items.length, findIndex(scrollTop + height) + 1 + overscan);

  useEffect(() => { onVisibleRangeChange?.({ start, end }); }, [start, end, onVisibleRangeChange]);
  useEffect(() => { endFired.current = false; }, [items.length]);

  const measure = useCallback((index: number, node: HTMLDivElement | null) => {
    if (!dynamicHeight || !node) return;
    const measured = node.getBoundingClientRect().height;
    setHeights((current) => (Math.abs((current[index] ?? itemHeight) - measured) < 0.5 ? current : { ...current, [index]: measured }));
  }, [dynamicHeight, itemHeight]);

  useImperativeHandle(ref, () => ({
    scrollTo: (index, align = 'start') => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const top = offsets[Math.max(0, Math.min(index, items.length - 1))] ?? 0;
      const rowHeight = (offsets[index + 1] ?? top + itemHeight) - top;
      const target = align === 'center' ? top - (height - rowHeight) / 2 : align === 'end' ? top - height + rowHeight : top;
      viewport.scrollTo({ top: Math.max(0, target) });
    },
    scrollToTop: () => viewportRef.current?.scrollTo({ top: 0 }),
  }), [offsets, items.length, itemHeight, height]);

  useLayoutEffect(() => {
    if (!dynamicHeight) return;
    setHeights((current) => (Object.keys(current).length ? {} : current));
  }, [items, dynamicHeight]);

  return <div {...props} className={cx('at-listy', split && 'at-listy--split', className)} style={{ height, ...style }}>
    <div
      ref={viewportRef}
      className="at-listy__viewport"
      role="list"
      onScroll={(event) => {
        const target = event.currentTarget;
        setScrollTop(target.scrollTop);
        if (onEndReached && !endFired.current && target.scrollTop + target.clientHeight >= target.scrollHeight - endReachedThreshold) { endFired.current = true; onEndReached(); }
      }}
    >
      {items.length === 0 ? <div className="at-listy__empty">{emptyText}</div> : <div className="at-listy__spacer" style={{ height: total }}>
        {items.slice(start, end).map((item, offset) => {
          const index = start + offset;
          const rowStyle: CSSProperties = { transform: `translateY(${offsets[index]}px)`, height: dynamicHeight ? undefined : itemHeight };
          return <div key={itemKey ? itemKey(item, index) : index} ref={(node) => measure(index, node)} role="listitem" className="at-listy__item" style={rowStyle} data-index={index}>{renderItem(item, index)}</div>;
        })}
      </div>}
      {footer && <div className="at-listy__footer">{footer}</div>}
    </div>
  </div>;
}

export const Listy = forwardRef(ListyInner) as <T>(props: ListyProps<T> & { ref?: Ref<ListyRef> }) => ReturnType<typeof ListyInner>;
