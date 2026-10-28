import { createContext, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ElementType, type HTMLAttributes, type ImgHTMLAttributes, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingPanel, type FloatingPlacement } from './internal/floating';
import type { CascaderOption } from './Cascader';
import QRCodeEncoder from 'qrcode';

export interface FloatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { icon?: ReactNode; description?: ReactNode; shape?: 'circle' | 'square' }
export function FloatButton({ icon = '↑', description, shape = 'circle', className = '', ...props }: FloatButtonProps) {
  return <button {...props} type={props.type ?? 'button'} className={`at-float-button at-float-button--${shape} ${className}`} aria-label={props['aria-label'] ?? (typeof description === 'string' ? description : '快捷操作')}><span>{icon}</span>{description && <small>{description}</small>}</button>;
}

export type IconName = 'plus' | 'search' | 'check' | 'close' | 'arrow-right' | 'info' | 'more';
const iconPaths: Record<IconName, ReactNode> = {
  plus: <><path d="M12 5v14M5 12h14" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, check: <path d="m5 12 4 4L19 6" />, close: <><path d="m6 6 12 12M18 6 6 18" /></>, 'arrow-right': <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>, info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
};
export function Icon({ name, size = 20, title, className = '' }: { name: IconName; size?: number; title?: string; className?: string }) {
  return <svg className={`at-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>{title && <title>{title}</title>}{iconPaths[name]}</svg>;
}

export function Typography({ as: Component = 'p', variant = 'body', children, className = '', ...props }: HTMLAttributes<HTMLElement> & { as?: ElementType; variant?: 'display' | 'title' | 'body' | 'secondary' | 'caption' }) {
  return <Component {...props} className={`at-typography at-typography--${variant} ${className}`}>{children}</Component>;
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> { vertical?: boolean; gap?: number | string; align?: CSSProperties['alignItems']; justify?: CSSProperties['justifyContent']; wrap?: boolean }
export function Flex({ vertical = false, gap = 12, align = 'center', justify = 'flex-start', wrap = false, style, className = '', ...props }: FlexProps) {
  return <div {...props} className={`at-flex ${className}`} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }} />;
}
export function Space({ size = 12, direction = 'horizontal', wrap = false, children, className = '' }: { size?: number | string; direction?: 'horizontal' | 'vertical'; wrap?: boolean; children: ReactNode; className?: string }) {
  return <div className={`at-space at-space--${direction} ${className}`} style={{ gap: size, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</div>;
}

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> { children: ReactNode }
export function Layout({ children, className = '', ...props }: LayoutProps) { return <div {...props} className={`at-layout ${className}`}>{children}</div>; }
export function LayoutHeader({ children, className = '', ...props }: LayoutProps) { return <header {...props} className={`at-layout__header ${className}`}>{children}</header>; }
export function LayoutSider({ children, width = 220, className = '', ...props }: LayoutProps & { width?: number | string }) { return <aside {...props} className={`at-layout__sider ${className}`} style={{ width, ...props.style }}>{children}</aside>; }
export function LayoutContent({ children, className = '', ...props }: LayoutProps) { return <main {...props} className={`at-layout__content ${className}`}>{children}</main>; }
export function LayoutFooter({ children, className = '', ...props }: LayoutProps) { return <footer {...props} className={`at-layout__footer ${className}`}>{children}</footer>; }

export function Grid({ columns = 24, gap = 16, children, className = '' }: { columns?: number; gap?: number | string; children: ReactNode; className?: string }) {
  return <div className={`at-grid ${className}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>{children}</div>;
}
export function GridCol({ span = 12, children, className = '' }: { span?: number; children: ReactNode; className?: string }) {
  return <div className={`at-grid__col ${className}`} style={{ gridColumn: `span ${span}` }}>{children}</div>;
}

export function Affix({ top = 16, children, className = '' }: { top?: number; children: ReactNode; className?: string }) {
  return <div className={`at-affix ${className}`} style={{ position: 'sticky', top, zIndex: 2 }}>{children}</div>;
}
export interface AnchorItem { href: string; title: ReactNode }
export function Anchor({ items, className = '' }: { items: AnchorItem[]; className?: string }) {
  return <nav className={`at-anchor ${className}`} aria-label="页面锚点">{items.map((item) => <a key={item.href} href={item.href}>{item.title}</a>)}</nav>;
}

export interface DropdownItem { key: string; label: ReactNode; disabled?: boolean; onClick?: () => void }
export function Dropdown({ items, children, placement = 'bottom-start' }: { items: DropdownItem[]; children: ReactNode; placement?: 'bottom-start' | 'bottom-end' }) {
  return <details className={`at-dropdown at-dropdown--${placement}`}><summary>{children}<span aria-hidden="true">⌄</span></summary><div className="at-dropdown__menu" role="menu">{items.map((item) => <button key={item.key} type="button" role="menuitem" disabled={item.disabled} onClick={() => { item.onClick?.(); const details = document.activeElement?.closest('details'); details?.removeAttribute('open'); }}>{item.label}</button>)}</div></details>;
}

export function Statistic({ title, value, prefix, suffix, precision = 0 }: { title: ReactNode; value: number | string; prefix?: ReactNode; suffix?: ReactNode; precision?: number }) {
  const formatted = typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }) : value;
  return <div className="at-statistic"><div className="at-statistic__title">{title}</div><div className="at-statistic__value">{prefix && <span>{prefix}</span>}{formatted}{suffix && <span>{suffix}</span>}</div></div>;
}

