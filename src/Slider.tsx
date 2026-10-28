import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/slider.css';
import { clamp, cx, useControllableState, type Size } from './utils';

export type SliderValue = number | [number, number];
export type SliderMarks = Record<number, ReactNode | { label: ReactNode; style?: CSSProperties }>;

export interface SliderProps<T extends SliderValue = number> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Fires once the pointer is released or a key interaction ends. */
  onChangeComplete?: (value: T) => void;
  min?: number;
  max?: number;
  /** `null` snaps only to `marks`. */
  step?: number | null;
  range?: boolean;
  marks?: SliderMarks;
  /** `'always'` keeps the value bubble visible; `'auto'` shows it while hovering or dragging. */
  tooltip?: 'auto' | 'always' | 'none';
  tooltipFormatter?: (value: number) => ReactNode;
  disabled?: boolean;
  vertical?: boolean;
  size?: Size;
  label?: string;
  /** Visible label with the live value; omit for a bare control. */
  showValue?: boolean;
  included?: boolean;
}

function toPair(value: SliderValue): [number, number] {
  return Array.isArray(value) ? [Math.min(value[0], value[1]), Math.max(value[0], value[1])] : [value, value];
}

export function Slider<T extends SliderValue = number>({
  value, defaultValue, onChange, onChangeComplete, min = 0, max = 100, step = 1, range = false, marks, tooltip = 'auto', tooltipFormatter,
  disabled = false, vertical = false, size = 'md', label = '数值', showValue = false, included = true, className, style, ...props
}: SliderProps<T>) {
  const id = useId();
  const fallback = (range ? [min, min] : min) as T;
  const [current, setCurrent] = useControllableState<T>(value, defaultValue ?? fallback, onChange);
  const [dragging, setDragging] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const handleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const latest = useRef(current);
  latest.current = current;

  const values = useMemo(() => (range ? toPair(current) : [current as number]), [current, range]);
  const markPoints = useMemo(() => (marks ? Object.keys(marks).map(Number).filter((point) => point >= min && point <= max).sort((a, b) => a - b) : []), [marks, min, max]);
  const precision = step ? (String(step).split('.')[1]?.length ?? 0) : 0;

  const snap = useCallback((raw: number) => {
    const clamped = clamp(raw, min, max);
    if (step == null) {
      if (!markPoints.length) return clamped;
      return markPoints.reduce((closest, point) => (Math.abs(point - clamped) < Math.abs(closest - clamped) ? point : closest), markPoints[0]);
    }
    const stepped = Math.round((clamped - min) / step) * step + min;
    return Number(clamp(stepped, min, max).toFixed(precision));
  }, [min, max, step, markPoints, precision]);

  const percent = (point: number) => ((point - min) / (max - min || 1)) * 100;

  const update = (index: number, next: number) => {
    if (range) {
      const pair: [number, number] = [...toPair(current)] as [number, number];
      pair[index] = next;
      if (pair[0] > pair[1]) { pair.sort((a, b) => a - b); }
      setCurrent(pair as T);
    } else {
      setCurrent(next as T);
    }
  };

  const valueAt = (event: PointerEvent | ReactPointerEvent) => {
    const rect = railRef.current!.getBoundingClientRect();
    const ratio = vertical ? 1 - (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
    return snap(min + clamp(ratio, 0, 1) * (max - min));
  };

  const onRailPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    const next = valueAt(event);
    const pair = toPair(current);
    const index = range ? (Math.abs(next - pair[0]) <= Math.abs(next - pair[1]) ? 0 : 1) : 0;
    update(index, next);
    setDragging(index);
    handleRefs.current[index]?.focus();
  };

  useEffect(() => {
    if (dragging == null) return;
    const move = (event: PointerEvent) => update(dragging, valueAt(event));
    const up = () => { setDragging(null); onChangeComplete?.(latest.current); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    window.addEventListener('pointercancel', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const onHandleKeyDown = (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const unit = step ?? (markPoints.length ? undefined : 1);
    const pointValue = values[index];
    let next: number | null = null;
    const byStep = (direction: 1 | -1) => {
      if (unit == null) {
        const at = markPoints.indexOf(pointValue);
        return markPoints[clamp(at + direction, 0, markPoints.length - 1)] ?? pointValue;
      }
      return snap(pointValue + direction * unit);
    };
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': next = byStep(1); break;
      case 'ArrowLeft': case 'ArrowDown': next = byStep(-1); break;
      case 'PageUp': next = snap(pointValue + (max - min) / 10); break;
      case 'PageDown': next = snap(pointValue - (max - min) / 10); break;
      case 'Home': next = min; break;
      case 'End': next = max; break;
    }
    if (next == null) return;
    event.preventDefault();
    update(index, next);
    if (range) {
      const pair = [...toPair(current)] as [number, number];
      pair[index] = next;
      pair.sort((a, b) => a - b);
      onChangeComplete?.(pair as T);
    } else {
      onChangeComplete?.(next as T);
    }
  };

  const [lo, hi] = range ? values : [included ? min : values[0], values[0]];
  const trackStyle: CSSProperties = vertical
    ? { bottom: `${percent(lo)}%`, height: `${percent(hi) - percent(lo)}%` }
    : { left: `${percent(lo)}%`, width: `${percent(hi) - percent(lo)}%` };
  const showTip = tooltip === 'always' || (tooltip === 'auto' && (hovering || dragging != null));
  const format = (point: number) => (tooltipFormatter ? tooltipFormatter(point) : point);

  return <div
    {...props}
    className={cx('at-slider', `at-slider--${size}`, vertical && 'at-slider--vertical', disabled && 'at-slider--disabled', dragging != null && 'at-slider--dragging', markPoints.length > 0 && 'at-slider--with-marks', className)}
    style={style}
  >
    {showValue && <span className="at-slider__header"><span id={`${id}-label`}>{label}</span><output>{range ? `${values[0]} – ${values[1]}` : values[0]}</output></span>}
    <div className="at-slider__control" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div ref={railRef} className="at-slider__rail" onPointerDown={onRailPointerDown}>
        {included && <div className="at-slider__track" style={trackStyle} />}
        {markPoints.map((point) => <span key={point} className={cx('at-slider__dot', point >= lo && point <= hi && included && 'at-slider__dot--active')} style={vertical ? { bottom: `${percent(point)}%` } : { left: `${percent(point)}%` }} />)}
        {values.map((point, index) => <div
          key={index}
          ref={(node) => { handleRefs.current[index] = node; }}
          className={cx('at-slider__handle', dragging === index && 'at-slider__handle--active')}
          style={vertical ? { bottom: `${percent(point)}%` } : { left: `${percent(point)}%` }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={range ? `${label}${index === 0 ? '起始' : '结束'}` : label}
          aria-labelledby={showValue && !range ? `${id}-label` : undefined}
          aria-valuemin={range && index === 1 ? values[0] : min}
          aria-valuemax={range && index === 0 ? values[1] : max}
          aria-valuenow={point}
          aria-valuetext={typeof format(point) === 'string' || typeof format(point) === 'number' ? String(format(point)) : undefined}
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          aria-disabled={disabled || undefined}
          onPointerDown={(event) => { if (disabled) return; event.stopPropagation(); event.preventDefault(); setDragging(index); event.currentTarget.focus(); }}
          onKeyDown={onHandleKeyDown(index)}
        >
          {tooltip !== 'none' && <span className={cx('at-slider__tooltip', showTip && 'at-slider__tooltip--visible')} aria-hidden="true">{format(point)}</span>}
        </div>)}
      </div>
      {marks && <div className="at-slider__marks">
        {markPoints.map((point) => {
          const mark = marks[point];
          const content = mark && typeof mark === 'object' && 'label' in mark ? mark : { label: mark as ReactNode, style: undefined };
          return <span key={point} className={cx('at-slider__mark', point >= lo && point <= hi && included && 'at-slider__mark--active')} style={{ ...(vertical ? { bottom: `${percent(point)}%` } : { left: `${percent(point)}%` }), ...content.style }} onClick={() => { if (!disabled) { const pair = toPair(current); update(range ? (Math.abs(point - pair[0]) <= Math.abs(point - pair[1]) ? 0 : 1) : 0, point); } }}>{content.label}</span>;
        })}
      </div>}
    </div>
  </div>;
}
