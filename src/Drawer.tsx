import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/drawer.css';
import { cx } from './utils';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  placement?: 'left' | 'right';
  width?: number | string;
  maskClosable?: boolean;
  closeOnEscape?: boolean;
  children?: ReactNode;
}

export function Drawer({ open, title, onClose, placement = 'right', width = 420, maskClosable = true, closeOnEscape = true, className, children, ...props }: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) { previousFocusRef.current = null; return; }
    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current ??= document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) onCloseRef.current();
      if (event.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) { event.preventDefault(); panelRef.current?.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeyDown); previousFocusRef.current?.focus(); };
  }, [open, closeOnEscape]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(<div className="at-drawer-mask" onMouseDown={(event) => { if (event.target === event.currentTarget && maskClosable) onClose(); }}><div {...props} ref={panelRef} role="dialog" aria-modal="true" aria-label={props['aria-label'] ?? (title ? undefined : '侧边抽屉')} aria-labelledby={title ? titleId : undefined} tabIndex={-1} className={cx('at-drawer', `at-drawer--${placement}`, className)} style={{ width, ...props.style }}><header className="at-drawer__header"><h2 id={titleId}>{title}</h2><button type="button" aria-label="关闭抽屉" onClick={onClose}>×</button></header><div className="at-drawer__body">{children}</div></div></div>, document.body);
}