export function Image({ src, alt = '', preview = true, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement> & { preview?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><img {...props} src={src} alt={alt} className={`at-image ${preview ? 'at-image--previewable' : ''} ${className}`} onClick={(event) => { props.onClick?.(event); if (preview) setOpen(true); }} />{open && <div className="at-image-preview" role="dialog" aria-label="图片预览" onClick={() => setOpen(false)}><button type="button" aria-label="关闭预览" onClick={() => setOpen(false)}>×</button><img src={src} alt={alt} /></div>}</>;
}
export type { FloatingPlacement } from './internal/floating';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content' | 'title'> {
  content: ReactNode;
  title?: ReactNode;
  trigger?: 'click' | 'hover';
  placement?: FloatingPlacement;
  children: ReactNode;
}

export function Popover({ content, children, title, trigger = 'click', placement = 'bottom', className = '', ...props }: PopoverProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLButtonElement, HTMLSpanElement>(open, placement, { gap: 10 });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openPopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, anchorRef, panelRef]);

  return <span {...props} className={`at-popover at-popover--${trigger} ${className}`}>
    <button ref={anchorRef} type="button" className="at-popover__trigger" aria-expanded={open} aria-controls={id} aria-haspopup="dialog" onClick={trigger === 'click' ? () => setOpen((current) => !current) : undefined} onMouseEnter={trigger === 'hover' ? openPopover : undefined} onMouseLeave={trigger === 'hover' ? scheduleClose : undefined} onFocus={trigger === 'hover' ? openPopover : undefined} onBlur={trigger === 'hover' ? scheduleClose : undefined}>{children}</button>
    {open && typeof document !== 'undefined' && createPortal(<span ref={panelRef} id={id} className={`at-popover__panel at-popover__panel--${position?.placement ?? placement}`} role="dialog" aria-label={typeof title === 'string' ? title : undefined} style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }} onMouseEnter={trigger === 'hover' ? openPopover : undefined} onMouseLeave={trigger === 'hover' ? scheduleClose : undefined}>
      {title && <strong>{title}</strong>}<span>{content}</span>
    </span>, document.body)}
  </span>;
}

export interface PopconfirmProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title' | 'onConfirm'> {
  title: ReactNode;
  description?: ReactNode;
  onConfirm?: (event: ReactMouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  placement?: FloatingPlacement;
  confirmText?: string;
  cancelText?: string;
  children: ReactNode;
}

