import { type ReactNode } from 'react';
import './styles/theme.css';
import './styles/popover.css';
import { Popup, type PopupPlacement } from './internal/floating';
import { useOverlay, type OverlayProps, type OverlayTrigger } from './internal/overlay';
import { renderTrigger } from './internal/trigger';
import { cx } from './utils';

export type { OverlayTrigger as PopoverTrigger, PopupPlacement as PopoverPlacement };
export type FloatingPlacement = PopupPlacement;

export interface PopoverProps extends OverlayProps {
  content: ReactNode;
  title?: ReactNode;
  /** Show the small arrow pointing at the trigger. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

export function Popover({ content, title, arrow = true, children, className, overlayClassName, overlayStyle, trigger = 'click', placement = 'bottom', ...overlayProps }: PopoverProps) {
  const overlay = useOverlay({ ...overlayProps, trigger, placement, gap: arrow ? 10 : 6 });
  const titleId = `${overlay.id}-title`;
  return <>
    {renderTrigger(children, { ...overlay.triggerProps, 'aria-haspopup': 'dialog', className }, overlay.anchorRef, 'at-popover__trigger')}
    <Popup
      open={overlay.open}
      panelRef={overlay.panelRef}
      position={overlay.position}
      placement={overlay.placement}
      id={overlay.id}
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
      className={cx('at-popover__panel', arrow && 'at-popover__panel--arrow', overlayClassName)}
      style={overlayStyle}
      keepTriggerFocus={false}
      {...overlay.panelHoverProps}
    >
      {title && <strong id={titleId} className="at-popover__title">{title}</strong>}
      <div className="at-popover__content">{content}</div>
    </Popup>
  </>;
}
