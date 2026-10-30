import { useConfig } from './ConfigProvider';
import { useLocale } from './locale';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ImgHTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent } from 'react';
import { createPortal } from 'react-dom';
import './styles/theme.css';
import './styles/image.css';
import { ChevronLeft, ChevronRight, Close } from './internal/icons';
import { clamp, cx } from './utils';

export interface ImagePreviewConfig {
  /** Higher-resolution source for the preview layer. */
  src?: string;
  mask?: ReactNode;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt?: string;
  preview?: boolean | ImagePreviewConfig;
  /** Shown when the main image fails to load. */
  fallback?: string;
  /** Skeleton (true) or custom node shown while loading. */
  placeholder?: boolean | ReactNode;
  fit?: CSSProperties['objectFit'];
  rounded?: boolean | number;
  onPreviewOpen?: () => void;
}

interface GroupContextValue {
  register: (id: string, src: string, previewSrc?: string) => () => void;
  open: (id: string) => void;
}
const GroupContext = createContext<GroupContextValue | null>(null);

const ZoomInIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>;
const ZoomOutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M8 11h6" /></svg>;
const RotateIcon = ({ flip }: { flip?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>;
const FlipIcon = ({ vertical }: { vertical?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={vertical ? { transform: 'rotate(90deg)' } : undefined}><path d="M12 3v18" /><path d="M8 7 3 12l5 5" /><path d="m16 7 5 5-5 5" /></svg>;
const EyeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;

interface PreviewItem { id: string; src: string; previewSrc?: string }

interface PreviewLayerProps { items: PreviewItem[]; index: number; onIndexChange: (index: number) => void; onClose: () => void }

function PreviewLayer({ items, index, onIndexChange, onClose }: PreviewLayerProps) {
  const { colorScheme } = useConfig();
  const { t, locale } = useLocale();

  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState({ x: 1, y: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const item = items[index];
  const reset = useCallback(() => { setScale(1); setRotate(0); setFlip({ x: 1, y: 1 }); setOffset({ x: 0, y: 0 }); }, []);

  useEffect(() => { reset(); setLoaded(false); }, [index, reset]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lastFocused = document.activeElement as HTMLElement | null;
    layerRef.current?.focus();
    return () => { document.body.style.overflow = previous; lastFocused?.focus?.({ preventScroll: true }); };
  }, []);

  const go = (direction: 1 | -1) => { if (items.length > 1) onIndexChange((index + direction + items.length) % items.length); };
  const zoom = (delta: number) => setScale((value) => clamp(Number((value + delta).toFixed(2)), 0.25, 5));
  const onWheel = (event: WheelEvent) => { zoom(event.deltaY < 0 ? 0.1 : -0.1); };
  const onPointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    event.preventDefault();
    dragStart.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!dragStart.current) return;
    setOffset({ x: dragStart.current.ox + event.clientX - dragStart.current.x, y: dragStart.current.oy + event.clientY - dragStart.current.y });
  };
  const onPointerUp = () => { dragStart.current = null; setDragging(false); };

  const tools: Array<{ label: string; icon: ReactNode; onClick: () => void; disabled?: boolean }> = [
    { label: t('image.zoomIn'), icon: <ZoomInIcon />, onClick: () => zoom(0.25), disabled: scale >= 5 },
    { label: t('image.zoomOut'), icon: <ZoomOutIcon />, onClick: () => zoom(-0.25), disabled: scale <= 0.25 },
    { label: t('image.rotateLeft'), icon: <RotateIcon />, onClick: () => setRotate((value) => value - 90) },
    { label: t('image.rotateRight'), icon: <RotateIcon flip />, onClick: () => setRotate((value) => value + 90) },
    { label: t('image.flipHorizontal'), icon: <FlipIcon />, onClick: () => setFlip((value) => ({ ...value, x: -value.x })) },
    { label: t('image.flipVertical'), icon: <FlipIcon vertical />, onClick: () => setFlip((value) => ({ ...value, y: -value.y })) },
  ];

  return createPortal(
    <div
      ref={layerRef}
      className="at-image-preview"
      role="dialog" data-at-theme={colorScheme} lang={locale}
      aria-modal="true"
      aria-label={t('image.preview')}
      tabIndex={-1}
      onKeyDown={(event) => {
        switch (event.key) {
          case 'Escape': event.preventDefault(); onClose(); break;
          case 'ArrowLeft': event.preventDefault(); go(-1); break;
          case 'ArrowRight': event.preventDefault(); go(1); break;
          case '+': case '=': event.preventDefault(); zoom(0.25); break;
          case '-': event.preventDefault(); zoom(-0.25); break;
          case 'r': event.preventDefault(); setRotate((value) => value + 90); break;
          case '0': event.preventDefault(); reset(); break;
        }
      }}
      onWheel={onWheel}
    >
      <div className="at-image-preview__backdrop" onClick={onClose} />
      <header className="at-image-preview__header">
        {items.length > 1 && <span className="at-image-preview__counter">{index + 1} / {items.length}</span>}
        <div className="at-image-preview__tools" role="toolbar" aria-label={t('image.tools')}>
          {tools.map((tool) => <button key={tool.label} type="button" className="at-image-preview__tool" aria-label={tool.label} title={tool.label} disabled={tool.disabled} onClick={tool.onClick}>{tool.icon}</button>)}
          <span className="at-image-preview__scale" aria-live="polite">{Math.round(scale * 100)}%</span>
          <button type="button" className="at-image-preview__tool" aria-label={t('image.reset')} title={t('image.reset')} onClick={reset}>1:1</button>
        </div>
        <button type="button" className="at-image-preview__close" aria-label={t('image.close')} onClick={onClose}><Close size={18} /></button>
      </header>
      {items.length > 1 && <>
        <button type="button" className="at-image-preview__nav at-image-preview__nav--prev" aria-label={t('common.previousImage')} onClick={() => go(-1)}><ChevronLeft size={22} /></button>
        <button type="button" className="at-image-preview__nav at-image-preview__nav--next" aria-label={t('common.nextImage')} onClick={() => go(1)}><ChevronRight size={22} /></button>
      </>}
      {item && <img
        key={item.id}
        src={item.previewSrc ?? item.src}
        alt=""
        draggable={false}
        className={cx('at-image-preview__img', dragging && 'at-image-preview__img--dragging', loaded && 'at-image-preview__img--loaded', scale > 1 && 'at-image-preview__img--zoomable')}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale * flip.x}, ${scale * flip.y}) rotate(${rotate}deg)` }}
        onLoad={() => setLoaded(true)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(event) => event.stopPropagation()}
      />}
    </div>,
    document.body,
  );
}

export function Image({ src, alt = '', preview = true, fallback, placeholder = true, fit = 'cover', rounded = true, className, style, width, height, onPreviewOpen, onLoad, onError, loading = 'lazy', ...props }: ImageProps) {
  const { t } = useLocale();

  const id = useId();
  const group = useContext(GroupContext);
  const config: ImagePreviewConfig | null = preview ? (preview === true ? {} : preview) : null;
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const isOpen = config?.visible ?? open;

  useEffect(() => { setStatus('loading'); setFailed(false); }, [src]);
  useEffect(() => {
    if (!group || !config) return;
    return group.register(id, src, config.src);
  }, [group?.register, id, src, config?.src, Boolean(config)]); // eslint-disable-line react-hooks/exhaustive-deps

  const show = () => {
    if (!config || status === 'error' || failed) return;
    onPreviewOpen?.();
    if (group) { group.open(id); return; }
    if (config.visible === undefined) setOpen(true);
    config.onVisibleChange?.(true);
  };
  const hide = () => { if (config?.visible === undefined) setOpen(false); config?.onVisibleChange?.(false); };

  const resolvedSrc = failed && fallback ? fallback : src;
  const radius = rounded === true ? undefined : rounded === false ? 0 : rounded;
  const items = useMemo<PreviewItem[]>(() => [{ id, src, previewSrc: config?.src }], [id, src, config?.src]);

  return <span className={cx('at-image', config && status === 'loaded' && !failed && 'at-image--previewable', status === 'loading' && 'at-image--loading', status === 'error' && 'at-image--error', rounded === false && 'at-image--square', className)} style={{ width, height, borderRadius: radius, ...style }}>
    {status === 'loading' && placeholder && <span className="at-image__placeholder" aria-hidden="true">{placeholder === true ? <span className="at-image__skeleton" /> : placeholder}</span>}
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className="at-image__img"
      style={{ objectFit: fit }}
      onLoad={(event) => { setStatus('loaded'); onLoad?.(event); }}
      onError={(event) => {
        onError?.(event);
        if (fallback && !failed) { setFailed(true); setStatus('loading'); return; }
        setStatus('error');
      }}
    />
    {status === 'error' && !fallback && <span className="at-image__broken" role="img" aria-label={alt || t('image.failed')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><path d="m3 3 18 18" /></svg></span>}
    {config && status === 'loaded' && !failed && <button type="button" className="at-image__mask" aria-label={alt ? t('image.openLabel', { alt }) : t('image.preview')} onClick={show}>
      <span className="at-image__mask-content">{config.mask ?? <><EyeIcon /><span>{t('image.open')}</span></>}</span>
    </button>}
    {isOpen && !group && <PreviewLayer items={items} index={0} onIndexChange={() => undefined} onClose={hide} />}
  </span>;
}

export interface ImagePreviewGroupProps {
  /** Explicit sources; when omitted the group collects its child images. */
  items?: Array<string | { src: string; previewSrc?: string }>;
  current?: number;
  onChange?: (current: number) => void;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  children?: ReactNode;
}

export function ImagePreviewGroup({ items: explicitItems, current, onChange, visible, onVisibleChange, children }: ImagePreviewGroupProps) {
  const [registered, setRegistered] = useState<PreviewItem[]>([]);
  const [internalIndex, setInternalIndex] = useState(0);
  const [internalOpen, setInternalOpen] = useState(false);
  const order = useRef<string[]>([]);
  const items = useMemo<PreviewItem[]>(() => explicitItems
    ? explicitItems.map((item, index) => (typeof item === 'string' ? { id: `item-${index}`, src: item } : { id: `item-${index}`, src: item.src, previewSrc: item.previewSrc }))
    : registered, [explicitItems, registered]);
  const index = current ?? internalIndex;
  const open = visible ?? internalOpen;

  const register = useCallback<GroupContextValue['register']>((id, src, previewSrc) => {
    order.current = [...order.current.filter((item) => item !== id), id];
    setRegistered((list) => {
      const next = [...list.filter((item) => item.id !== id), { id, src, previewSrc }];
      return next.sort((a, b) => order.current.indexOf(a.id) - order.current.indexOf(b.id));
    });
    return () => { order.current = order.current.filter((item) => item !== id); setRegistered((list) => list.filter((item) => item.id !== id)); };
  }, []);

  const context = useMemo<GroupContextValue>(() => ({
    register,
    open: (id) => {
      const position = (explicitItems ? items : registered).findIndex((item) => item.id === id);
      const next = position >= 0 ? position : 0;
      if (current === undefined) setInternalIndex(next);
      onChange?.(next);
      if (visible === undefined) setInternalOpen(true);
      onVisibleChange?.(true);
    },
  }), [register, explicitItems, items, registered, current, onChange, visible, onVisibleChange]);

  const setIndex = (next: number) => { if (current === undefined) setInternalIndex(next); onChange?.(next); };
  const close = () => { if (visible === undefined) setInternalOpen(false); onVisibleChange?.(false); };

  return <GroupContext.Provider value={context}>
    {children}
    {open && items.length > 0 && <PreviewLayer items={items} index={Math.min(index, items.length - 1)} onIndexChange={setIndex} onClose={close} />}
  </GroupContext.Provider>;
}

Image.PreviewGroup = ImagePreviewGroup;
