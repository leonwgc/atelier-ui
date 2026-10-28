import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import './styles/theme.css';
import './styles/field.css';
import './styles/mentions.css';
import { FieldShell, highlightMatch } from './internal/Field';
import { Popup, scrollIntoViewIfNeeded, useDismiss, useFloatingPanel, type PopupPlacement } from './internal/floating';
import { assignRef, cx, useControllableState, type Size, type Status } from './utils';

export interface MentionOption { value: string; label?: ReactNode; description?: ReactNode; avatar?: ReactNode; disabled?: boolean }
export type MentionOptionInput = string | MentionOption;

export interface MentionsProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'prefix'> {
  options: MentionOptionInput[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: MentionOption, prefix: string) => void;
  /** Fires with the text typed after a trigger character. */
  onSearch?: (query: string, prefix: string) => void;
  /** Trigger character(s), e.g. `['@', '#']`. */
  prefix?: string | string[];
  /** Inserted after a chosen mention. */
  split?: string;
  filterOption?: boolean | ((query: string, option: MentionOption) => boolean);
  notFoundContent?: ReactNode;
  size?: Size;
  status?: Status;
  label?: string;
  hint?: string;
  error?: string;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  placement?: PopupPlacement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  optionRender?: (option: MentionOption, state: { active: boolean; query: string }) => ReactNode;
}

const MIRROR_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'paddingTop', 'paddingLeft', 'paddingRight', 'borderTopWidth', 'borderLeftWidth', 'boxSizing', 'textTransform', 'wordSpacing', 'tabSize'] as const;

function caretOffset(textarea: HTMLTextAreaElement, index: number) {
  const mirror = document.createElement('div');
  const style = window.getComputedStyle(textarea);
  MIRROR_PROPS.forEach((prop) => { mirror.style[prop] = style[prop]; });
  Object.assign(mirror.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflow: 'hidden', width: `${textarea.clientWidth}px`, top: '0', left: '0' });
  mirror.textContent = textarea.value.slice(0, index);
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  textarea.parentElement?.appendChild(mirror);
  const top = marker.offsetTop - textarea.scrollTop;
  const left = marker.offsetLeft - textarea.scrollLeft;
  const height = parseFloat(style.lineHeight) || marker.offsetHeight;
  mirror.remove();
  return { top, left, height };
}

