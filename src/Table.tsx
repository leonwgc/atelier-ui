import { useMemo, useState, type Key, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/table.css';
import { Checkbox } from './Checkbox';
import { cx } from './utils';

export interface TableFilterOption { label: string; value: string }
export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
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
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns, dataSource, rowKey, loading = false, emptyText = '暂无数据', mode = 'client', pageSize = 8, currentPage, total, pageSizeOptions = [8, 16, 32], onChange, rowSelection, className,
}: TableProps<T>) {
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
        const result = typeof column?.sorter === 'function' ? column.sorter(left, right) : String(left[column?.dataIndex as keyof T] ?? '').localeCompare(String(right[column?.dataIndex as keyof T] ?? ''), 'zh-CN', { numeric: true });
        return sort.direction === 'asc' ? result : -result;
      });
    }
    return next;
  }, [columns, dataSource, filters, mode, sort]);
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
        {rowSelection && <th className="at-table__selection"><Checkbox aria-label="选择本页全部行" checked={visibleRows.length > 0 && visibleRows.every((row) => rowSelection.selectedRowKeys.includes(getKey(row)))} onChange={(event) => selectPage(event.target.checked)} /></th>}
        {columns.map((column) => <th key={column.key} style={{ width: column.width, textAlign: column.align }}>
          <div className="at-table__heading"><span>{column.title}</span>{column.sorter && <button type="button" className="at-table__sort" aria-label={`按${String(column.title)}排序`} onClick={() => { const direction = sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc'; const next = { key: column.key, direction } as const; setSort(next); setInternalPage(1); onChange?.({ page: 1, pageSize: activeSize, sort: next, filters }); }}>↕</button>}
            {column.filters?.length ? <select className="at-table__filter" aria-label={`筛选${String(column.title)}`} value={filters[column.key] ?? ''} onChange={(event) => { const next = { ...filters, [column.key]: event.target.value }; setFilters(next); setInternalPage(1); onChange?.({ page: 1, pageSize: activeSize, sort, filters: next }); }}><option value="">全部</option>{column.filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select> : null}
          </div>
        </th>)}
      </tr></thead>
      <tbody>
        {loading ? <tr><td colSpan={columns.length + (rowSelection ? 1 : 0)}><div className="at-table__status"><span className="at-spinner" />正在加载数据…</div></td></tr>
          : visibleRows.length === 0 ? <tr><td colSpan={columns.length + (rowSelection ? 1 : 0)}><div className="at-table__status">{emptyText}</div></td></tr>
            : visibleRows.map((record, rowIndex) => <tr key={getKey(record)}>
              {rowSelection && <td className="at-table__selection"><Checkbox aria-label={`选择第 ${rowIndex + 1} 行`} checked={rowSelection.selectedRowKeys.includes(getKey(record))} onChange={(event) => { const next = event.target.checked ? [...rowSelection.selectedRowKeys, getKey(record)] : rowSelection.selectedRowKeys.filter((key) => key !== getKey(record)); rowSelection.onChange(next, dataSource.filter((item) => next.includes(getKey(item)))); }} /></td>}
              {columns.map((column) => <td key={column.key} style={{ textAlign: column.align }}>{column.render ? column.render(column.dataIndex ? record[column.dataIndex as keyof T] : undefined, record, rowIndex) : String(column.dataIndex ? record[column.dataIndex as keyof T] ?? '' : '')}</td>)}
            </tr>)}
      </tbody>
    </table></div>
    <div className="at-table__pagination"><span>共 {totalRows} 条</span><div className="at-table__page-controls"><label>每页 <select value={activeSize} onChange={(event) => { const nextSize = Number(event.target.value); setActiveSize(nextSize); changePage(1, nextSize); }}>{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select> 条</label><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>上一页</button><span className="at-table__page">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>下一页</button></div></div>
  </div>;
}
