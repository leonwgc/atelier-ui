import { useLocale } from './locale';
import { useEffect, useLayoutEffect, useRef, useState, type AnchorHTMLAttributes, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './styles/theme.css';
import './styles/typography.css';
import { Check } from './internal/icons';
import { cx } from './utils';

export type TextType = 'secondary' | 'success' | 'warning' | 'danger';

export interface CopyableConfig { text?: string; onCopy?: () => void; tooltips?: [ReactNode, ReactNode] }
export interface EditableConfig { editing?: boolean; onStart?: () => void; onChange?: (value: string) => void; onCancel?: () => void; onEnd?: () => void; maxLength?: number }
export interface EllipsisConfig { rows?: number; expandable?: boolean; symbol?: ReactNode; onExpand?: () => void; tooltip?: boolean }

export interface TypographyBaseProps {
  type?: TextType;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
  mark?: boolean;
  keyboard?: boolean;
  disabled?: boolean;
  copyable?: boolean | CopyableConfig;
  editable?: boolean | EditableConfig;
  ellipsis?: boolean | EllipsisConfig;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const CopyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return '';
}

function CopyButton({ config, content }: { config: CopyableConfig; content: ReactNode }) {
  const { t } = useLocale();

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  const [idle, done] = config.tooltips ?? [t('typography.copy'), t('typography.copied')];
  const copy = async () => {
    const text = config.text ?? textOf(content);
    try { await navigator.clipboard.writeText(text); } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(true);
    config.onCopy?.();
  };
  return <button type="button" className={cx('at-typography__action', copied && 'at-typography__action--done')} aria-label={typeof (copied ? done : idle) === 'string' ? String(copied ? done : idle) : t('typography.copy')} title={typeof (copied ? done : idle) === 'string' ? String(copied ? done : idle) : undefined} onClick={() => { void copy(); }}>
    {copied ? <Check size={14} /> : <CopyIcon />}
  </button>;
}

function Editor({ value, config, onDone }: { value: string; config: EditableConfig; onDone: () => void }) {
  const { t } = useLocale();

  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const area = ref.current;
    if (!area) return;
    area.focus();
    area.setSelectionRange(area.value.length, area.value.length);
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight}px`;
  }, [draft]);
  const commit = () => { config.onChange?.(draft); config.onEnd?.(); onDone(); };
  const cancel = () => { config.onCancel?.(); config.onEnd?.(); onDone(); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); commit(); }
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
  };
  return <textarea ref={ref} className="at-typography__editor" value={draft} maxLength={config.maxLength} rows={1} aria-label={t('typography.editText')} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} onBlur={commit} />;
}

const BASE_KEYS = new Set(['type', 'strong', 'italic', 'underline', 'delete', 'code', 'mark', 'keyboard', 'disabled', 'copyable', 'editable', 'ellipsis', 'children', 'className', 'style']);
function splitProps<T extends TypographyBaseProps>(props: T): [TypographyBaseProps, Omit<T, keyof TypographyBaseProps>] {
  const base: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => { if (BASE_KEYS.has(key)) base[key] = value; else rest[key] = value; });
  return [base as TypographyBaseProps, rest as Omit<T, keyof TypographyBaseProps>];
}

function useTypography(props: TypographyBaseProps) {
  const { t } = useLocale();
  const { type, strong, italic, underline, delete: deleted, code, mark, keyboard, disabled, copyable, editable, ellipsis, children, className, style } = props;
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const editableConfig: EditableConfig | null = editable ? (editable === true ? {} : editable) : null;
  const copyConfig: CopyableConfig | null = copyable ? (copyable === true ? {} : copyable) : null;
  const ellipsisConfig: EllipsisConfig | null = ellipsis ? (ellipsis === true ? { rows: 1 } : { rows: 1, ...ellipsis }) : null;
  const isEditing = editableConfig?.editing ?? editing;
  const rows = ellipsisConfig?.rows ?? 1;
  const clamp = ellipsisConfig && !expanded;

  let content: ReactNode = children;
  if (code) content = <code className="at-typography__code">{content}</code>;
  if (keyboard) content = <kbd className="at-typography__kbd">{content}</kbd>;
  if (mark) content = <mark className="at-typography__mark">{content}</mark>;
  if (deleted) content = <del>{content}</del>;
  if (underline) content = <u>{content}</u>;
  if (italic) content = <i>{content}</i>;
  if (strong) content = <strong>{content}</strong>;

  const classes = cx('at-typography', type && `at-typography--${type}`, disabled && 'at-typography--disabled', clamp && (rows > 1 ? 'at-typography--clamp' : 'at-typography--ellipsis'), className);
  const styles: CSSProperties = clamp && rows > 1 ? { WebkitLineClamp: rows, ...style } : style ?? {};
  const actions = (copyConfig || editableConfig) && !isEditing ? <span className="at-typography__actions">
    {editableConfig && <button type="button" className="at-typography__action" aria-label={t('typography.edit')} title={t('typography.edit')} onClick={() => { editableConfig.onStart?.(); if (editableConfig.editing === undefined) setEditing(true); }}><EditIcon /></button>}
    {copyConfig && <CopyButton config={copyConfig} content={children} />}
  </span> : null;
  const expandButton = ellipsisConfig?.expandable && !expanded ? <button type="button" className="at-typography__expand" onClick={() => { setExpanded(true); ellipsisConfig.onExpand?.(); }}>{ellipsisConfig.symbol ?? t('common.expand')}</button> : null;
  const title = clamp && ellipsisConfig?.tooltip !== false && typeof children === 'string' ? children : undefined;

  const editor = isEditing && editableConfig ? <Editor value={textOf(children)} config={editableConfig} onDone={() => setEditing(false)} /> : null;
  return { classes, styles, content, actions, expandButton, editor, title };
}

export interface TextProps extends TypographyBaseProps, Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className' | 'style' | 'type'> {}
export function Text(props: TextProps) {
  const [base, rest] = splitProps(props);
  const t = useTypography(base);
  if (t.editor) return <span className={cx(t.classes, 'at-typography--editing')}>{t.editor}</span>;
  return <span {...rest} className={t.classes} style={t.styles} title={t.title}>{t.content}{t.expandButton}{t.actions}</span>;
}

export interface ParagraphProps extends TypographyBaseProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'type'> {}
export function Paragraph(props: ParagraphProps) {
  const [base, rest] = splitProps(props);
  const t = useTypography(base);
  if (t.editor) return <div className={cx(t.classes, 'at-typography--paragraph', 'at-typography--editing')}>{t.editor}</div>;
  return <div {...rest} className={cx(t.classes, 'at-typography--paragraph')}>
    <p className="at-typography__paragraph-text" style={t.styles} title={t.title}>{t.content}{t.expandButton && <> {t.expandButton}</>}</p>
    {t.actions}
  </div>;
}

export interface TitleProps extends TypographyBaseProps, Omit<HTMLAttributes<HTMLHeadingElement>, 'children' | 'className' | 'style' | 'type'> {
  level?: 1 | 2 | 3 | 4 | 5;
}
export function Title(props: TitleProps) {
  const [base, { level = 1, ...rest }] = splitProps(props);
  const t = useTypography(base);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  if (t.editor) return <div className={cx(t.classes, 'at-typography--title', `at-typography--h${level}`, 'at-typography--editing')}>{t.editor}</div>;
  return <Tag {...rest} className={cx(t.classes, 'at-typography--title', `at-typography--h${level}`)} style={t.styles} title={t.title}>{t.content}{t.expandButton}{t.actions}</Tag>;
}

export interface LinkProps extends TypographyBaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'style' | 'type'> {}
export function Link(props: LinkProps) {
  const [base, { href, onClick, target, rel, tabIndex, ...rest }] = splitProps(props);
  const t = useTypography(base);
  return <a
    {...rest}
    href={base.disabled ? undefined : href}
    target={target}
    rel={target === '_blank' ? rel ?? 'noopener noreferrer' : rel}
    aria-disabled={base.disabled || undefined}
    tabIndex={base.disabled ? -1 : tabIndex}
    className={cx(t.classes, 'at-typography--link')}
    style={t.styles}
    title={t.title}
    onClick={(event) => { if (base.disabled) { event.preventDefault(); return; } onClick?.(event); }}
  >{t.content}{t.actions}</a>;
}

export interface TypographyProps extends HTMLAttributes<HTMLElement> { as?: 'article' | 'section' | 'div'; children?: ReactNode }
function TypographyRoot({ as: Tag = 'article', className, children, ...props }: TypographyProps) {
  return <Tag {...props} className={cx('at-typography-root', className)}>{children}</Tag>;
}

export const Typography = Object.assign(TypographyRoot, { Title, Text, Paragraph, Link });