export function Popconfirm({ title, description, onConfirm, onCancel, placement = 'bottom', confirmText = '确定', cancelText = '取消', children, className = '', ...props }: PopconfirmProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLButtonElement, HTMLSpanElement>(open, placement, { gap: 10 });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, anchorRef, panelRef]);

  const handleConfirm = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    setConfirmError(false);
    setConfirming(true);
    try {
      await onConfirm?.(event);
      setOpen(false);
    } catch {
      setConfirmError(true);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onCancel?.(event);
    setOpen(false);
  };

  return <span {...props} className={`at-popconfirm ${className}`}>
    <button ref={anchorRef} type="button" aria-expanded={open} aria-controls={id} aria-haspopup="dialog" onClick={() => setOpen((current) => !current)}>{children}</button>
    {open && typeof document !== 'undefined' && createPortal(<span ref={panelRef} id={id} className={`at-popconfirm__panel at-popconfirm__panel--${position?.placement ?? placement}`} role="alertdialog" aria-label={typeof title === 'string' ? title : '确认操作'} aria-busy={confirming} style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}>
      <strong>{title}</strong>{description && <span>{description}</span>}{confirmError && <span className="at-popconfirm__error" role="alert">操作失败，请重试。</span>}
      <span className="at-popconfirm__actions"><button type="button" disabled={confirming} onClick={handleCancel}>{cancelText}</button><button type="button" disabled={confirming} onClick={(event) => { void handleConfirm(event); }}>{confirming ? '处理中…' : confirmText}</button></span>
    </span>, document.body)}
  </span>;
}
export function Result({ status = 'info', title, subTitle, extra }: { status?: 'success' | 'error' | 'info' | 'warning' | '404' | '500'; title: ReactNode; subTitle?: ReactNode; extra?: ReactNode }) {
  const icons = { success: '✓', error: '×', info: 'i', warning: '!', '404': '404', '500': '500' };
  return <section className={`at-result at-result--${status}`}><span className="at-result__icon" aria-hidden="true">{icons[status]}</span><h2>{title}</h2>{subTitle && <p>{subTitle}</p>}{extra && <div className="at-result__extra">{extra}</div>}</section>;
}

export interface CalendarProps { value?: Date; defaultValue?: Date; onChange?: (date: Date) => void }
export function Calendar({ value, defaultValue = new Date(), onChange }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(defaultValue.getFullYear(), defaultValue.getMonth(), 1));
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const days = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  return <div className="at-calendar"><header><button type="button" aria-label="上个月" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>‹</button><strong>{visibleMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</strong><button type="button" aria-label="下个月" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>›</button></header><div className="at-calendar__grid">{'日一二三四五六'.split('').map((day, index) => <span className="at-calendar__weekday" key={`${day}${index}`}>{day}</span>)}{Array.from({ length: firstDay }, (_, index) => <span aria-hidden="true" className="at-calendar__blank" key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => { const date = index + 1; const isSelected = selected.getFullYear() === visibleMonth.getFullYear() && selected.getMonth() === visibleMonth.getMonth() && selected.getDate() === date; return <button type="button" key={date} aria-pressed={isSelected} className={isSelected ? 'at-calendar__day at-calendar__day--selected' : 'at-calendar__day'} onClick={() => { const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), date); setInternalValue(next); onChange?.(next); }}>{date}</button>; })}</div></div>;
}
export function Carousel({ items, autoplay = false, interval = 4000 }: { items: ReactNode[]; autoplay?: boolean; interval?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!autoplay || items.length < 2) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % items.length), Math.max(1000, interval));
    return () => window.clearInterval(timer);
  }, [autoplay, interval, items.length]);
  return <div className="at-carousel" data-autoplay={autoplay} data-interval={interval}><div className="at-carousel__slide" aria-live="polite">{items[current]}</div><div className="at-carousel__controls"><button type="button" aria-label="上一张" onClick={() => setCurrent((index) => (index - 1 + items.length) % items.length)}>‹</button><span>{current + 1} / {items.length}</span><button type="button" aria-label="下一张" onClick={() => setCurrent((index) => (index + 1) % items.length)}>›</button></div></div>;
}
export function List<T>({ dataSource, renderItem, bordered = false }: { dataSource: T[]; renderItem: (item: T, index: number) => ReactNode; bordered?: boolean }) {
  return <ul className={`at-list ${bordered ? 'at-list--bordered' : ''}`}>{dataSource.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)}</ul>;
}
export function Listy({ items, itemHeight = 44, height = 220 }: { items: ReactNode[]; itemHeight?: number; height?: number }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight));
  const visible = Math.ceil(height / itemHeight) + 2;
  return <div className="at-listy" style={{ height, overflowY: 'auto' }} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}><div style={{ height: items.length * itemHeight, position: 'relative' }}><div className="at-listy__window" style={{ position: 'absolute', top: start * itemHeight, left: 0, right: 0 }}>{items.slice(start, start + visible).map((item, index) => <div className="at-listy__item" style={{ height: itemHeight }} key={start + index}>{item}</div>)}</div></div></div>;
}
export function Masonry({ items, columns = 3, gap = 16 }: { items: ReactNode[]; columns?: number; gap?: number }) {
  return <div className="at-masonry" style={{ columnCount: columns, columnGap: gap, '--at-masonry-gap': `${gap}px` } as CSSProperties}>{items.map((item, index) => <div className="at-masonry__item" key={index}>{item}</div>)}</div>;
}
export function QRCode({ value, size = 144, title = '二维码' }: { value: string; size?: number; title?: string }) {
  const [source, setSource] = useState('');
  useEffect(() => {
    let active = true;
    QRCodeEncoder.toDataURL(value, { width: size, margin: 1, color: { dark: '#222438', light: '#ffffff' } })
      .then((url) => { if (active) setSource(url); })
      .catch(() => { if (active) setSource(''); });
    return () => { active = false; };
  }, [size, value]);
  return source ? <img className="at-qrcode" src={source} width={size} height={size} alt={`${title}：${value}`} /> : <span className="at-qrcode__loading" role="status">正在生成二维码…</span>;
}

