import { createContext, useContext, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/tree.css';
import { highlightMatch } from './internal/Field';
import { Check, ChevronRight } from './internal/icons';
import { cx, useControllableState } from './utils';

export interface TreeNode {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  icon?: ReactNode;
  isLeaf?: boolean;
}

export interface TreeCheckInfo { checked: boolean; node: TreeNode; halfCheckedKeys: string[] }

export interface TreeProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  treeData: TreeNode[];
  checkable?: boolean;
  /** Check nodes independently instead of cascading to parents and children. */
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  defaultExpandAll?: boolean;
  onExpand?: (expandedKeys: string[], info: { expanded: boolean; node: TreeNode }) => void;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: { selected: boolean; node: TreeNode }) => void;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (checkedKeys: string[], info: TreeCheckInfo) => void;
  showLine?: boolean;
  showIcon?: boolean;
  icon?: ReactNode | ((node: TreeNode, state: { expanded: boolean; leaf: boolean }) => ReactNode);
  switcherIcon?: ReactNode;
  titleRender?: (node: TreeNode) => ReactNode;
  /** Highlight matching titles and auto-expand their ancestors. */
  filterValue?: string;
  /** Lazily load children when a non-leaf node without children expands. */
  loadData?: (node: TreeNode) => Promise<void>;
  /** Clicking the title toggles expansion as well as selection. */
  expandAction?: 'click' | false;
  blockNode?: boolean;
  label?: string;
}

interface TreeContextValue {
  checkable: boolean;
  selectable: boolean;
  showLine: boolean;
  showIcon: boolean;
  icon?: TreeProps['icon'];
  switcherIcon?: ReactNode;
  titleRender?: (node: TreeNode) => ReactNode;
  filterValue: string;
  expandedKeys: string[];
  selectedKeys: string[];
  checkedKeys: Set<string>;
  halfCheckedKeys: Set<string>;
  loadingKeys: string[];
  expandAction: 'click' | false;
  toggleExpand: (node: TreeNode) => void;
  select: (node: TreeNode, event: MouseEvent | KeyboardEvent) => void;
  check: (node: TreeNode) => void;
}
const TreeContext = createContext<TreeContextValue | null>(null);

const isLeaf = (node: TreeNode) => node.isLeaf ?? !node.children?.length;
function walk(nodes: TreeNode[], visit: (node: TreeNode, parent: TreeNode | null) => void, parent: TreeNode | null = null) {
  nodes.forEach((node) => { visit(node, parent); if (node.children) walk(node.children, visit, node); });
}
function descendants(node: TreeNode): TreeNode[] {
  return (node.children ?? []).flatMap((child) => [child, ...descendants(child)]);
}

/** Cascade a raw key set down to descendants and up to parents, returning fully and partially checked keys. */
function conduct(nodes: TreeNode[], raw: Set<string>) {
  const checked = new Set<string>();
  const half = new Set<string>();
  const visit = (node: TreeNode, inherited: boolean): { all: boolean; some: boolean } => {
    const own = inherited || raw.has(node.key);
    const children = (node.children ?? []).filter((child) => !child.disabled && !child.disableCheckbox);
    if (!children.length) {
      if (own && !node.disabled && !node.disableCheckbox) checked.add(node.key);
      return { all: own, some: own };
    }
    const results = children.map((child) => visit(child, own));
    const all = results.every((result) => result.all);
    const some = results.some((result) => result.some);
    if (all) checked.add(node.key); else if (some) half.add(node.key);
    return { all, some };
  };
  nodes.forEach((node) => visit(node, false));
  return { checked, half };
}

