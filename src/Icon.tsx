import './styles/theme.css';
import './styles/icon.css';
import type { ReactNode } from 'react';

export type IconName = 'plus' | 'search' | 'check' | 'close' | 'arrow-right' | 'info' | 'more';

const iconPaths: Record<IconName, ReactNode> = {
	plus: <><path d="M12 5v14M5 12h14" /></>,
	search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
	check: <path d="m5 12 4 4L19 6" />,
	close: <><path d="m6 6 12 12M18 6 6 18" /></>,
	'arrow-right': <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
	info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
	more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
};

export function Icon({ name, size = 20, title, className = '' }: { name: IconName; size?: number; title?: string; className?: string }) {
	return <svg className={`at-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>{title && <title>{title}</title>}{iconPaths[name]}</svg>;
}
