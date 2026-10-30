import { useLocale } from './locale';
import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/tag.css';
import { cx } from './utils';

export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export function Tag({ variant = 'neutral', closable = false, onClose, children, className, ...props }: TagProps) {
  const { t } = useLocale();

  return (
    <span {...props} className={cx('at-tag', `at-tag--${variant}`, className)}>
      {children}
      {closable && <button type="button" className="at-tag__close" aria-label={t('tag.remove')} onClick={onClose}>×</button>}
    </span>
  );
}
