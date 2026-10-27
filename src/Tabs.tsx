import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/tabs.css';
import { cx } from './utils';

export interface TabItem { key: string; label: ReactNode; children: ReactNode; disabled?: boolean; }
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

export function Tabs({ items, activeKey, defaultActiveKey, onChange, className, ...props }: TabsProps) {
  const id = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.key ?? '';
  const [innerKey, setInnerKey] = useState(defaultActiveKey ?? firstEnabled);
  const selectedKey = activeKey ?? innerKey;
  const selected = items.find((item) => item.key === selectedKey && !item.disabled) ?? items.find((item) => !item.disabled);
  const select = (key: string) => { if (activeKey === undefined) setInnerKey(key); onChange?.(key); };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = enabled.findIndex((item) => item.key === selected?.key);
    const next = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : enabled[(index + (event.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length];
    if (next) { select(next.key); document.getElementById(`at-tab-${id}-${next.key}`)?.focus(); }
  };
  return <div {...props} className={cx('at-tabs', className)}><div className="at-tabs__list" role="tablist">{items.map((item) => <button key={item.key} id={`at-tab-${id}-${item.key}`} type="button" role="tab" aria-selected={selected?.key === item.key} aria-controls={`at-panel-${id}-${item.key}`} tabIndex={selected?.key === item.key ? 0 : -1} disabled={item.disabled} className="at-tabs__tab" onClick={() => select(item.key)} onKeyDown={handleKeyDown}>{item.label}</button>)}</div>{selected && <div id={`at-panel-${id}-${selected.key}`} role="tabpanel" aria-labelledby={`at-tab-${id}-${selected.key}`} className="at-tabs__panel">{selected.children}</div>}</div>;
}
