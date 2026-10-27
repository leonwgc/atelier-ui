import { useEffect, useState, type HTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/avatar.css';
import { cx } from './utils';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt, name, size = 'md', className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [src]);
  const fallback = name?.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <span {...props} className={cx('at-avatar', `at-avatar--${size}`, className)} aria-label={alt ?? name ?? '用户'}>
      {src && !imageFailed
        ? <img className="at-avatar__image" src={src} alt={alt ?? name ?? ''} onError={() => setImageFailed(true)} />
        : <span className="at-avatar__fallback" aria-hidden="true">{fallback}</span>}
    </span>
  );
}
