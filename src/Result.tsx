import './styles/theme.css';
import './styles/result.css';
import type { ReactNode } from 'react';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '500';
export interface ResultProps { status?: ResultStatus; title: ReactNode; subTitle?: ReactNode; extra?: ReactNode }

export function Result({ status = 'info', title, subTitle, extra }: ResultProps) {
	const icons = { success: '✓', error: '×', info: 'i', warning: '!', '404': '404', '500': '500' };
	return <section className={`at-result at-result--${status}`}><span className="at-result__icon" aria-hidden="true">{icons[status]}</span><h2>{title}</h2>{subTitle && <p>{subTitle}</p>}{extra && <div className="at-result__extra">{extra}</div>}</section>;
}
