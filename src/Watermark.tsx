import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/watermark.css';
import { cx } from './utils';

export interface WatermarkFont { color?: string; fontSize?: number; fontWeight?: 'normal' | 'light' | 'bold' | number; fontFamily?: string; fontStyle?: 'normal' | 'italic'; textAlign?: CanvasTextAlign }

export interface WatermarkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** One or more lines of text. */
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  zIndex?: number;
  /** Horizontal and vertical spacing between tiles. */
  gap?: [number, number];
  /** Offset of the first tile from the top-left corner. */
  offset?: [number, number];
  font?: WatermarkFont;
  /** Make the watermark cover the whole page instead of its children. */
  fullscreen?: boolean;
  children?: ReactNode;
}

const DEFAULT_FONT: Required<WatermarkFont> = { color: 'rgba(0, 0, 0, 0.12)', fontSize: 16, fontWeight: 'normal', fontFamily: 'sans-serif', fontStyle: 'normal', textAlign: 'center' };

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function renderTile({ content, image, width, height, rotate, gap, font }: Required<Pick<WatermarkProps, 'rotate' | 'gap' | 'font'>> & Pick<WatermarkProps, 'content' | 'image' | 'width' | 'height'>) {
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  const merged = { ...DEFAULT_FONT, ...font };
  const lines = Array.isArray(content) ? content : content ? [content] : [];
  const picture = image ? await loadImage(image) : null;

  // Measure the raw mark before rotation.
  context.font = `${merged.fontStyle} normal ${merged.fontWeight} ${merged.fontSize}px/${merged.fontSize * 1.5}px ${merged.fontFamily}`;
  const lineHeight = merged.fontSize * 1.5;
  let markWidth = width ?? 0;
  let markHeight = height ?? 0;
  if (picture) {
    markWidth = width ?? picture.width;
    markHeight = height ?? (width ? (picture.height / picture.width) * width : picture.height);
  } else {
    if (!width) markWidth = Math.max(...lines.map((line) => context.measureText(line).width), 0);
    if (!height) markHeight = lineHeight * lines.length;
  }
  const radians = (rotate * Math.PI) / 180;
  const rotatedWidth = Math.abs(markWidth * Math.cos(radians)) + Math.abs(markHeight * Math.sin(radians));
  const rotatedHeight = Math.abs(markWidth * Math.sin(radians)) + Math.abs(markHeight * Math.cos(radians));
  const tileWidth = Math.ceil(rotatedWidth + gap[0]);
  const tileHeight = Math.ceil(rotatedHeight + gap[1]);
  canvas.width = tileWidth * ratio;
  canvas.height = tileHeight * ratio;
  context.scale(ratio, ratio);
  context.translate(tileWidth / 2, tileHeight / 2);
  context.rotate(radians);
  if (picture) {
    context.drawImage(picture, -markWidth / 2, -markHeight / 2, markWidth, markHeight);
  } else {
    context.font = `${merged.fontStyle} normal ${merged.fontWeight} ${merged.fontSize}px/${lineHeight}px ${merged.fontFamily}`;
    context.fillStyle = merged.color;
    context.textAlign = merged.textAlign;
    context.textBaseline = 'middle';
    const startY = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => context.fillText(line, merged.textAlign === 'left' ? -markWidth / 2 : merged.textAlign === 'right' ? markWidth / 2 : 0, startY + index * lineHeight));
  }
  return { url: canvas.toDataURL(), tileWidth, tileHeight };
}

export function Watermark({ content, image, width, height, rotate = -22, zIndex = 9, gap = [100, 100], offset, font, fullscreen = false, className, children, ...props }: WatermarkProps) {
  const [tile, setTile] = useState<{ url: string; tileWidth: number; tileHeight: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLDivElement | null>(null);
  const fontKey = JSON.stringify(font ?? {});

  useEffect(() => {
    let active = true;
    void renderTile({ content, image, width, height, rotate, gap, font: font ?? {} }).then((result) => { if (active) setTile(result); });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(content) ? content.join('\n') : content, image, width, height, rotate, gap[0], gap[1], fontKey]);

  const markStyle: CSSProperties = tile ? {
    zIndex,
    backgroundImage: `url(${tile.url})`,
    backgroundSize: `${tile.tileWidth}px ${tile.tileHeight}px`,
    backgroundPosition: `${(offset?.[0] ?? gap[0] / 2) - tile.tileWidth / 2}px ${(offset?.[1] ?? gap[1] / 2) - tile.tileHeight / 2}px`,
  } : { zIndex };

  // Restore the overlay if it is removed or tampered with through dev tools.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      const mark = markRef.current;
      const tampered = mutations.some((mutation) => Array.from(mutation.removedNodes).includes(mark as Node) || (mutation.type === 'attributes' && mutation.target === mark));
      if (!tampered || !mark) return;
      mark.setAttribute('class', 'at-watermark__mark');
      mark.removeAttribute('hidden');
      Object.assign(mark.style, { position: 'absolute', inset: '0', pointerEvents: 'none', display: 'block', opacity: '1', visibility: 'visible', zIndex: String(zIndex), backgroundImage: markStyle.backgroundImage ?? '', backgroundSize: markStyle.backgroundSize ?? '', backgroundPosition: markStyle.backgroundPosition ?? '', backgroundRepeat: 'repeat' });
      if (!container.contains(mark)) container.appendChild(mark);
    });
    observer.observe(container, { childList: true, attributes: true, subtree: true, attributeFilter: ['style', 'class', 'hidden'] });
    return () => observer.disconnect();
  }, [markStyle.backgroundImage, markStyle.backgroundSize, markStyle.backgroundPosition, zIndex]);

  return <div {...props} ref={containerRef} className={cx('at-watermark', fullscreen && 'at-watermark--fullscreen', className)}>
    {children}
    <div ref={markRef} className="at-watermark__mark" style={markStyle} aria-hidden="true" />
  </div>;
}
