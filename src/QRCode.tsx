import { useLocale } from './locale';
import { useEffect, useMemo, useRef, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/qrcode.css';
import { encodeQR, type QRErrorLevel, type QRMatrix } from './internal/qr';
import { cx } from './utils';

export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';
export type { QRErrorLevel };

export interface QRCodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string;
  size?: number;
  type?: 'svg' | 'canvas';
  errorLevel?: QRErrorLevel;
  color?: string;
  bgColor?: string;
  /** Logo drawn at the center; defaults the error level to `H` so the covered modules can be recovered. */
  icon?: string;
  iconSize?: number;
  bordered?: boolean;
  /** Quiet-zone width in modules. */
  margin?: number;
  status?: QRCodeStatus;
  onRefresh?: () => void;
  statusRender?: (status: QRCodeStatus, info: { onRefresh?: () => void }) => ReactNode;
  title?: string;
}

function toPath(matrix: QRMatrix, margin: number) {
  const parts: string[] = [];
  matrix.modules.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x++; continue; }
      let run = 0;
      while (row[x + run]) run++;
      parts.push(`M${x + margin} ${y + margin}h${run}v1h-${run}z`);
      x += run;
    }
  });
  return parts.join('');
}

export function QRCode({ value, size = 160, type = 'svg', errorLevel, color = '#222438', bgColor = '#ffffff', icon, iconSize, bordered = true, margin = 2, status = 'active', onRefresh, statusRender, title: titleProp, className, style, ...props }: QRCodeProps) {
  const { t } = useLocale();
  const title = titleProp === undefined ? t('qrcode.label') : titleProp;

  const level: QRErrorLevel = errorLevel ?? (icon ? 'H' : 'M');
  const matrix = useMemo(() => { try { return encodeQR(value, level); } catch { return null; } }, [value, level]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const total = matrix ? matrix.size + margin * 2 : 0;
  const resolvedIconSize = iconSize ?? Math.round(size * 0.22);
  const iconPadding = 4;
  // Sizes expressed in module units for the SVG viewBox.
  const unit = total / size;
  const iconUnits = resolvedIconSize * unit;
  const plateUnits = (resolvedIconSize + iconPadding * 2) * unit;

  useEffect(() => {
    if (type !== 'canvas' || !matrix || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    const context = canvas.getContext('2d');
    if (!context) return;
    const scale = (size / total) * ratio;
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    matrix.modules.forEach((row, y) => row.forEach((dark, x) => { if (dark) context.fillRect(Math.floor((x + margin) * scale), Math.floor((y + margin) * scale), Math.ceil(scale), Math.ceil(scale)); }));
    if (icon) {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const drawSize = resolvedIconSize * ratio;
        const offset = (canvas.width - drawSize) / 2;
        context.fillStyle = bgColor;
        context.fillRect(offset - iconPadding * ratio, offset - iconPadding * ratio, drawSize + iconPadding * 2 * ratio, drawSize + iconPadding * 2 * ratio);
        context.drawImage(image, offset, offset, drawSize, drawSize);
      };
      image.src = icon;
    }
  }, [type, matrix, size, total, margin, color, bgColor, icon, resolvedIconSize]);

  const overlay = status !== 'active' && (statusRender ? statusRender(status, { onRefresh }) : <div className="at-qrcode__status" role="status">
    {status === 'loading' && <><span className="at-qrcode__spinner" aria-hidden="true" /><span>{t('qrcode.loading')}</span></>}
    {status === 'expired' && <><span>{t('qrcode.expired')}</span>{onRefresh && <button type="button" className="at-qrcode__refresh" onClick={onRefresh}>{t('qrcode.refresh')}</button>}</>}
    {status === 'scanned' && <><span className="at-qrcode__check" aria-hidden="true">✓</span><span>{t('qrcode.scanned')}</span></>}
  </div>);

  return <div {...props} className={cx('at-qrcode', bordered && 'at-qrcode--bordered', status !== 'active' && 'at-qrcode--masked', className)} style={{ width: size, height: size, backgroundColor: bgColor, ...style }} role="img" aria-label={`${title}：${value}`}>
    {!matrix && <div className="at-qrcode__error">{t('qrcode.error')}</div>}
    {matrix && type === 'svg' && <svg className="at-qrcode__svg" viewBox={`0 0 ${total} ${total}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      <rect width={total} height={total} fill={bgColor} />
      <path d={toPath(matrix, margin)} fill={color} />
      {icon && <>
        <rect x={(total - plateUnits) / 2} y={(total - plateUnits) / 2} width={plateUnits} height={plateUnits} rx={unit * 3} fill={bgColor} />
        <image href={icon} x={(total - iconUnits) / 2} y={(total - iconUnits) / 2} width={iconUnits} height={iconUnits} preserveAspectRatio="xMidYMid slice" />
      </>}
    </svg>}
    {matrix && type === 'canvas' && <canvas ref={canvasRef} className="at-qrcode__canvas" style={{ width: size, height: size }} aria-hidden="true" />}
    {overlay}
  </div>;
}
