import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/color-picker.css';
import { FieldShell, Selector } from './internal/Field';
import { Popup, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { assignRef, clamp, cx, useControllableState, type Size, type Status } from './utils';

export interface HSVA { h: number; s: number; v: number; a: number }
export interface RGBA { r: number; g: number; b: number; a: number }
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export interface ColorValue { hex: string; rgb: RGBA; hsv: HSVA; toString: (format?: ColorFormat) => string }

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'prefix'> {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, color: ColorValue) => void;
  onChangeComplete?: (hex: string, color: ColorValue) => void;
  format?: ColorFormat;
  showAlpha?: boolean;
  showText?: boolean;
  presets?: Array<{ label: string; colors: string[] }> | string[];
  disabled?: boolean;
  allowClear?: boolean;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
}

const hex2 = (value: number) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');

export function parseColor(input: string): RGBA | null {
  const text = input.trim();
  const hex = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) digits = digits.split('').map((d) => d + d).join('');
    const int = parseInt(digits.slice(0, 6), 16);
    const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255, a };
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(text);
  if (rgb) {
    const a = rgb[4] ? (rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4])) : 1;
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: clamp(a, 0, 1) };
  }
  const hsl = /^hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(text);
  if (hsl) {
    const h = Number(hsl[1]) / 360; const s = Number(hsl[2]) / 100; const l = Number(hsl[3]) / 100;
    const a = hsl[4] ? (hsl[4].endsWith('%') ? Number(hsl[4].slice(0, -1)) / 100 : Number(hsl[4])) : 1;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q;
    const channel = (t: number) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    return { r: Math.round(channel(h + 1 / 3) * 255), g: Math.round(channel(h) * 255), b: Math.round(channel(h - 1 / 3) * 255), a: clamp(a, 0, 1) };
  }
  return null;
}

export function rgbToHsv({ r, g, b, a }: RGBA): HSVA {
  const rn = r / 255; const gn = g / 255; const bn = b / 255;
  const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn); const d = max - min;
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max, a };
}

export function hsvToRgb({ h, s, v, a }: HSVA): RGBA {
  const c = v * s; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255), a };
}

export function toHex(rgb: RGBA, withAlpha = rgb.a < 1) {
  return `#${hex2(rgb.r)}${hex2(rgb.g)}${hex2(rgb.b)}${withAlpha ? hex2(rgb.a * 255) : ''}`;
}

function formatColor(rgb: RGBA, format: ColorFormat) {
  if (format === 'hex') return toHex(rgb);
  if (format === 'rgb') return rgb.a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(rgb.a.toFixed(2))})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const { h, s, v, a } = rgbToHsv(rgb);
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  const base = `${Math.round(h)}, ${Math.round(sl * 100)}%, ${Math.round(l * 100)}%`;
  return a < 1 ? `hsla(${base}, ${Number(a.toFixed(2))})` : `hsl(${base})`;
}

