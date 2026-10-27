import { type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/steps.css';
import { cx } from './utils';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export interface StepItem { title: ReactNode; description?: ReactNode; status?: StepStatus; disabled?: boolean; }
export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: StepItem[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  onChange?: (step: number) => void;
}

export function Steps({ items, current = 0, direction = 'horizontal', onChange, className, ...props }: StepsProps) {
  const activeIndex = Math.max(0, Math.min(current, items.length - 1));
  return <ol {...props} className={cx('at-steps', `at-steps--${direction}`, className)} aria-label="步骤进度">{items.map((item, index) => {
    const status = item.status ?? (index < activeIndex ? 'finish' : index === activeIndex ? 'process' : 'wait');
    const content = <><span className="at-steps__indicator" aria-hidden="true">{status === 'finish' ? '✓' : status === 'error' ? '!' : index + 1}</span><span className="at-steps__content"><span className="at-steps__title">{item.title}</span>{item.description && <span className="at-steps__description">{item.description}</span>}</span></>;
    return <li key={index} className={cx('at-steps__item', `at-steps__item--${status}`, index === activeIndex && 'at-steps__item--current')} aria-current={index === activeIndex ? 'step' : undefined}>{onChange ? <button type="button" className="at-steps__action" disabled={item.disabled} onClick={() => onChange(index)}>{content}</button> : <div className="at-steps__action">{content}</div>}{index < items.length - 1 && <span className="at-steps__connector" aria-hidden="true" />}</li>;
  })}</ol>;
}
