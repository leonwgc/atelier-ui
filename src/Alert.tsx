import { useState, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/alert.css';
import { cx } from './utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

const icons: Record<AlertVariant, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  error: '×',
};

export function Alert({ variant = 'info', title, closable = false, onClose, children, className, ...props }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div {...props} className={cx('at-alert', `at-alert--${variant}`, className)} role={variant === 'error' ? 'alert' : 'status'}>
      <span className="at-alert__icon" aria-hidden="true">{icons[variant]}</span>
      <div className="at-alert__content">
        {title && <strong className="at-alert__title">{title}</strong>}
        {children && <div className="at-alert__description">{children}</div>}
      </div>
      {closable && <button type="button" className="at-alert__close" aria-label="关闭提示" onClick={() => { setVisible(false); onClose?.(); }}>×</button>}
    </div>
  );
}
