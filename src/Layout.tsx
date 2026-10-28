import './styles/theme.css';
import './styles/layout.css';
import type { HTMLAttributes, ReactNode } from 'react';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> { children: ReactNode }

export function Layout({ children, className = '', ...props }: LayoutProps) {
	return <div {...props} className={`at-layout ${className}`}>{children}</div>;
}

export function LayoutHeader({ children, className = '', ...props }: LayoutProps) {
	return <header {...props} className={`at-layout__header ${className}`}>{children}</header>;
}

export function LayoutSider({ children, width = 220, className = '', ...props }: LayoutProps & { width?: number | string }) {
	return <aside {...props} className={`at-layout__sider ${className}`} style={{ width, ...props.style }}>{children}</aside>;
}

export function LayoutContent({ children, className = '', ...props }: LayoutProps) {
	return <main {...props} className={`at-layout__content ${className}`}>{children}</main>;
}

export function LayoutFooter({ children, className = '', ...props }: LayoutProps) {
	return <footer {...props} className={`at-layout__footer ${className}`}>{children}</footer>;
}
