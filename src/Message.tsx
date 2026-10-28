import './styles/theme.css';
import './styles/message.css';
import { useEffect, useState, type ReactNode } from 'react';
export { message } from './internal/feedback';
export type { MessageOptions, MessageType } from './internal/feedback';

export interface MessageProps {
	type?: import('./internal/feedback').MessageType;
	content: ReactNode;
	duration?: number;
	onClose?: () => void;
}

export function Message({ type = 'info', content, duration = 4000, onClose }: MessageProps) {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		if (!visible || !duration) return;
		const timer = window.setTimeout(() => { setVisible(false); onClose?.(); }, duration);
		return () => window.clearTimeout(timer);
	}, [duration, onClose, visible]);
	if (!visible) return null;
	const close = () => { setVisible(false); onClose?.(); };
	return <div className={`at-message at-message--${type}`} role={type === 'error' ? 'alert' : 'status'}><span aria-hidden="true">{type === 'success' ? '✓' : type === 'error' ? '!' : '·'}</span>{content}<button type="button" aria-label="关闭提示" onClick={close}>×</button></div>;
}
