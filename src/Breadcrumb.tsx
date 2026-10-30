import { useLocale } from './locale';
import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/breadcrumb.css';
import { cx } from './utils';

export interface BreadcrumbItem { title: ReactNode; href?: string; onClick?: () => void; }
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export function Breadcrumb({ items, separator = '/', className, ...props }: BreadcrumbProps) {
  const { t } = useLocale();

  return <nav {...props} aria-label={props['aria-label'] ?? t('breadcrumb.label')} className={cx('at-breadcrumb', className)}><ol>{items.map((item, index) => <li key={index} aria-current={index === items.length - 1 ? 'page' : undefined}>{item.href && index !== items.length - 1 ? <a href={item.href} onClick={item.onClick}>{item.title}</a> : item.onClick && index !== items.length - 1 ? <button type="button" onClick={item.onClick}>{item.title}</button> : <span>{item.title}</span>}{index < items.length - 1 && <span className="at-breadcrumb__separator" aria-hidden="true">{separator}</span>}</li>)}</ol></nav>;
}