export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(function Mentions(
  {
    options, value, defaultValue = '', onChange, onSelect, onSearch, prefix = '@', split = ' ', filterOption = true, notFoundContent = '没有匹配的成员',
    size = 'md', status, label, hint, error, autoSize = false, placement = 'bottom-start', popupClassName, popupStyle, optionRender,
    className, id, disabled, rows = 3, placeholder = '输入 @ 提及成员', onKeyDown, onBlur, ...textareaProps
  }, ref,
) {
  const reactId = useId();
  const inputId = id ?? `at-mentions-${reactId}`;
  const listId = `${inputId}-listbox`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const [trigger, setTrigger] = useState<{ start: number; prefix: string; query: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caret, setCaret] = useState<{ top: number; left: number; height: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const prefixes = useMemo(() => (Array.isArray(prefix) ? prefix : [prefix]), [prefix]);
  const normalized = useMemo(() => options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option)), [options]);

  const suggestions = useMemo(() => {
    if (!trigger) return [];
    if (filterOption === false) return normalized;
    if (typeof filterOption === 'function') return normalized.filter((option) => filterOption(trigger.query, option));
    const lower = trigger.query.toLocaleLowerCase();
    return normalized.filter((option) => option.value.toLocaleLowerCase().includes(lower) || (typeof option.label === 'string' && option.label.toLocaleLowerCase().includes(lower)));
  }, [trigger, normalized, filterOption]);

  const showPopup = Boolean(trigger) && !disabled;
  const floating = useFloatingPanel<HTMLSpanElement, HTMLDivElement>(showPopup, placement, { gap: 4 });
  useDismiss(showPopup, [floating.anchorRef, floating.panelRef, textareaRef], () => setTrigger(null));
  useEffect(() => { scrollIntoViewIfNeeded(listRef.current, activeIndex); }, [activeIndex]);
  useEffect(() => { if (trigger) floating.updatePosition(); }, [caret, trigger, floating]);

  const detectTrigger = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    for (const char of prefixes) {
      const index = before.lastIndexOf(char);
      if (index < 0) continue;
      const preceding = before[index - 1];
      if (index > 0 && preceding && !/\s/.test(preceding)) continue;
      const query = before.slice(index + char.length);
      if (/\s/.test(query)) continue;
      return { start: index, prefix: char, query };
    }
    return null;
  };

  const sync = (text: string, cursor: number) => {
    const next = detectTrigger(text, cursor);
    setTrigger(next);
    if (next) {
      setActiveIndex(0);
      onSearch?.(next.query, next.prefix);
      if (textareaRef.current) setCaret(caretOffset(textareaRef.current, next.start));
    }
  };

  const choose = (option: MentionOption) => {
    if (!trigger || option.disabled) return;
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? current.length;
    const inserted = `${trigger.prefix}${option.value}${split}`;
    const next = `${current.slice(0, trigger.start)}${inserted}${current.slice(cursor)}`;
    setCurrent(next);
    onSelect?.(option, trigger.prefix);
    setTrigger(null);
    requestAnimationFrame(() => {
      if (!textarea) return;
      const position = trigger.start + inserted.length;
      textarea.focus();
      textarea.setSelectionRange(position, position);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !showPopup) return;
    const enabled = suggestions.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!enabled.length) return;
      const at = enabled.indexOf(activeIndex);
      setActiveIndex(enabled[(at + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length]);
    } else if ((event.key === 'Enter' || event.key === 'Tab') && suggestions[activeIndex]) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setTrigger(null);
    }
  };

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea || !autoSize) return;
    const { minRows = rows, maxRows } = typeof autoSize === 'object' ? autoSize : {};
    const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight) || 22;
    textarea.style.height = 'auto';
    const padding = textarea.offsetHeight - textarea.clientHeight;
    const min = minRows * lineHeight + padding;
    const max = maxRows ? maxRows * lineHeight + padding : Number.POSITIVE_INFINITY;
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, min), max)}px`;
  };
  useLayoutEffect(resize, [current, autoSize, rows]);

  const resolvedStatus = status ?? (error ? 'error' : undefined);
  const query = trigger?.query ?? '';

  return <FieldShell label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
    <div className={cx('at-mentions', `at-mentions--${size}`, resolvedStatus && `at-mentions--${resolvedStatus}`, disabled && 'at-mentions--disabled', showPopup && 'at-mentions--open')}>
      <textarea
        {...textareaProps}
        id={inputId}
        ref={(node) => { textareaRef.current = node; assignRef(ref, node); }}
        className="at-mentions__input"
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        value={current}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPopup}
        aria-controls={showPopup ? listId : undefined}
        aria-activedescendant={showPopup && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={resolvedStatus === 'error' || undefined}
        onChange={(event) => { setCurrent(event.target.value); sync(event.target.value, event.target.selectionStart); }}
        onClick={(event) => sync(event.currentTarget.value, event.currentTarget.selectionStart)}
        onKeyUp={(event) => { if (event.key.startsWith('Arrow') && !showPopup) sync(event.currentTarget.value, event.currentTarget.selectionStart); }}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onScroll={() => { if (trigger && textareaRef.current) setCaret(caretOffset(textareaRef.current, trigger.start)); }}
      />
      <span ref={floating.anchorRef} className="at-mentions__caret" aria-hidden="true" style={caret ? { top: caret.top, left: caret.left, height: caret.height } : undefined} />
    </div>
    <Popup open={showPopup} panelRef={floating.panelRef} position={floating.position} placement={placement} className={cx(`at-popup--${size}`, 'at-mentions__popup', popupClassName)} style={popupStyle}>
      <ul ref={listRef} id={listId} className="at-popup__list at-mentions__list" role="listbox" aria-label="可提及成员">
        {suggestions.length === 0 && <li className="at-popup__empty">{notFoundContent}</li>}
        {suggestions.map((option, index) => {
          const active = index === activeIndex;
          return <li
            key={option.value}
            id={`${listId}-${index}`}
            data-index={index}
            role="option"
            aria-selected={active}
            aria-disabled={option.disabled || undefined}
            className={cx('at-option', active && 'at-option--active', option.disabled && 'at-option--disabled')}
            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
            onClick={() => choose(option)}
          >
            {optionRender ? optionRender(option, { active, query }) : <>
              {option.avatar ? <span className="at-mentions__avatar">{option.avatar}</span> : <span className="at-mentions__avatar at-mentions__avatar--initial">{option.value.slice(0, 1)}</span>}
              <span className="at-option__label">{typeof option.label === 'string' ? highlightMatch(option.label, query) : option.label ?? option.value}{option.description && <small className="at-option__description">{option.description}</small>}</span>
            </>}
          </li>;
        })}
      </ul>
    </Popup>
  </FieldShell>;
});