export interface MenuItem { key: string; label: ReactNode; disabled?: boolean; onClick?: () => void }
export function Menu({ items, selectedKey, onSelect, orientation = 'vertical' }: { items: MenuItem[]; selectedKey?: string; onSelect?: (key: string) => void; orientation?: 'vertical' | 'horizontal' }) {
  return <nav className={`at-menu at-menu--${orientation}`} aria-label="菜单">{items.map((item) => <button key={item.key} type="button" disabled={item.disabled} aria-current={selectedKey === item.key ? 'page' : undefined} className={selectedKey === item.key ? 'at-menu__item at-menu__item--active' : 'at-menu__item'} onClick={() => { onSelect?.(item.key); item.onClick?.(); }}>{item.label}</button>)}</nav>;
}
export function Tree({ options, onSelect }: { options: CascaderOption[]; onSelect?: (option: CascaderOption) => void }) {
  const renderItems = (items: CascaderOption[]) => <ul>{items.map((item) => <li key={item.value}>{item.children?.length ? <details open><summary>{item.label}</summary>{renderItems(item.children)}</details> : <button type="button" disabled={item.disabled} onClick={() => onSelect?.(item)}>{item.label}</button>}</li>)}</ul>;
  return <div className="at-tree">{renderItems(options)}</div>;
}
export function Tour({ steps, open = true, onClose }: { steps: Array<{ title: ReactNode; description?: ReactNode }>; open?: boolean; onClose?: () => void }) {
  const [current, setCurrent] = useState(0);
  if (!open || !steps.length) return null;
  const step = steps[Math.min(current, steps.length - 1)];
  return <section className="at-tour" role="dialog" aria-modal="true" aria-label="产品引导"><span>步骤 {current + 1} / {steps.length}</span><h3>{step.title}</h3>{step.description && <p>{step.description}</p>}<footer><button type="button" onClick={onClose}>跳过</button>{current > 0 && <button type="button" onClick={() => setCurrent((index) => index - 1)}>上一步</button>}<button type="button" onClick={() => current === steps.length - 1 ? onClose?.() : setCurrent((index) => index + 1)}>{current === steps.length - 1 ? '完成' : '下一步'}</button></footer></section>;
}
export function Watermark({ content, children, rotate = -20, opacity = 0.1 }: { content: string; children: ReactNode; rotate?: number; opacity?: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="100"><text x="12" y="54" fill="#685cf6" fill-opacity="${opacity}" font-size="15" transform="rotate(${rotate} 90 50)">${content.replace(/[<>&"']/g, '')}</text></svg>`;
  return <div className="at-watermark" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` }}>{children}</div>;
}
export function Splitter({ first, second, defaultSize = 50 }: { first: ReactNode; second: ReactNode; defaultSize?: number }) {
  const [size, setSize] = useState(defaultSize);
  return <div className="at-splitter" style={{ gridTemplateColumns: `${size}% 8px 1fr` }} onPointerMove={(event) => { if (!event.buttons) return; const rect = event.currentTarget.getBoundingClientRect(); setSize(Math.min(80, Math.max(20, ((event.clientX - rect.left) / rect.width) * 100))); }}><div>{first}</div><div className="at-splitter__bar" role="separator" aria-orientation="vertical" aria-label="调整面板宽度" aria-valuenow={Math.round(size)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'ArrowLeft') setSize((value) => Math.max(20, value - 2)); if (event.key === 'ArrowRight') setSize((value) => Math.min(80, value + 2)); }} onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} /><div>{second}</div></div>;
}

export type MessageType = 'success' | 'info' | 'warning' | 'error';
export function Message({ type = 'info', content, duration = 4000, onClose }: { type?: MessageType; content: ReactNode; duration?: number; onClose?: () => void }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!duration) return;
    const timer = window.setTimeout(() => { setVisible(false); onClose?.(); }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);
  if (!visible) return null;
  const close = () => { setVisible(false); onClose?.(); };
  return <div className={`at-message at-message--${type}`} role={type === 'error' ? 'alert' : 'status'}><span aria-hidden="true">{type === 'success' ? '✓' : type === 'error' ? '!' : '·'}</span>{content}<button type="button" aria-label="关闭提示" onClick={close}>×</button></div>;
}
export function Notification({ title, description, type = 'info', placement = 'top-right', onClose }: { title: ReactNode; description?: ReactNode; type?: MessageType; placement?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'; onClose?: () => void }) {
  return <aside className={`at-notification at-notification--${placement} at-notification--${type}`} role="status"><div><strong>{title}</strong>{description && <p>{description}</p>}</div>{onClose && <button type="button" aria-label="关闭通知" onClick={onClose}>×</button>}</aside>;
}

export interface AppProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
export function App({ children, className = '', ...props }: AppProps) {
  return <div {...props} className={`at-app ${className}`}>{children}</div>;
}
export interface UIConfig { prefixCls: string; direction: 'ltr' | 'rtl' }
const defaultUIConfig: UIConfig = { prefixCls: 'at', direction: 'ltr' };
const UIConfigContext = createContext<UIConfig>(defaultUIConfig);
export function ConfigProvider({ children, prefixCls = 'at', direction = 'ltr', theme }: { children: ReactNode; prefixCls?: string; direction?: 'ltr' | 'rtl'; theme?: { primaryColor?: string; borderRadius?: string } }) {
  const style: CSSProperties & { '--at-color-primary'?: string; '--at-radius-md'?: string } = {};
  if (theme?.primaryColor) style['--at-color-primary'] = theme.primaryColor;
  if (theme?.borderRadius) style['--at-radius-md'] = theme.borderRadius;
  return <UIConfigContext.Provider value={{ prefixCls, direction }}><div className={`${prefixCls}-config`} dir={direction} style={style}>{children}</div></UIConfigContext.Provider>;
}
export function useConfig() { return useContext(UIConfigContext); }

export function BorderBeam({ children, color = '#8b7dff', duration = 5 }: { children: ReactNode; color?: string; duration?: number }) {
  return <div className="at-border-beam" style={{ '--at-beam-color': color, '--at-beam-duration': `${duration}s` } as CSSProperties}><div>{children}</div></div>;
}

export const Util = {
  clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); },
  formatNumber(value: number, locale = 'zh-CN') { return new Intl.NumberFormat(locale).format(value); },
  classNames(...names: Array<string | false | null | undefined>) { return names.filter(Boolean).join(' '); },
};
