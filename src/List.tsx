import { useLocale } from './locale';
import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/list.css';
import { Empty } from './Empty';
import { Pagination } from './Pagination';
import { Skeleton } from './Skeleton';
import { cx, type Size } from './utils';

export interface ListGridConfig { column?: number; gutter?: number; xs?: number; sm?: number; md?: number; lg?: number }
export interface ListPaginationConfig { pageSize?: number; current?: number; defaultCurrent?: number; onChange?: (page: number, pageSize: number) => void; position?: 'top' | 'bottom' | 'both'; align?: 'start' | 'center' | 'end'; showSizeChanger?: boolean; pageSizeOptions?: number[] }

export interface ListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  dataSource: T[];
  renderItem: (item: T, index: number) => ReactNode;
  rowKey?: keyof T | ((item: T, index: number) => string | number);
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  split?: boolean;
  size?: Size;
  loading?: boolean;
  /** Skeleton rows while loading. */
  loadingRows?: number;
  emptyText?: ReactNode;
  grid?: ListGridConfig;
  pagination?: boolean | ListPaginationConfig;
  /** Called when the list is scrolled to its end (requires a fixed `height`). */
  onEndReached?: () => void;
  height?: number;
}

function useColumnCount(grid: ListGridConfig | undefined, element: HTMLElement | null) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!grid || !element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [grid, element]);
  if (!grid) return 1;
  const { column = 1, xs, sm, md, lg } = grid;
  if (width === 0) return column;
  if (width < 576) return xs ?? column;
  if (width < 768) return sm ?? xs ?? column;
  if (width < 992) return md ?? sm ?? xs ?? column;
  return lg ?? md ?? sm ?? xs ?? column;
}

export function List<T>({
  dataSource, renderItem, rowKey, header, footer, bordered = false, split = true, size = 'md', loading = false, loadingRows = 3, emptyText: emptyTextProp, grid, pagination = false, onEndReached, height, className, style, ...props
}: ListProps<T>) {
  const { t } = useLocale();
  const emptyText = emptyTextProp === undefined ? t('common.noData') : emptyTextProp;

  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const columns = useColumnCount(grid, rootElement);
  const paginationConfig: ListPaginationConfig | null = pagination ? (pagination === true ? {} : pagination) : null;
  const [page, setPage] = useState(paginationConfig?.defaultCurrent ?? 1);
  const [pageSize, setPageSize] = useState(paginationConfig?.pageSize ?? 10);
  const currentPage = paginationConfig?.current ?? page;
  const endReachedRef = useRef(onEndReached);
  endReachedRef.current = onEndReached;

  const items = useMemo(() => {
    if (!paginationConfig) return dataSource;
    const start = (currentPage - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [dataSource, paginationConfig, currentPage, pageSize]);

  const getKey = (item: T, index: number) => {
    if (typeof rowKey === 'function') return rowKey(item, index);
    if (rowKey && item && typeof item === 'object') return String((item as Record<string, unknown>)[rowKey as string]);
    return index;
  };

  const paginationNode = paginationConfig && dataSource.length > 0 && <div className={cx('at-list__pagination', `at-list__pagination--${paginationConfig.align ?? 'end'}`)}>
    <Pagination current={currentPage} pageSize={pageSize} total={dataSource.length} showSizeChanger={paginationConfig.showSizeChanger} pageSizeOptions={paginationConfig.pageSizeOptions} onChange={(nextPage, nextSize) => { if (paginationConfig.current === undefined) setPage(nextPage); setPageSize(nextSize); paginationConfig.onChange?.(nextPage, nextSize); }} />
  </div>;
  const position = paginationConfig?.position ?? 'bottom';

  const body = loading
    ? <div className="at-list__skeletons" aria-busy="true" aria-label={t('common.loading')}>{Array.from({ length: loadingRows }, (_, index) => <div key={index} className="at-list__item"><Skeleton active avatar title paragraph={{ rows: 1 }} /></div>)}</div>
    : items.length === 0
      ? <div className="at-list__empty"><Empty description={emptyText} /></div>
      : <ul className={cx('at-list__items', grid && 'at-list__items--grid')} style={grid ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: grid.gutter ?? 16 } : undefined}>
        {items.map((item, index) => <li key={getKey(item, index)} className="at-list__cell">{renderItem(item, index)}</li>)}
      </ul>;

  return <div
    {...props}
    ref={setRootElement}
    className={cx('at-list', `at-list--${size}`, bordered && 'at-list--bordered', split && !grid && 'at-list--split', grid && 'at-list--grid', className)}
    style={style}
  >
    {header && <div className="at-list__header">{header}</div>}
    {(position === 'top' || position === 'both') && paginationNode}
    <div
      className="at-list__body"
      style={height ? { maxHeight: height, overflowY: 'auto' } : undefined}
      onScroll={height && onEndReached ? (event) => { const target = event.currentTarget; if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24) endReachedRef.current?.(); } : undefined}
    >{body}</div>
    {(position === 'bottom' || position === 'both') && paginationNode}
    {footer && <div className="at-list__footer">{footer}</div>}
  </div>;
}

export interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode[];
  extra?: ReactNode;
  children?: ReactNode;
}
export function ListItem({ actions, extra, children, className, ...props }: ListItemProps) {
  return <div {...props} className={cx('at-list__item', className)}>
    <div className="at-list__item-main">
      <div className="at-list__item-content">{children}</div>
      {actions?.length ? <ul className="at-list__actions">{actions.map((action, index) => <li key={index} className="at-list__action">{action}</li>)}</ul> : null}
    </div>
    {extra && <div className="at-list__item-extra">{extra}</div>}
  </div>;
}

export interface ListItemMetaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}
export function ListItemMeta({ avatar, title, description, className, ...props }: ListItemMetaProps) {
  return <div {...props} className={cx('at-list__meta', className)}>
    {avatar && <div className="at-list__meta-avatar">{avatar}</div>}
    <div className="at-list__meta-body">
      {title && <div className="at-list__meta-title">{title}</div>}
      {description && <div className="at-list__meta-description">{description}</div>}
    </div>
  </div>;
}

ListItem.Meta = ListItemMeta;
List.Item = ListItem;
