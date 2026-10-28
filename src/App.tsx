import './styles/theme.css';
import './styles/app.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { FeedbackHost } from './internal/feedback';

export interface AppProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }

export function App({ children, className = '', ...props }: AppProps) {
	return <div {...props} className={`at-app ${className}`}>{children}<FeedbackHost /></div>;
}
