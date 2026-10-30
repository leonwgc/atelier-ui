import { useLocale } from './locale';
import './styles/theme.css';
import './styles/notification.css';
import type { ReactNode } from 'react';
import type { MessageType, NotificationPlacement } from './internal/feedback';
export { notification, useNotification } from './internal/feedback';
export type { NotificationOptions, NotificationPlacement } from './internal/feedback';

export interface NotificationProps {
	title: ReactNode;
	description?: ReactNode;
	type?: MessageType;
	placement?: NotificationPlacement;
	onClose?: () => void;
}

export function Notification({ title, description, type = 'info', placement = 'top-right', onClose }: NotificationProps) {
  const { t } = useLocale();

	return <aside className={`at-notification at-notification--${placement} at-notification--${type}`} role="status"><div><strong>{title}</strong>{description && <p>{description}</p>}</div>{onClose && <button type="button" aria-label={t('common.closeNotification')} onClick={onClose}>×</button>}</aside>;
}
