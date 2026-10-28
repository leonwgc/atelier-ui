import './styles/theme.css';
import './styles/grid.css';
import type { ReactNode } from 'react';

export interface GridProps { columns?: number; gap?: number | string; children: ReactNode; className?: string }
export interface GridColProps { span?: number; children: ReactNode; className?: string }

export function Grid({ columns = 24, gap = 16, children, className = '' }: GridProps) {
	return <div className={`at-grid ${className}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>{children}</div>;
}

export function GridCol({ span = 12, children, className = '' }: GridColProps) {
	return <div className={`at-grid__col ${className}`} style={{ gridColumn: `span ${span}` }}>{children}</div>;
}
