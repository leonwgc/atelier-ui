import './styles/theme.css';
import './styles/space.css';
import type { ReactNode } from 'react';

export interface SpaceProps {
	size?: number | string;
	direction?: 'horizontal' | 'vertical';
	wrap?: boolean;
	children: ReactNode;
	className?: string;
}

export function Space({ size = 12, direction = 'horizontal', wrap = false, children, className = '' }: SpaceProps) {
	return <div className={`at-space at-space--${direction} ${className}`} style={{ gap: size, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</div>;
}
