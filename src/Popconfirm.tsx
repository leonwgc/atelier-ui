import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/popconfirm.css';
import { Button } from './Button';
import { Popup } from './internal/floating';
import { useOverlay, type OverlayProps } from './internal/overlay';
import { renderTrigger } from './internal/trigger';
import { cx } from './utils';

export interface PopconfirmProps extends Omit<OverlayProps, 'trigger'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onConfirm?: (event: ReactMouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: 'primary' | 'danger';
  showCancel?: boolean;
  errorText?: ReactNode;
  children: ReactNode;
  className?: string;
}

const WarningIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 15.5h.01" /></svg>;

export function Popconfirm({
  title, description, icon, onConfirm, onCancel, okText = '确定', cancelText = '取消', okType = 'primary', showCancel = true, errorText = '操作失败，请重试。',
  children, className, overlayClassName, overlayStyle, placement = 'top', ...overlayProps
}: PopconfirmProps) {
  const overlay = useOverlay({ ...overlayProps, trigger: 'click', placement, gap: 10 });
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const titleId = `${overlay.id}-title`;

  const handleConfirm = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    setFailed(false);
    setConfirming(true);
    try {
      await onConfirm?.(event);
      overlay.setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setConfirming(false);
    }
  };

  return <>
    {renderTrigger(children, { ...overlay.triggerProps, 'aria-haspopup': 'dialog', className }, overlay.anchorRef, 'at-popconfirm__trigger')}
    <Popup
      open={overlay.open}
      panelRef={overlay.panelRef}
      position={overlay.position}
      placement={overlay.placement}
      id={overlay.id}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-modal={false}
      className={cx('at-popconfirm__panel', overlayClassName)}
      style={overlayStyle}
      keepTriggerFocus={false}
    >
      <div className="at-popconfirm__body">
        <span className={cx('at-popconfirm__icon', okType === 'danger' && 'at-popconfirm__icon--danger')} aria-hidden="true">{icon ?? <WarningIcon />}</span>
        <div className="at-popconfirm__text">
          <strong id={titleId} className="at-popconfirm__title">{title}</strong>
          {description && <span className="at-popconfirm__description">{description}</span>}
          {failed && <span className="at-popconfirm__error" role="alert">{errorText}</span>}
        </div>
      </div>
      <div className="at-popconfirm__actions">
        {showCancel && <Button size="sm" variant="secondary" disabled={confirming} onClick={(event) => { onCancel?.(event); overlay.setOpen(false); }}>{cancelText}</Button>}
        <Button size="sm" variant={okType} loading={confirming} autoFocus onClick={(event) => { void handleConfirm(event); }}>{okText}</Button>
      </div>
    </Popup>
  </>;
}
