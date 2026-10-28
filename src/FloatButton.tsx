import { createContext, forwardRef, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/float-button.css';
import { Close, Plus } from './internal/icons';
import { cx, useControllableState } from './utils';

export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonType = 'default' | 'primary';

export interface FloatButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  icon?: ReactNode;
  description?: ReactNode;
  shape?: FloatButtonShape;
  type?: FloatButtonType;
  /** Native button type; the visual style is controlled by `type`. */
  htmlType?: 'button' | 'submit' | 'reset';
  tooltip?: string;
  href?: string;
  target?: string;
  badge?: { count?: number; dot?: boolean; overflowCount?: number };
  /** Render inline inside its parent instead of fixed to the viewport. */
  inline?: boolean;
}

interface GroupContextValue { shape: FloatButtonShape; inline: boolean }
const GroupContext = createContext<GroupContextValue | null>(null);

export const FloatButton = forwardRef<HTMLButtonElement, FloatButtonProps>(function FloatButton(
  { icon, description, shape, type = 'default', htmlType = 'button', tooltip, href, target, badge, inline, className, children, ...props }, ref,
) {
  const group = useContext(GroupContext);
  const resolvedShape = shape ?? group?.shape ?? 'circle';
  const resolvedInline = inline ?? group?.inline ?? false;
  const label = props['aria-label'] ?? tooltip ?? (typeof description === 'string' ? description : undefined);
  const content = <>
    <span className="at-float-button__body">
      <span className="at-float-button__icon">{icon ?? children ?? '↑'}</span>
      {description && <span className="at-float-button__description">{description}</span>}
    </span>
    {badge && (badge.dot || (badge.count ?? 0) > 0) && <span className={cx('at-float-button__badge', badge.dot && 'at-float-button__badge--dot')} aria-hidden="true">{!badge.dot && ((badge.count ?? 0) > (badge.overflowCount ?? 99) ? `${badge.overflowCount ?? 99}+` : badge.count)}</span>}
  </>;
  const classes = cx('at-float-button', `at-float-button--${resolvedShape}`, `at-float-button--${type}`, resolvedInline && 'at-float-button--inline', Boolean(description) && 'at-float-button--with-description', className);
  if (href) {
    return <a href={href} target={target} rel={target === '_blank' ? 'noreferrer' : undefined} className={classes} title={tooltip} aria-label={label} style={props.style}>{content}</a>;
  }
  return <button {...props} ref={ref} type={htmlType} className={classes} title={tooltip} aria-label={label}>{content}</button>;
});

export interface FloatButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  shape?: FloatButtonShape;
  type?: FloatButtonType;
  /** When set, the group collapses behind a main button and expands on click or hover. */
  trigger?: 'click' | 'hover';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  description?: ReactNode;
  tooltip?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  inline?: boolean;
  children: ReactNode;
}

export function FloatButtonGroup({ shape = 'circle', type = 'default', trigger, open: openProp, onOpenChange, icon, closeIcon, description, tooltip, placement = 'top', inline = false, className, children, ...props }: FloatButtonGroupProps) {
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const expanded = !trigger || open;
  useEffect(() => {
    if (!trigger || !open) return;
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, [trigger, open, setOpen]);

  return <GroupContext.Provider value={{ shape, inline: true }}>
    <div
      {...props}
      ref={rootRef}
      className={cx('at-float-button-group', `at-float-button-group--${shape}`, `at-float-button-group--${placement}`, trigger && 'at-float-button-group--menu', expanded && 'at-float-button-group--open', inline && 'at-float-button-group--inline', className)}
      onMouseEnter={trigger === 'hover' ? () => setOpen(true) : undefined}
      onMouseLeave={trigger === 'hover' ? () => setOpen(false) : undefined}
    >
      <div className="at-float-button-group__items" role={trigger ? 'menu' : undefined} aria-hidden={!expanded}>{children}</div>
      {trigger && <FloatButton
        type={type}
        shape={shape}
        inline
        icon={open ? closeIcon ?? <Close size={20} /> : icon ?? <Plus size={22} />}
        description={open ? undefined : description}
        tooltip={tooltip}
        aria-expanded={open}
        aria-haspopup="menu"
        className="at-float-button-group__trigger"
        onClick={() => setOpen(!open)}
      />}
    </div>
  </GroupContext.Provider>;
}

export interface BackTopProps extends Omit<FloatButtonProps, 'href' | 'target' | 'onClick'> {
  /** Show once the page has scrolled past this many pixels. */
  visibilityHeight?: number;
  target?: () => HTMLElement | Window;
  duration?: number;
  onClick?: () => void;
}

export function BackTop({ visibilityHeight = 400, target, duration = 450, onClick, icon, tooltip = '回到顶部', className, style, ...props }: BackTopProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const container = target?.() ?? window;
    const check = () => setVisible((container instanceof Window ? container.scrollY : container.scrollTop) > visibilityHeight);
    check();
    container.addEventListener('scroll', check, { passive: true });
    return () => container.removeEventListener('scroll', check);
  }, [target, visibilityHeight]);

  const scrollToTop = () => {
    const container = target?.() ?? window;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || duration <= 0) { container.scrollTo({ top: 0 }); onClick?.(); return; }
    const start = container instanceof Window ? container.scrollY : container.scrollTop;
    const begin = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const frame = (now: number) => {
      const progress = Math.min(1, (now - begin) / duration);
      container.scrollTo({ top: start * (1 - ease(progress)) });
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    onClick?.();
  };

  return <FloatButton
    {...props}
    icon={icon ?? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V6M5 12l7-7 7 7" /></svg>}
    tooltip={tooltip}
    className={cx('at-back-top', visible && 'at-back-top--visible', className)}
    style={style}
    aria-hidden={!visible}
    tabIndex={visible ? 0 : -1}
    onClick={scrollToTop}
  />;
}
