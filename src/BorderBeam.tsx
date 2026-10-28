import './styles/theme.css';
import './styles/border-beam.css';
import type { CSSProperties, ReactNode } from 'react';

export interface BorderBeamProps { children: ReactNode; color?: string; duration?: number; paused?: boolean; className?: string }

export function BorderBeam({ children, color = '#8b7dff', duration = 5, paused = false, className = '' }: BorderBeamProps) {
	return <div className={`at-border-beam${paused ? ' at-border-beam--paused' : ''} ${className}`} style={{ '--at-beam-color': color, '--at-beam-duration': `${Math.max(0.5, duration)}s` } as CSSProperties}><div>{children}</div></div>;
}
