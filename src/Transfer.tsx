import { useLocale } from './locale';
import { useId, useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/transfer.css';
import { ChevronLeft, ChevronRight, Close, Search } from './internal/icons';
import { cx, useControllableState } from './utils';

export interface TransferItem { key: string; title: string; description?: ReactNode; disabled?: boolean }
export type TransferDirection = 'left' | 'right';

export interface TransferProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  dataSource: TransferItem[];
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  onChange?: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
  selectedKeys?: string[];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  titles?: [ReactNode, ReactNode];
  operations?: [string, string];
  showSearch?: boolean;
  searchPlaceholder?: string;
  filterOption?: (query: string, item: TransferItem) => boolean;
  render?: (item: TransferItem) => ReactNode;
  footer?: (direction: TransferDirection, info: { total: number; selected: number }) => ReactNode;
  showSelectAll?: boolean;
  oneWay?: boolean;
  disabled?: boolean;
  listStyle?: CSSProperties;
  notFoundContent?: ReactNode;
}

export function Transfer({
  dataSource, targetKeys, defaultTargetKeys = [], onChange, selectedKeys, onSelectChange, titles: titlesProp, operations: operationsProp,
  showSearch = false, searchPlaceholder: searchPlaceholderProp, filterOption, render, footer, showSelectAll = true, oneWay = false, disabled = false, listStyle, notFoundContent: notFoundContentProp, className, ...props
}: TransferProps) {
  const { t } = useLocale();
  const titles = titlesProp === undefined ? [t('transfer.source'), t('transfer.target')] : titlesProp;
  const operations = operationsProp === undefined ? [t('transfer.moveRight'), t('transfer.moveLeft')] : operationsProp;
  const searchPlaceholder = searchPlaceholderProp === undefined ? t('common.search') : searchPlaceholderProp;
  const notFoundContent = notFoundContentProp === undefined ? t('common.noData') : notFoundContentProp;

  const id = useId();
  const [targets, setTargets] = useControllableState<string[]>(targetKeys, defaultTargetKeys, undefined);
  const [selectedInternal, setSelectedInternal] = useState<string[]>([]);
  const selected = selectedKeys ?? selectedInternal;
  const [queries, setQueries] = useState<Record<TransferDirection, string>>({ left: '', right: '' });

  const lists = useMemo(() => {
    const targetSet = new Set(targets);
    const left = dataSource.filter((item) => !targetSet.has(item.key));
    const right = targets.map((key) => dataSource.find((item) => item.key === key)).filter((item): item is TransferItem => Boolean(item));
    return { left, right };
  }, [dataSource, targets]);

  const matches = (direction: TransferDirection) => (item: TransferItem) => {
    const query = queries[direction].trim();
    if (!query) return true;
    if (filterOption) return filterOption(query, item);
    return item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  };

  const updateSelected = (next: string[]) => {
    if (selectedKeys == null) setSelectedInternal(next);
    const targetSet = new Set(targets);
    onSelectChange?.(next.filter((key) => !targetSet.has(key)), next.filter((key) => targetSet.has(key)));
  };

  const move = (direction: TransferDirection, keys: string[]) => {
    if (!keys.length) return;
    const next = direction === 'right' ? [...targets, ...keys.filter((key) => !targets.includes(key))] : targets.filter((key) => !keys.includes(key));
    setTargets(next);
    onChange?.(next, direction, keys);
    updateSelected(selected.filter((key) => !keys.includes(key)));
  };

  const leftSelected = lists.left.filter((item) => selected.includes(item.key)).map((item) => item.key);
  const rightSelected = lists.right.filter((item) => selected.includes(item.key)).map((item) => item.key);

  const renderPanel = (direction: TransferDirection, title: ReactNode) => {
    const all = direction === 'left' ? lists.left : lists.right;
    const visible = all.filter(matches(direction));
    const selectable = visible.filter((item) => !item.disabled);
    const selectedHere = selectable.filter((item) => selected.includes(item.key));
    const allChecked = selectable.length > 0 && selectedHere.length === selectable.length;
    const indeterminate = selectedHere.length > 0 && !allChecked;
    const panelId = `${id}-${direction}`;
    const canRemoveInline = oneWay && direction === 'right';
    return <section className={cx('at-transfer__panel', disabled && 'at-transfer__panel--disabled')} style={listStyle} aria-labelledby={`${panelId}-title`}>
      <header className="at-transfer__header">
        {showSelectAll && !canRemoveInline && <input type="checkbox" className="at-transfer__checkbox" aria-label={t('transfer.selectAll', { title: typeof title === 'string' ? title : '' })} checked={allChecked} disabled={disabled || !selectable.length} ref={(node) => { if (node) node.indeterminate = indeterminate; }} onChange={(event) => updateSelected(event.target.checked ? [...new Set([...selected, ...selectable.map((item) => item.key)])] : selected.filter((key) => !selectable.some((item) => item.key === key)))} />}
        <strong id={`${panelId}-title`}>{title}</strong>
        <span className="at-transfer__count">{selectedHere.length ? `${selectedHere.length}/${all.length}` : all.length} {t('transfer.items')}</span>
      </header>
      {showSearch && <label className="at-transfer__search"><Search size={14} /><input value={queries[direction]} placeholder={searchPlaceholder} aria-label={t('transfer.search', { title: typeof title === 'string' ? title : '' })} disabled={disabled} onChange={(event) => setQueries((current) => ({ ...current, [direction]: event.target.value }))} />{queries[direction] && <button type="button" aria-label={t('common.clearSearch')} onClick={() => setQueries((current) => ({ ...current, [direction]: '' }))}><Close size={10} /></button>}</label>}
      <ul className="at-transfer__list" role="list">
        {visible.length === 0 && <li className="at-transfer__empty">{notFoundContent}</li>}
        {visible.map((item) => {
          const checked = selected.includes(item.key);
          const content = render ? render(item) : item.title;
          return <li key={item.key} className={cx('at-transfer__item', checked && 'at-transfer__item--checked', item.disabled && 'at-transfer__item--disabled')}>
            <label className="at-transfer__option">
              {!canRemoveInline && <input type="checkbox" className="at-transfer__checkbox" checked={checked} disabled={disabled || item.disabled} onChange={(event) => updateSelected(event.target.checked ? [...selected, item.key] : selected.filter((key) => key !== item.key))} />}
              <span className="at-transfer__text">{content}{item.description && <small>{item.description}</small>}</span>
            </label>
            {canRemoveInline && <button type="button" className="at-transfer__remove" aria-label={t('common.removeItem', { name: item.title })} disabled={disabled || item.disabled} onClick={() => move('left', [item.key])}><Close size={12} /></button>}
          </li>;
        })}
      </ul>
      {footer && <footer className="at-transfer__footer">{footer(direction, { total: all.length, selected: selectedHere.length })}</footer>}
    </section>;
  };

  return <div {...props} className={cx('at-transfer', oneWay && 'at-transfer--one-way', className)}>
    {renderPanel('left', titles[0])}
    <div className="at-transfer__actions">
      <button type="button" className="at-transfer__move" disabled={disabled || !leftSelected.length} onClick={() => move('right', leftSelected)} aria-label={operations[0]}><ChevronRight size={16} />{leftSelected.length > 0 && <span className="at-transfer__move-count">{leftSelected.length}</span>}</button>
      {!oneWay && <button type="button" className="at-transfer__move" disabled={disabled || !rightSelected.length} onClick={() => move('left', rightSelected)} aria-label={operations[1]}><ChevronLeft size={16} />{rightSelected.length > 0 && <span className="at-transfer__move-count">{rightSelected.length}</span>}</button>}
    </div>
    {renderPanel('right', titles[1])}
  </div>;
}
