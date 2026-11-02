import { useLocale } from './locale';
import { Fragment, useId, useMemo, useState, type CSSProperties, type Key, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/table.css';
import { Checkbox } from './Checkbox';
import { cx, useControllableState } from './utils';

export interface TableFilterOption { label: string; value: string }
export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Pins the column while scrolling horizontally; a numeric `width` is needed to stack several pinned columns. */
  fixed?: 'left' | 'right';
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sorter?: boolean | ((left: T, right: T) => number);
  filters?: TableFilterOption[];
  onFilter?: (value: string, record: T) => boolean;
}
export interface TableChange {
  page: number;
  pageSize: number;
  sort?: { key: string; direction: 'asc' | 'desc' };
  filters: Record<string, string>;
}
export interface TableExpandable<T> {
  expandedRowRender: (record: T, index: number) => ReactNode;
  rowExpandable?: (record: T) => boolean;
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  onExpandedRowsChange?: (keys: Key[]) => void;
}
export interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: keyof T | ((record: T) => Key);
  loading?: boolean;
  emptyText?: ReactNode;
  mode?: 'client' | 'server';
  pageSize?: number;
  currentPage?: number;
  total?: number;
  pageSizeOptions?: number[];
  onChange?: (change: TableChange) => void;
  rowSelection?: {
    selectedRowKeys: Key[];
    onChange: (keys: Key[], rows: T[]) => void;
  };
  expandable?: TableExpandable<T>;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns, dataSource, rowKey, loading = false, emptyText: emptyTextProp, mode = 'client', pageSize = 8, currentPage, total, pageSizeOptions = [8, 16, 32], onChange, rowSelection, expandable, className,
}: TableProps<T>) {
  const { t, formatLocale } = useLocale();
  const tableId = useId();
  const [expandedKeys, setExpandedKeys] = useControllableState<Key[]>(expandable?.expandedRowKeys, expandable?.defaultExpandedRowKeys ?? [], expandable?.onExpandedRowsChange);
  const columnCount = columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0);
  const SELECTION_WIDTH = 44;
  const leadingCount = (expandable ? 1 : 0) + (rowSelection ? 1 : 0);
  const hasFixedLeft = columns.some((column) => column.fixed === 'left');
  const lastLeft = columns.map((column) => column.fixed).lastIndexOf('left');
  const firstRight = columns.findIndex((column) => column.fixed === 'right');
  const leadingStyle = (position: number): CSSProperties | undefined => (hasFixedLeft ? { position: 'sticky', left: position * SELECTION_WIDTH } : undefined);
  const leadingClass = hasFixedLeft ? 'at-table__fixed at-table__fixed--left' : undefined;
  const fixedStyle = (column: TableColumn<T>): CSSProperties => {
    if (!column.fixed) return {};
    const index = columns.indexOf(column);
    const width = (item: TableColumn<T>) => (typeof item.width === 'number' ? item.width : 0);
    const offset = column.fixed === 'left'
      ? leadingCount * SELECTION_WIDTH + columns.slice(0, index).filter((item) => item.fixed === 'left').reduce((sum, item) => sum + width(item), 0)
      : columns.slice(index + 1).filter((item) => item.fixed === 'right').reduce((sum, item) => sum + width(item), 0);
    return { position: 'sticky', [column.fixed]: offset };
  };
  const fixedClass = (column: TableColumn<T>, index: number) => {
    if (!column.fixed) return undefined;
    const edge = column.fixed === 'left' ? lastLeft === index : firstRight === index;
    return cx('at-table__fixed', `at-table__fixed--${column.fixed}`, edge && 'at-table__fixed--edge');
  };
  const emptyText = emptyTextProp === undefined ? t('common.noData') : emptyTextProp;

  const [internalPage, setInternalPage] = useState(1);
  const page = currentPage ?? internalPage;
  const [sort, setSort] = useState<TableChange['sort']>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeSize, setActiveSize] = useState(pageSize);
  const getKey = (record: T): Key => typeof rowKey === 'function' ? rowKey(record) : record[rowKey] as Key;
  const rows = useMemo(() => {
    if (mode === 'server') return dataSource;
    let next = [...dataSource];
    for (const [key, value] of Object.entries(filters)) {
      const column = columns.find((item) => item.key === key);
      if (value && column) next = next.filter((record) => column.onFilter?.(value, record) ?? String(record[column.dataIndex as keyof T] ?? '') === value);
    }
    if (sort) {
      const column = columns.find((item) => item.key === sort.key);
      next.sort((left, right) => {
        const result = typeof column?.sorter === 'function' ? column.sorter(left, right) : String(left[column?.dataIndex as keyof T] ?? '').localeCompare(String(right[column?.dataIndex as keyof T] ?? ''), formatLocale, { numeric: true });
        return sort.direction === 'asc' ? result : -result;
      });
    }
    return next;
  }, [columns, dataSource, filters, mode, sort, formatLocale]);
  const totalRows = mode === 'server' ? total ?? dataSource.length : rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / activeSize));
  const visibleRows = mode === 'client' ? rows.slice((page - 1) * activeSize, page * activeSize) : rows;
  const changePage = (next: number, nextPageSize = activeSize) => {
    setInternalPage(next);
    onChange?.({ page: next, pageSize: nextPageSize, sort, filters });
  };
  const selectPage = (checked: boolean) => {
    if (!rowSelection) return;
    const pageKeys = visibleRows.map(getKey);
    const keys = checked ? [...new Set([...rowSelection.selectedRowKeys, ...pageKeys])] : rowSelection.selectedRowKeys.filter((key) => !pageKeys.includes(key));
    rowSelection.onChange(keys, dataSource.filter((record) => keys.includes(getKey(record))));
  };

  return <div className={cx('at-table-shell', className)}>
    <div className="at-table-scroll"><table className="at-table">
      <thead><tr>
        {expandable && <th className={cx('at-table__selection', leadingClass)} style={leadingStyle(0)}><span className="at-table__sr">{t('table.expand')}</span></th>}
        {rowSelection && <th className={cx('at-table__selection', leadingClass)} style={leadingStyle(expandable ? 1 : 0)}><Checkbox aria-label={t('table.selectAll')} checked={visibleRows.length > 0 && visibleRows.every((row) => rowSelection.selectedRowKeys.includes(getKey(row)))} onChange={(event) => selectPage(event.target.checked)} /></th>}
        {columns.map((column, columnIndex) => <th key={column.key} className={fixedClass(column, columnIndex)} style={{ width: column.width, textAlign: column.align, ...fixedStyle(column) }}>
          <div className="at-table__heading"><span>{column.title}</span>{column.sorter && <button type="button" className="at-table__sort" aria-label={t('table.sort', { title: String(column.title) })} onClick={() => { const direction = sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc'; const next = { key: column.key, direction } as const; setSort(next); setInternalPage(1); onChange?.({ page: 1, pageSize: activeSize, sort: next, filters }); }}>↕</button>}
            {column.filters?.length ? <select className="at-table__filter" aria-label={t('table.filter', { title: String(column.title) })} value={filters[column.key] ?? ''} onChange={(event) => { const next = { ...filters, [column.key]: event.target.value }; setFilters(next); setInternalPage(1); onChange?.({ page: 1, pageSize: activeSize, sort, filters: next }); }}><option value="">{t('table.all')}</option>{column.filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select> : null}
          </div>
        </th>)}
      </tr></thead>
      <tbody>
        {loading ? <tr><td colSpan={columnCount}><div className="at-table__status"><span className="at-spinner" />{t('table.loading')}</div></td></tr>
          : visibleRows.length === 0 ? <tr><td colSpan={columnCount}><div className="at-table__status">{emptyText}</div></td></tr>
            : visibleRows.map((record, rowIndex) => {
              const key = getKey(record);
              const canExpand = expandable ? (expandable.rowExpandable?.(record) ?? true) : false;
              const expanded = canExpand && expandedKeys.includes(key);
              const panelId = `${tableId}-expanded-${rowIndex}`;
              return <Fragment key={key}>
              <tr>
                {expandable && <td className={cx('at-table__selection', leadingClass)} style={leadingStyle(0)}>{canExpand && <button type="button" className="at-table__expand" aria-expanded={expanded} aria-controls={expanded ? panelId : undefined} aria-label={t(expanded ? 'table.collapseRow' : 'table.expandRow', { row: rowIndex + 1 })} onClick={() => setExpandedKeys(expanded ? expandedKeys.filter((item) => item !== key) : [...expandedKeys, key])}>›</button>}</td>}
                {rowSelection && <td className={cx('at-table__selection', leadingClass)} style={leadingStyle(expandable ? 1 : 0)}><Checkbox aria-label={t('table.selectRow', { row: rowIndex + 1 })} checked={rowSelection.selectedRowKeys.includes(key)} onChange={(event) => { const next = event.target.checked ? [...rowSelection.selectedRowKeys, key] : rowSelection.selectedRowKeys.filter((item) => item !== key); rowSelection.onChange(next, dataSource.filter((item) => next.includes(getKey(item)))); }} /></td>}
                {columns.map((column, columnIndex) => <td key={column.key} className={fixedClass(column, columnIndex)} style={{ textAlign: column.align, ...fixedStyle(column) }}>{column.render ? column.render(column.dataIndex ? record[column.dataIndex as keyof T] : undefined, record, rowIndex) : String(column.dataIndex ? record[column.dataIndex as keyof T] ?? '' : '')}</td>)}
              </tr>
              {expanded && expandable && <tr className="at-table__expanded-row"><td id={panelId} colSpan={columnCount}>{expandable.expandedRowRender(record, rowIndex)}</td></tr>}
              </Fragment>;
            })}
      </tbody>
    </table></div>
    <div className="at-table__pagination"><span>{t('pagination.total', { total: totalRows })}</span><div className="at-table__page-controls"><label>{t('pagination.perPage')}<select aria-label={t('pagination.pageSize')} value={activeSize} onChange={(event) => { const nextSize = Number(event.target.value); setActiveSize(nextSize); changePage(1, nextSize); }}>{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select> {t('pagination.items')}</label><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>{t('common.previous')}</button><span className="at-table__page">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>{t('common.next')}</button></div></div>
  </div>;
}
