import { createContext, useContext, useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type IconName = 'plus' | 'search' | 'check' | 'close' | 'arrow-right' | 'info' | 'more';
const iconPaths: Record<IconName, ReactNode> = {
  plus: <><path d="M12 5v14M5 12h14" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, check: <path d="m5 12 4 4L19 6" />, close: <><path d="m6 6 12 12M18 6 6 18" /></>, 'arrow-right': <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>, info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
};
export function Icon({ name, size = 20, title, className = '' }: { name: IconName; size?: number; title?: string; className?: string }) {
  return <svg className={`at-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>{title && <title>{title}</title>}{iconPaths[name]}</svg>;
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

export function Result({ status = 'info', title, subTitle, extra }: { status?: 'success' | 'error' | 'info' | 'warning' | '404' | '500'; title: ReactNode; subTitle?: ReactNode; extra?: ReactNode }) {
  const icons = { success: '✓', error: '×', info: 'i', warning: '!', '404': '404', '500': '500' };
  return <section className={`at-result at-result--${status}`}><span className="at-result__icon" aria-hidden="true">{icons[status]}</span><h2>{title}</h2>{subTitle && <p>{subTitle}</p>}{extra && <div className="at-result__extra">{extra}</div>}</section>;
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
