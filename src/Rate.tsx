import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/rate.css';
import { Star } from './internal/icons';
import { clamp, cx, useControllableState, type Size } from './utils';

export interface RateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number | null) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  size?: Size;
  /** Custom glyph; receives the 1-based index. */
  character?: ReactNode | ((index: number) => ReactNode);
  /** Accessible names and visible captions per star. */
  tooltips?: string[];
  label?: string;
}

export function Rate({
  value, defaultValue = 0, onChange, onHoverChange, count = 5, allowHalf = false, allowClear = true, disabled = false, size = 'md', character, tooltips, label = '评分', className, ...props
}: RateProps) {
  const id = useId();
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? current;
  const unit = allowHalf ? 0.5 : 1;

  const valueFromPointer = (event: React.PointerEvent<HTMLElement>, index: number) => {
    if (!allowHalf) return index + 1;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? index + 0.5 : index + 1;
  };
  const commit = (next: number) => {
    if (disabled) return;
    setCurrent(allowClear && next === current ? 0 : next);
  };
  const updateHover = (next: number | null) => {
    if (disabled) return;
    setHover(next);
    onHoverChange?.(next);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = clamp(current + unit, 0, count);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = clamp(current - unit, 0, count);
    if (event.key === 'Home') next = unit;
    if (event.key === 'End') next = count;
    if (next == null) return;
    event.preventDefault();
    setCurrent(next);
  };

  const glyph = (index: number) => (typeof character === 'function' ? character(index + 1) : character ?? <Star size={size === 'sm' ? 18 : size === 'lg' ? 32 : 26} />);
  const caption = hover != null && tooltips?.[Math.ceil(hover) - 1];

  return <div {...props} className={cx('at-rate', `at-rate--${size}`, disabled && 'at-rate--disabled', className)}>
    <div
      className="at-rate__stars"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={current}
      aria-valuetext={tooltips?.[Math.ceil(current) - 1] ?? `${current} 星`}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => updateHover(null)}
    >
      {Array.from({ length: count }, (_, index) => {
        const fill = clamp(shown - index, 0, 1);
        const starLabel = tooltips?.[index] ?? `${index + 1} 星`;
        return <button
          key={index}
          type="button"
          tabIndex={-1}
          id={`${id}-${index}`}
          className={cx('at-rate__star', fill === 1 && 'at-rate__star--active', fill > 0 && fill < 1 && 'at-rate__star--half', hover != null && fill > 0 && 'at-rate__star--hover')}
          aria-label={starLabel}
          aria-pressed={current > index}
          disabled={disabled}
          onPointerMove={(event) => updateHover(valueFromPointer(event, index))}
          onPointerDown={(event) => commit(valueFromPointer(event, index))}
          onClick={(event) => { if (event.detail === 0) commit(index + 1); }}
        >
          <span className="at-rate__base">{glyph(index)}</span>
          <span className="at-rate__fill" style={{ width: `${fill * 100}%` }} aria-hidden="true">{glyph(index)}</span>
        </button>;
      })}
    </div>
    {tooltips && <span className="at-rate__caption" aria-live="polite">{caption || tooltips[Math.ceil(current) - 1] || ''}</span>}
  </div>;
}
