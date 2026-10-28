import { createRoot, type Root } from 'react-dom/client';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import '../styles/message.css';
import '../styles/notification.css';

export type MessageType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPlacement = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

export interface FeedbackEntry {
  id: number;
  kind: 'message' | 'notification';
  type: MessageType;
  content: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  duration: number;
  placement: NotificationPlacement;
  onClose?: () => void;
}

const listeners = new Set<() => void>();
const timers = new Map<number, number>();
let entries: FeedbackEntry[] = [];
let nextId = 0;
let appHostCount = 0;
let standaloneRoot: Root | undefined;
let standaloneContainer: HTMLDivElement | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return entries;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureStandaloneHost() {
  if (typeof document === 'undefined' || standaloneRoot || appHostCount > 0) return;
  standaloneContainer = document.createElement('div');
  standaloneContainer.dataset.atFeedbackHost = '';
  document.body.append(standaloneContainer);
  standaloneRoot = createRoot(standaloneContainer);
  standaloneRoot.render(<FeedbackHost standalone />);
}

function disposeStandaloneHost() {
  if (!standaloneRoot || appHostCount > 0 || entries.length > 0) return;
  const root = standaloneRoot;
  const container = standaloneContainer;
  standaloneRoot = undefined;
  standaloneContainer = undefined;
  root.unmount();
  container?.remove();
}

function remove(id: number, callOnClose = true) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  const timer = timers.get(id);
  if (timer !== undefined && typeof window !== 'undefined') window.clearTimeout(timer);
  timers.delete(id);
  entries = entries.filter((item) => item.id !== id);
  notify();
  try {
    if (callOnClose) entry.onClose?.();
  } finally {
    disposeStandaloneHost();
  }
}

function add(entry: Omit<FeedbackEntry, 'id'>) {
  const id = ++nextId;
  entries = [...entries, { ...entry, id }];
  notify();
  if (entry.duration > 0 && typeof window !== 'undefined') {
    timers.set(id, window.setTimeout(() => remove(id), entry.duration));
  }
  ensureStandaloneHost();
  return { close: () => remove(id) };
}

export interface MessageOptions {
  duration?: number;
  onClose?: () => void;
}

function showMessage(type: MessageType, content: ReactNode, options: MessageOptions = {}) {
  return add({ kind: 'message', type, content, duration: options.duration ?? 4000, placement: 'top-right', onClose: options.onClose });
}

export const message = {
  open(content: ReactNode, options?: MessageOptions) { return showMessage('info', content, options); },
  success(content: ReactNode, options?: MessageOptions) { return showMessage('success', content, options); },
  info(content: ReactNode, options?: MessageOptions) { return showMessage('info', content, options); },
  warning(content: ReactNode, options?: MessageOptions) { return showMessage('warning', content, options); },
  error(content: ReactNode, options?: MessageOptions) { return showMessage('error', content, options); },
  destroy() { entries.filter((entry) => entry.kind === 'message').forEach((entry) => remove(entry.id)); },
};

export interface NotificationOptions {
  title: ReactNode;
  description?: ReactNode;
  type?: MessageType;
  placement?: NotificationPlacement;
  duration?: number;
  onClose?: () => void;
}

export const notification = {
  open(options: NotificationOptions) {
    return add({
      kind: 'notification',
      type: options.type ?? 'info',
      content: options.title,
      title: options.title,
      description: options.description,
      duration: options.duration ?? 4500,
      placement: options.placement ?? 'top-right',
      onClose: options.onClose,
    });
  },
  success(options: Omit<NotificationOptions, 'type'>) { return addNotification({ ...options, type: 'success' }); },
  info(options: Omit<NotificationOptions, 'type'>) { return addNotification({ ...options, type: 'info' }); },
  warning(options: Omit<NotificationOptions, 'type'>) { return addNotification({ ...options, type: 'warning' }); },
  error(options: Omit<NotificationOptions, 'type'>) { return addNotification({ ...options, type: 'error' }); },
  destroy() { entries.filter((entry) => entry.kind === 'notification').forEach((entry) => remove(entry.id)); },
};

function addNotification(options: NotificationOptions) {
  return add({
    kind: 'notification',
    type: options.type ?? 'info',
    content: options.title,
    title: options.title,
    description: options.description,
    duration: options.duration ?? 4500,
    placement: options.placement ?? 'top-right',
    onClose: options.onClose,
  });
}

export function FeedbackHost({ standalone = false }: { standalone?: boolean }) {
  const currentEntries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (standalone) return;
    appHostCount += 1;
    if (standaloneRoot) {
      const root = standaloneRoot;
      const container = standaloneContainer;
      standaloneRoot = undefined;
      standaloneContainer = undefined;
      root.unmount();
      container?.remove();
    }
    return () => {
      appHostCount = Math.max(0, appHostCount - 1);
      if (appHostCount === 0) entries.slice().forEach((entry) => remove(entry.id));
    };
  }, [standalone]);

  const seen = new Map<string, number>();

  return <div className="at-feedback-host" aria-live="polite">
    {currentEntries.map((entry) => {
      const group = entry.kind === 'message' ? 'top' : entry.placement;
      const position = seen.get(group) ?? 0;
      seen.set(group, position + 1);
      const style = entry.kind === 'message'
        ? { top: `${20 + position * 58}px` }
        : entry.placement.startsWith('top')
          ? { top: `${20 + position * 104}px` }
          : { bottom: `${20 + position * 104}px` };
      return entry.kind === 'message'
        ? <div key={entry.id} className={`at-message at-message--${entry.type}`} role={entry.type === 'error' ? 'alert' : 'status'} style={style}>
            <span aria-hidden="true">{entry.type === 'success' ? '✓' : entry.type === 'error' ? '!' : '·'}</span>{entry.content}
            <button type="button" aria-label="关闭提示" onClick={() => remove(entry.id)}>×</button>
          </div>
        : <aside key={entry.id} className={`at-notification at-notification--${entry.placement} at-notification--${entry.type}`} role="status" style={style}>
            <div><strong>{entry.title}</strong>{entry.description && <p>{entry.description}</p>}</div>
            <button type="button" aria-label="关闭通知" onClick={() => remove(entry.id)}>×</button>
          </aside>;
    })}
  </div>;
}