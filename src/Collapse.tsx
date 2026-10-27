import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/collapse.css';
import { cx } from './utils';

export interface CollapseItem { key: string; title: ReactNode; children: ReactNode; disabled?: boolean; }
export interface CollapseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CollapseItem[];
  accordion?: boolean;
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  onChange?: (activeKey: string | string[]) => void;
}

export function Collapse({ items, accordion = false, activeKey, defaultActiveKey, onChange, className, ...props }: CollapseProps) {
  const id = useId();
  const initial = defaultActiveKey ?? (accordion ? '' : []);
  const [innerKey, setInnerKey] = useState<string | string[]>(initial);
  const selected = activeKey ?? innerKey;
  const activeKeys = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const toggle = (key: string) => {
    const next = activeKeys.includes(key) ? activeKeys.filter((item) => item !== key) : accordion ? [key] : [...activeKeys, key];
    const value = accordion ? next[0] ?? '' : next;
    if (activeKey === undefined) setInnerKey(value);
    onChange?.(value);
  };
  return <div {...props} className={cx('at-collapse', className)}>{items.map((item) => {
    const expanded = activeKeys.includes(item.key);
    const panelId = `at-collapse-${id}-${item.key}`;
    return <section className="at-collapse__item" key={item.key}><h3 className="at-collapse__heading"><button id={`${panelId}-trigger`} type="button" className="at-collapse__trigger" aria-expanded={expanded} aria-controls={panelId} disabled={item.disabled} onClick={() => toggle(item.key)}><span>{item.title}</span><span className="at-collapse__chevron" aria-hidden="true">⌄</span></button></h3>{expanded && <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} className="at-collapse__panel">{item.children}</div>}</section>;
  })}</div>;
}
