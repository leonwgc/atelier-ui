import { createElement, forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './styles/theme.css';
import './styles/modal.css';
import { Button } from './Button';
import { cx } from './utils';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  onOk?: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  footer?: ReactNode | null;
  maskClosable?: boolean;
  closeOnEscape?: boolean;
  width?: number | string;
  children?: ReactNode;
}

export const Modal = Object.assign(forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { open, title, description, onClose, onOk, okText = '确定', cancelText = '取消', confirmLoading = false, footer, maskClosable = true, closeOnEscape = true, width = 520, className, children, ...props },
  ref,
) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) onClose();
      if (event.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="at-modal-mask" onMouseDown={(event) => { if (event.target === event.currentTarget && maskClosable) onClose(); }}>
      <div {...props} ref={(node) => { if (typeof ref === 'function') ref(node); else if (ref) (ref as unknown as { current: HTMLDivElement | null }).current = node; panelRef.current = node; }} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} tabIndex={-1} className={cx('at-modal', className)} style={{ width, ...props.style }}>
        <div className="at-modal__header"><div><h2 id={titleId} className="at-modal__title">{title}</h2>{description && <p className="at-modal__description">{description}</p>}</div><button type="button" className="at-modal__close" onClick={onClose} aria-label="关闭">×</button></div>
        <div className="at-modal__body">{children}</div>
        {footer !== null && <div className="at-modal__footer">{footer ?? <><Button onClick={onClose}>{cancelText}</Button><Button variant="primary" loading={confirmLoading} onClick={() => void onOk?.()}>{okText}</Button></>}</div>}
      </div>
    </div>,
    document.body,
  );
}), {
  confirm: (options: ConfirmOptions) => showConfirm(options),
});

export interface ConfirmOptions {
  title: ReactNode;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

function showConfirm(options: ConfirmOptions) {
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  const root = createRoot(mount);
  let open = true;
  const close = () => {
    if (!open) return;
    open = false;
    root.unmount();
    mount.remove();
  };
  const ConfirmDialog = () => createElement(Modal, {
    open: true,
    title: options.title,
    onClose: () => { options.onCancel?.(); close(); },
    cancelText: options.cancelText,
    okText: options.okText,
    onOk: async () => { await options.onOk?.(); close(); },
    footer: <><Button onClick={() => { options.onCancel?.(); close(); }}>{options.cancelText ?? '取消'}</Button><Button variant={options.danger ? 'danger' : 'primary'} onClick={async () => { await options.onOk?.(); close(); }}>{options.okText ?? '确定'}</Button></>,
  }, options.content);
  root.render(createElement(ConfirmDialog));
  return { destroy: close };
}
