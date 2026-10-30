import { useLocale } from './locale';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/segmented.css';
import { cx, useControllableState, type Size } from './utils';

export interface SegmentedOption<T extends string = string> { label: ReactNode; value: T; icon?: ReactNode; disabled?: boolean }

export interface SegmentedProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: Array<T | SegmentedOption<T>>;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: Size;
  block?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  /** Visual shape of the moving indicator. */
  shape?: 'default' | 'round';
  label?: string;
}

export function Segmented<T extends string = string>({
  options, value, defaultValue, onChange, size = 'md', block = false, disabled = false, vertical = false, shape = 'default', label: labelProp, className, ...props
}: SegmentedProps<T>) {
  const { t } = useLocale();
  const label = labelProp === undefined ? t('segmented.label') : labelProp;

  const items = options.map((option) => (typeof option === 'string' ? { label: option, value: option } as SegmentedOption<T> : option));
  const [current, setCurrent] = useControllableState<T | undefined>(value, defaultValue ?? items.find((item) => !item.disabled)?.value, (next) => { if (next !== undefined) onChange?.(next); });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState<CSSProperties | null>(null);
  const activeIndex = items.findIndex((item) => item.value === current);

  const measure = () => {
    const root = rootRef.current;
    const target = root?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!root || !target) { setThumb(null); return; }
    setThumb({ transform: `translate(${target.offsetLeft - root.clientLeft}px, ${target.offsetTop - root.clientTop}px)`, width: target.offsetWidth, height: target.offsetHeight });
  };
  useLayoutEffect(measure, [current, items.length, size, block, vertical]);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  const select = (option: SegmentedOption<T>) => {
    if (disabled || option.disabled) return;
    setCurrent(option.value);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const enabled = items.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0);
    if (!enabled.length) return;
    const at = enabled.indexOf(activeIndex);
    const nextIndex = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled[enabled.length - 1] : enabled[(at + (forward ? 1 : -1) + enabled.length) % enabled.length];
    select(items[nextIndex]);
    rootRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')[nextIndex]?.focus();
  };

  return <div
    {...props}
    ref={rootRef}
    role="radiogroup"
    aria-label={label}
    aria-disabled={disabled || undefined}
    className={cx('at-segmented', `at-segmented--${size}`, block && 'at-segmented--block', disabled && 'at-segmented--disabled', vertical && 'at-segmented--vertical', shape === 'round' && 'at-segmented--round', className)}
    onKeyDown={onKeyDown}
  >
    {thumb && <span className="at-segmented__thumb" style={thumb} aria-hidden="true" />}
    {items.map((option, index) => {
      const checked = option.value === current;
      return <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={checked}
        tabIndex={checked || (activeIndex < 0 && index === 0) ? 0 : -1}
        disabled={disabled || option.disabled}
        className={cx('at-segmented__option', checked && 'at-segmented__option--active')}
        onClick={() => select(option)}
      >
        {option.icon && <span className="at-segmented__icon">{option.icon}</span>}
        <span className="at-segmented__label">{option.label}</span>
      </button>;
    })}
  </div>;
}