function TreeNodeItem({ node, level, isLast, ancestorsLast }: { node: TreeNode; level: number; isLast: boolean; ancestorsLast: boolean[] }) {
  const tree = useContext(TreeContext)!;
  const leaf = isLeaf(node);
  const expanded = tree.expandedKeys.includes(node.key);
  const selected = tree.selectedKeys.includes(node.key);
  const checked = tree.checkedKeys.has(node.key);
  const half = tree.halfCheckedKeys.has(node.key);
  const loading = tree.loadingKeys.includes(node.key);
  const canCheck = tree.checkable && node.checkable !== false;
  const canSelect = tree.selectable && node.selectable !== false && !node.disabled;
  const iconNode = tree.showIcon ? (node.icon ?? (typeof tree.icon === 'function' ? tree.icon(node, { expanded, leaf }) : tree.icon)) : null;
  const title = tree.titleRender ? tree.titleRender(node) : typeof node.title === 'string' ? highlightMatch(node.title, tree.filterValue) : node.title;
  const matched = Boolean(tree.filterValue) && typeof node.title === 'string' && node.title.toLocaleLowerCase().includes(tree.filterValue.toLocaleLowerCase());

  return <li
    role="treeitem"
    aria-level={level + 1}
    aria-expanded={leaf ? undefined : expanded}
    aria-selected={canSelect ? selected : undefined}
    aria-checked={canCheck ? (half ? 'mixed' : checked) : undefined}
    aria-disabled={node.disabled || undefined}
    data-key={node.key}
    tabIndex={-1}
    className={cx('at-tree__node', selected && 'at-tree__node--selected', node.disabled && 'at-tree__node--disabled', matched && 'at-tree__node--matched', leaf && 'at-tree__node--leaf')}
    style={{ '--at-tree-level': level } as CSSProperties}
  >
    <div className="at-tree__row" onClick={(event) => { if (node.disabled) return; if (canSelect) tree.select(node, event); if (tree.expandAction === 'click' && !leaf) tree.toggleExpand(node); }}>
      {tree.showLine && ancestorsLast.map((last, index) => <span key={index} className={cx('at-tree__indent', last && 'at-tree__indent--end')} aria-hidden="true" />)}
      {tree.showLine && level > 0 && <span className={cx('at-tree__connector', isLast && 'at-tree__connector--last')} aria-hidden="true" />}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden={leaf}
        aria-label={expanded ? '收起' : '展开'}
        className={cx('at-tree__switcher', leaf && 'at-tree__switcher--leaf', expanded && 'at-tree__switcher--open', loading && 'at-tree__switcher--loading')}
        onClick={(event) => { event.stopPropagation(); if (!leaf) tree.toggleExpand(node); }}
      >{loading ? <span className="at-tree__spinner" /> : !leaf && (tree.switcherIcon ?? <ChevronRight size={14} />)}</button>
      {canCheck && <span
        role="presentation"
        className={cx('at-tree__checkbox', checked && 'at-tree__checkbox--checked', half && 'at-tree__checkbox--half', (node.disabled || node.disableCheckbox) && 'at-tree__checkbox--disabled')}
        onClick={(event) => { event.stopPropagation(); if (!node.disabled && !node.disableCheckbox) tree.check(node); }}
      >{checked && <Check size={12} />}</span>}
      {iconNode && <span className="at-tree__icon">{iconNode}</span>}
      <span className={cx('at-tree__title', canSelect && 'at-tree__title--selectable')}>{title}</span>
    </div>
    {!leaf && node.children && <div className="at-tree__children" aria-hidden={!expanded}>
      <ul role="group" className="at-tree__group">
        {node.children.map((child, index) => <TreeNodeItem key={child.key} node={child} level={level + 1} isLast={index === node.children!.length - 1} ancestorsLast={level === 0 ? [] : [...ancestorsLast, isLast]} />)}
      </ul>
    </div>}
  </li>;
}