function makeColor(hsv: HSVA): ColorValue {
  const rgb = hsvToRgb(hsv);
  return { hex: toHex(rgb), rgb, hsv, toString: (format: ColorFormat = 'hex') => formatColor(rgb, format) };
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  {
    value, defaultValue = '#685cf6', onChange, onChangeComplete, format = 'hex', showAlpha = false, showText = true, presets, disabled = false, allowClear = false,
    size = 'md', status, label, hint, error, placeholder = '选择颜色', open: openProp, onOpenChange, placement = 'bottom-start', popupClassName, popupStyle, className, id, ...rest
  }, ref,
) {
  const reactId = useId();
  const triggerId = id ?? `at-color-picker-${reactId}`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const [current, setCurrent] = useControllableState<string>(value, defaultValue, (next) => { const rgb = parseColor(next); if (rgb) onChange?.(next, makeColor(rgbToHsv(rgb))); });
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  // Keep HSV while dragging so hue survives when saturation/value hit zero.
  const [hsv, setHsv] = useState<HSVA>(() => rgbToHsv(parseColor(current) ?? { r: 104, g: 92, b: 246, a: 1 }));
  const [text, setText] = useState(() => { const rgb = parseColor(current); return rgb ? formatColor(rgb, format) : ''; });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const lastEmitted = useRef(current);

  useEffect(() => {
    if (current === lastEmitted.current) return;
    const rgb = parseColor(current);
    if (rgb) { setHsv(rgbToHsv(rgb)); setText(formatColor(rgb, format)); }
    else if (!current) setText('');
    lastEmitted.current = current;
  }, [current, format]);

  const showPopup = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLDivElement, HTMLDivElement>(showPopup, placement);
  const color = makeColor(hsv);
  const complete = () => onChangeComplete?.(lastEmitted.current, makeColor(hsv));
  useDismiss(showPopup, [anchorRef, panelRef], () => { setOpen(false); complete(); });

  const apply = (next: HSVA) => {
    const normalized = { ...next, a: showAlpha ? next.a : 1 };
    setHsv(normalized);
    const rgb = hsvToRgb(normalized);
    const hex = toHex(rgb);
    lastEmitted.current = hex;
    setText(formatColor(rgb, format));
    setCurrent(hex);
  };

  const drag = (event: ReactPointerEvent<HTMLDivElement>, handler: (x: number, y: number) => void) => {
    if (disabled) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const move = (e: PointerEvent) => handler(clamp((e.clientX - rect.left) / rect.width, 0, 1), clamp((e.clientY - rect.top) / rect.height, 0, 1));
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); complete(); };
    event.preventDefault();
    move(event.nativeEvent);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const commitText = () => {
    const rgb = parseColor(text);
    if (rgb) apply(rgbToHsv(rgb)); else setText(current ? formatColor(hsvToRgb(hsv), format) : '');
  };

  const presetGroups = !presets ? [] : Array.isArray(presets) && typeof presets[0] === 'string' ? [{ label: '推荐', colors: presets as string[] }] : (presets as Array<{ label: string; colors: string[] }>);
  const hueColor = `hsl(${hsv.h} 100% 50%)`;
  const displayRgb = parseColor(current);

  return <FieldShell label={label} hint={hint} error={error} labelId={labelId} htmlFor={triggerId} className={className}>
    <Selector
      {...rest}
      ref={(node) => { triggerRef.current = node; anchorRef.current = node; assignRef(ref, node); }}
      id={triggerId}
      role="button"
      tabIndex={disabled ? -1 : 0}
      size={size}
      status={status ?? (error ? 'error' : undefined)}
      open={showPopup}
      disabled={disabled}
      hasValue={Boolean(current)}
      allowClear={allowClear}
      onClear={() => { lastEmitted.current = ''; setCurrent(''); }}
      className={cx('at-color-picker', !showText && 'at-color-picker--compact')}
      aria-haspopup="dialog"
      aria-expanded={showPopup}
      aria-labelledby={labelId}
      aria-label={label ? undefined : `${placeholder}${current ? `，当前 ${current}` : ''}`}
      onClick={() => { if (!disabled) setOpen(!open); }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); setOpen(!open); }
        if (event.key === 'Escape' && showPopup) { event.preventDefault(); setOpen(false); }
      }}
    >
      <span className={cx('at-color-picker__swatch', !displayRgb && 'at-color-picker__swatch--empty')} style={displayRgb ? { '--at-swatch': formatColor(displayRgb, 'rgb') } as CSSProperties : undefined} aria-hidden="true" />
      {showText && <span className={cx('at-selector__value', 'at-color-picker__text', format === 'hex' && 'at-color-picker__text--hex', !current && 'at-selector__placeholder')}>{displayRgb ? formatColor(displayRgb, format) : placeholder}</span>}
    </Selector>
    <Popup open={showPopup} panelRef={panelRef} position={position} placement={placement} role="dialog" aria-label={label ?? placeholder} className={cx('at-color-picker__popup', popupClassName)} style={popupStyle}>
      <div
        className="at-color-picker__area"
        style={{ backgroundColor: hueColor }}
        onPointerDown={(event) => drag(event, (x, y) => apply({ ...hsv, s: x, v: 1 - y }))}
      >
        <span className="at-color-picker__area-handle" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: toHex({ ...color.rgb, a: 1 }) }} role="slider" tabIndex={0} aria-label="饱和度与明度" aria-valuetext={`饱和度 ${Math.round(hsv.s * 100)}%，明度 ${Math.round(hsv.v * 100)}%`} aria-valuenow={Math.round(hsv.v * 100)}
          onKeyDown={(event) => {
            const delta = event.shiftKey ? 0.1 : 0.01;
            if (event.key === 'ArrowLeft') apply({ ...hsv, s: clamp(hsv.s - delta, 0, 1) });
            else if (event.key === 'ArrowRight') apply({ ...hsv, s: clamp(hsv.s + delta, 0, 1) });
            else if (event.key === 'ArrowUp') apply({ ...hsv, v: clamp(hsv.v + delta, 0, 1) });
            else if (event.key === 'ArrowDown') apply({ ...hsv, v: clamp(hsv.v - delta, 0, 1) });
            else return;
            event.preventDefault();
          }} />
      </div>
      <div className="at-color-picker__sliders">
        <div className="at-color-picker__preview" style={{ '--at-swatch': formatColor(color.rgb, 'rgb') } as CSSProperties} aria-hidden="true" />
        <div className="at-color-picker__tracks">
          <div className="at-color-picker__hue" onPointerDown={(event) => drag(event, (x) => apply({ ...hsv, h: x * 360 }))}>
            <span className="at-color-picker__slider-handle" style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColor }} role="slider" tabIndex={0} aria-label="色相" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(hsv.h)}
              onKeyDown={(event) => {
                const delta = event.shiftKey ? 10 : 1;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') apply({ ...hsv, h: (hsv.h - delta + 360) % 360 });
                else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') apply({ ...hsv, h: (hsv.h + delta) % 360 });
                else return;
                event.preventDefault();
              }} />
          </div>
          {showAlpha && <div className="at-color-picker__alpha" style={{ '--at-swatch': toHex({ ...color.rgb, a: 1 }) } as CSSProperties} onPointerDown={(event) => drag(event, (x) => apply({ ...hsv, a: Number(x.toFixed(2)) }))}>
            <span className="at-color-picker__slider-handle" style={{ left: `${hsv.a * 100}%`, backgroundColor: formatColor(color.rgb, 'rgb') }} role="slider" tabIndex={0} aria-label="透明度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsv.a * 100)}
              onKeyDown={(event) => {
                const delta = event.shiftKey ? 0.1 : 0.01;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') apply({ ...hsv, a: clamp(hsv.a - delta, 0, 1) });
                else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') apply({ ...hsv, a: clamp(hsv.a + delta, 0, 1) });
                else return;
                event.preventDefault();
              }} />
          </div>}
        </div>
      </div>
      <div className="at-color-picker__inputs">
        <span className="at-color-picker__format">{format.toUpperCase()}</span>
        <input className="at-color-picker__input" value={text} aria-label="颜色值" spellCheck={false} onChange={(event) => setText(event.target.value)} onBlur={commitText} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commitText(); } }} />
        {showAlpha && <span className="at-color-picker__alpha-text">{Math.round(hsv.a * 100)}%</span>}
      </div>
      {presetGroups.map((group) => <div key={group.label} className="at-color-picker__presets">
        <span className="at-popup__group">{group.label}</span>
        <div className="at-color-picker__preset-grid">
          {group.colors.map((preset) => {
            const rgb = parseColor(preset);
            const active = rgb ? toHex(rgb) === toHex(color.rgb) : false;
            return <button key={preset} type="button" className={cx('at-color-picker__preset', active && 'at-color-picker__preset--active')} style={{ '--at-swatch': preset } as CSSProperties} aria-label={preset} aria-pressed={active} onClick={() => { if (rgb) { apply(rgbToHsv(rgb)); complete(); } }} />;
          })}
        </div>
      </div>)}
    </Popup>
  </FieldShell>;
});
