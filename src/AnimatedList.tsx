import './styles/theme.css';
import './styles/animated-list.css';
import { isValidElement, type CSSProperties, type HTMLAttributes, type Key, type ReactNode } from 'react';

interface AnimatedListBaseProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  staggerDelay?: number;
  duration?: number;
  itemClassName?: string;
}

export type AnimatedListProps<T = never> = AnimatedListBaseProps & (
  | { items: readonly ReactNode[]; renderItem?: never; getItemKey?: never }
  | {
      items: readonly T[];
      renderItem: (item: T, index: number) => ReactNode;
      getItemKey?: (item: T, index: number) => Key;
    }
);

export function AnimatedList<T = never>(props: AnimatedListProps<T>) {
  const { items, renderItem, getItemKey, staggerDelay = 70, duration = 420, itemClassName = '', className = '', style, ...listProps } = props;
  const renderListItem = (content: ReactNode, index: number, key: Key = index) => {
    const itemStyle = {
      '--at-animated-list-delay': `${Math.max(0, index * staggerDelay)}ms`,
      '--at-animated-list-duration': `${Math.max(0, duration)}ms`,
    } as CSSProperties;
    return <li key={key} className={`at-animated-list__item ${itemClassName}`} style={itemStyle}>{content}</li>;
  };
  const listItems = renderItem
    ? items.map((item, index) => {
      const content = renderItem(item, index);
      const key = getItemKey?.(item, index) ?? (isValidElement(content) && content.key !== null ? content.key : index);
      return renderListItem(content, index, key);
    })
    : items.map((item, index) => {
      const key = isValidElement(item) && item.key !== null ? item.key : index;
      return renderListItem(item, index, key);
    });

  return (
    <ul {...listProps} className={`at-animated-list ${className}`} style={style}>
      {listItems}
    </ul>
  );
}