import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/button.css';
import { cx, type Size } from './utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon, fullWidth = false, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cx('at-button', `at-button--${variant}`, `at-button--${size}`, fullWidth && 'at-button--full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="at-spinner at-spinner--inline" aria-hidden="true" /> : icon ? <span className="at-button__icon">{icon}</span> : null}
      {children}
    </button>
  );
});
