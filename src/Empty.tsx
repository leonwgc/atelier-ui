import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/empty.css';
import { cx } from './utils';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  description?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
}

export function Empty({ description = '暂无数据', image, children, className, ...props }: EmptyProps) {
  return <div {...props} className={cx('at-empty', className)}><div className="at-empty__image" aria-hidden="true">{image ?? <svg viewBox="0 0 120 82" focusable="false"><path d="M14 17h92v53H14z" fill="#f7f7fc" stroke="#e3e4ee" strokeWidth="2"/><path d="M27 30h66M27 41h51M27 52h37" stroke="#dedfee" strokeWidth="4" strokeLinecap="round"/><circle cx="90" cy="61" r="13" fill="#eeeaff" stroke="#dcd7ff" strokeWidth="2"/><path d="m86 61 3 3 6-7" fill="none" stroke="#7569e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div><div className="at-empty__description">{description}</div>{children && <div className="at-empty__actions">{children}</div>}</div>;
}
