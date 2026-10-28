import './styles/theme.css';
import './styles/border-beam.css';
import type { CSSProperties, ReactNode } from 'react';

export interface BorderBeamProps { children: ReactNode; color?: string; duration?: number }

export function BorderBeam({ children, color = '#8b7dff', duration = 5 }: BorderBeamProps) {
	return <div className="at-border-beam" style={{ '--at-beam-color': color, '--at-beam-duration': `${duration}s` } as CSSProperties}><div>{children}</div></div>;
}
