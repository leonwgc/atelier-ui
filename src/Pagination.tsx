import { type HTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/pagination.css';
import { cx } from './utils';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
}

export function Pagination({ current, pageSize, total, onChange, pageSizeOptions = [10, 20, 50], showSizeChanger = false, className, ...props }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, current), pages);
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);
  return <nav {...props} aria-label="分页" className={cx('at-pagination', className)}><span className="at-pagination__total">共 {total} 条</span>{showSizeChanger && <label className="at-pagination__size">每页<select aria-label="每页条数" value={pageSize} onChange={(event) => onChange(1, Number(event.target.value))}>{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select>条</label>}<button type="button" aria-label="上一页" disabled={page <= 1} onClick={() => onChange(page - 1, pageSize)}>上一页</button>{pageNumbers.map((number) => <button type="button" key={number} aria-label={`第 ${number} 页`} aria-current={number === page ? 'page' : undefined} className={number === page ? 'at-pagination__page--active' : undefined} onClick={() => onChange(number, pageSize)}>{number}</button>)}{pages > 5 && <span aria-hidden="true">…</span>}<button type="button" aria-label="下一页" disabled={page >= pages} onClick={() => onChange(page + 1, pageSize)}>下一页</button></nav>;
}