export function Tree({
  treeData, checkable = false, checkStrictly = false, selectable = true, multiple = false, expandedKeys: expandedProp, defaultExpandedKeys, defaultExpandAll = false, onExpand,
  selectedKeys: selectedProp, defaultSelectedKeys = [], onSelect, checkedKeys: checkedProp, defaultCheckedKeys = [], onCheck, showLine = false, showIcon = false, icon, switcherIcon, titleRender,
  filterValue = '', loadData, expandAction = false, blockNode = false, label = '树形控件', className, onKeyDown, ...props
}: TreeProps) {
  const allBranchKeys = useMemo(() => { const keys: string[] = []; walk(treeData, (node) => { if (!isLeaf(node)) keys.push(node.key); }); return keys; }, [treeData]);
  const parentOf = useMemo(() => { const map = new Map<string, string | null>(); walk(treeData, (node, parent) => map.set(node.key, parent?.key ?? null)); return map; }, [treeData]);
  const [expanded, setExpanded] = useControllableState<string[]>(expandedProp, defaultExpandedKeys ?? (defaultExpandAll ? allBranchKeys : []), undefined);
  const [selected, setSelected] = useControllableState<string[]>(selectedProp, defaultSelectedKeys, undefined);
  const [rawChecked, setRawChecked] = useControllableState<string[]>(checkedProp, defaultCheckedKeys, undefined);
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);
  const rootRef = useRef<HTMLUListElement | null>(null);

  const filterExpanded = useMemo(() => {
    if (!filterValue) return [];
    const keys = new Set<string>();
    const lower = filterValue.toLocaleLowerCase();
    walk(treeData, (node) => {
      if (typeof node.title === 'string' && node.title.toLocaleLowerCase().includes(lower)) {
        let parent = parentOf.get(node.key);
        while (parent) { keys.add(parent); parent = parentOf.get(parent) ?? null; }
      }
    });
    return [...keys];
  }, [filterValue, treeData, parentOf]);
  const expandedKeys = useMemo(() => [...new Set([...expanded, ...filterExpanded])], [expanded, filterExpanded]);

  const { checked, half } = useMemo(() => {
    if (checkStrictly) return { checked: new Set(rawChecked), half: new Set<string>() };
    return conduct(treeData, new Set(rawChecked));
  }, [treeData, rawChecked, checkStrictly]);

  const context: TreeContextValue = {
    checkable, selectable, showLine, showIcon, icon, switcherIcon, titleRender, filterValue, expandedKeys, selectedKeys: selected, checkedKeys: checked, halfCheckedKeys: half, loadingKeys, expandAction,
    toggleExpand: (node) => {
      const isExpanded = expandedKeys.includes(node.key);
      const next = isExpanded ? expandedKeys.filter((key) => key !== node.key) : [...expandedKeys, node.key];
      setExpanded(next);
      onExpand?.(next, { expanded: !isExpanded, node });
      if (!isExpanded && loadData && !node.children?.length && !loadingKeys.includes(node.key)) {
        setLoadingKeys((keys) => [...keys, node.key]);
        loadData(node).finally(() => setLoadingKeys((keys) => keys.filter((key) => key !== node.key)));
      }
    },
    select: (node, event) => {
      const isSelected = selected.includes(node.key);
      const additive = multiple && (event.ctrlKey || event.metaKey || event.shiftKey);
      const next = isSelected ? (additive ? selected.filter((key) => key !== node.key) : selected.length > 1 ? [node.key] : []) : additive ? [...selected, node.key] : [node.key];
      setSelected(next);
      onSelect?.(next, { selected: !isSelected, node });
    },
    check: (node) => {
      const isChecked = checked.has(node.key);
      let nextRaw: string[];
      if (checkStrictly) {
        nextRaw = isChecked ? rawChecked.filter((key) => key !== node.key) : [...rawChecked, node.key];
      } else {
        const affected = new Set([node.key, ...descendants(node).map((item) => item.key)]);
        const base = new Set([...checked].filter((key) => !affected.has(key)));
        if (!isChecked) { affected.forEach((key) => base.add(key)); }
        nextRaw = [...conduct(treeData, base).checked];
      }
      setRawChecked(nextRaw);
      const result = checkStrictly ? { checked: new Set(nextRaw), half: new Set<string>() } : conduct(treeData, new Set(nextRaw));
      onCheck?.([...result.checked], { checked: !isChecked, node, halfCheckedKeys: [...result.half] });
    },
  };

  const visibleItems = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []).filter((element) => !element.closest('.at-tree__children[aria-hidden="true"]'));
  const findNode = (key: string): TreeNode | undefined => { let found: TreeNode | undefined; walk(treeData, (node) => { if (node.key === key) found = node; }); return found; };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const current = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    if (!current) return;
    const items = visibleItems();
    const index = items.indexOf(current);
    const key = current.dataset.key!;
    const node = findNode(key);
    if (!node) return;
    const focusAt = (position: number) => { items[Math.max(0, Math.min(position, items.length - 1))]?.focus(); };
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); focusAt(index + 1); break;
      case 'ArrowUp': event.preventDefault(); focusAt(index - 1); break;
      case 'Home': event.preventDefault(); focusAt(0); break;
      case 'End': event.preventDefault(); focusAt(items.length - 1); break;
      case 'ArrowRight':
        event.preventDefault();
        if (isLeaf(node)) break;
        if (!expandedKeys.includes(key)) context.toggleExpand(node); else focusAt(index + 1);
        break;
      case 'ArrowLeft': {
        event.preventDefault();
        if (!isLeaf(node) && expandedKeys.includes(key)) { context.toggleExpand(node); break; }
        const parentKey = parentOf.get(key);
        if (parentKey) items.find((item) => item.dataset.key === parentKey)?.focus();
        break;
      }
      case 'Enter': event.preventDefault(); if (!node.disabled && selectable && node.selectable !== false) context.select(node, event); else if (!isLeaf(node)) context.toggleExpand(node); break;
      case ' ': event.preventDefault(); if (checkable && node.checkable !== false && !node.disabled && !node.disableCheckbox) context.check(node); else if (!node.disabled && selectable) context.select(node, event); break;
      default: {
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const lower = event.key.toLocaleLowerCase();
          const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
          ordered.find((item) => item.querySelector('.at-tree__title')?.textContent?.trim().toLocaleLowerCase().startsWith(lower))?.focus();
        }
      }
    }
  };

  // Roving tabindex: first selected (or first) visible node is the tab stop.
  const setRovingTab = (root: HTMLUListElement | null) => {
    rootRef.current = root;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]')).filter((element) => !element.closest('.at-tree__children[aria-hidden="true"]'));
    const target = items.find((item) => item.getAttribute('aria-selected') === 'true') ?? items[0];
    items.forEach((item) => item.setAttribute('tabindex', item === target ? '0' : '-1'));
  };

  return <TreeContext.Provider value={context}>
    <ul
      {...props}
      ref={setRovingTab}
      role="tree"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      className={cx('at-tree', showLine && 'at-tree--line', blockNode && 'at-tree--block', checkable && 'at-tree--checkable', className)}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        // Moving focus into the tree lands on the roving tab stop.
        if (event.target === event.currentTarget) visibleItems().find((item) => item.getAttribute('tabindex') === '0')?.focus();
      }}
    >
      {treeData.map((node, index) => <TreeNodeItem key={node.key} node={node} level={0} isLast={index === treeData.length - 1} ancestorsLast={[]} />)}
    </ul>
  </TreeContext.Provider>;
}
