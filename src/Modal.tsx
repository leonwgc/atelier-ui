import { ConfigProvider, useConfig, type ColorScheme } from './ConfigProvider';
import { useLocale, type LocaleInput } from './locale';
import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './styles/theme.css';
import './styles/modal.css';
import { Button } from './Button';
import { cx } from './utils';

const modalStack: HTMLDivElement[] = [];
let bodyOverflow = '';

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
  { open, title, description, onClose, onOk, okText: okTextProp, cancelText: cancelTextProp, confirmLoading = false, footer, maskClosable = true, closeOnEscape = true, width = 520, className, children, ...props },
  ref,
) {
  const { colorScheme } = useConfig();
  const { t, locale } = useLocale();
  const okText = okTextProp === undefined ? t('common.ok') : okTextProp;
  const cancelText = cancelTextProp === undefined ? t('common.cancel') : cancelTextProp;

  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!modalStack.length) bodyOverflow = document.body.style.overflow;
    modalStack.push(panel);
    document.body.style.overflow = 'hidden';
    panel.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== panel) return;
      if (event.key === 'Escape' && closeOnEscape) { event.preventDefault(); onCloseRef.current(); }
      if (event.key === 'Tab') {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter((element) => {
            if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[hidden], [inert]')) return false;
            if (getComputedStyle(element).visibility !== 'visible') return false;
            for (let parent: HTMLElement | null = element; parent && parent !== panel; parent = parent.parentElement) {
              if (getComputedStyle(parent).display === 'none') return false;
            }
            return true;
          });
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); panel.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      const wasTop = modalStack[modalStack.length - 1] === panel;
      modalStack.splice(modalStack.indexOf(panel), 1);
      if (!modalStack.length) document.body.style.overflow = bodyOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (wasTop && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, closeOnEscape]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="at-modal-mask" onMouseDown={(event) => { if (event.target === event.currentTarget && maskClosable) onClose(); }}>
      <div {...props} ref={(node) => { if (typeof ref === 'function') ref(node); else if (ref) (ref as unknown as { current: HTMLDivElement | null }).current = node; panelRef.current = node; }} role="dialog" data-at-theme={colorScheme} lang={locale} aria-modal="true" aria-labelledby={title ? titleId : undefined} tabIndex={-1} className={cx('at-modal', className)} style={{ width, ...props.style }}>
        <div className="at-modal__header"><div><h2 id={titleId} className="at-modal__title">{title}</h2>{description && <p className="at-modal__description">{description}</p>}</div><button type="button" className="at-modal__close" onClick={onClose} aria-label={t('common.close')}>×</button></div>
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
  colorScheme?: ColorScheme;
  locale?: LocaleInput;
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
  function ConfirmDialog() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pendingRef = useRef(false);
    const pack = useLocale();
    const cancel = () => {
      if (pendingRef.current) return;
      options.onCancel?.();
      close();
    };
    const confirm = async () => {
      if (pendingRef.current || !open) return;
      pendingRef.current = true;
      setPending(true);
      setError(null);
      try {
        await options.onOk?.();
        close();
      } catch (reason) {
        if (open) setError(reason instanceof Error && reason.message ? reason.message : pack.t('modal.confirmFailed'));
      } finally {
        pendingRef.current = false;
        if (open) setPending(false);
      }
    };
    return <Modal
      open
      title={options.title}
      onClose={cancel}
      footer={<>
        <Button disabled={pending} onClick={cancel}>{options.cancelText ?? pack.t('common.cancel')}</Button>
        <Button variant={options.danger ? 'danger' : 'primary'} loading={pending} onClick={() => void confirm()}>{options.okText ?? pack.t('common.ok')}</Button>
      </>}
    >{options.content}{error && <p className="at-modal__error" role="alert">{error}</p>}</Modal>;
  }
  root.render(<ConfigProvider locale={options.locale} colorScheme={options.colorScheme}><ConfirmDialog /></ConfigProvider>);
  return { destroy: close };
}

/** Provider-bound alternative to the standalone Modal.confirm API. */
export function useModal() {
  const pack = useLocale();
  const { colorScheme } = useConfig();
  return { confirm: (options: ConfirmOptions) => showConfirm({ ...options, locale: options.locale ?? pack, colorScheme: options.colorScheme ?? colorScheme }) };
}
