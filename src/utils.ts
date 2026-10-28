import { useCallback, useRef, useState, type ReactNode, type Ref } from 'react';

export type Size = 'sm' | 'md' | 'lg';
export type Status = 'error' | 'warning';

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Controlled/uncontrolled state pair; `onChange` only fires on user-driven updates. */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;
  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const setValue = useCallback((next: T | ((previous: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(currentRef.current) : next;
    if (Object.is(resolved, currentRef.current)) return;
    if (!isControlled) setInternal(resolved);
    onChangeRef.current?.(resolved);
  }, [isControlled]);
  return [current, setValue] as const;
}

export function getPathValue<T = unknown>(source: unknown, path: string): T | undefined {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value == null) return undefined;
    const index = /^\d+$/.test(key) ? Number(key) : key;
    return (value as Record<string | number, unknown>)[index];
  }, source) as T | undefined;
}

export function setPathValue(source: Record<string, unknown>, path: string, nextValue: unknown) {
  const keys = path.split('.');
  const root = (Array.isArray(source) ? [...source] : { ...source }) as unknown as Record<string | number, unknown>;
  let target: Record<string | number, unknown> = root;
  let current: Record<string | number, unknown> = source;

  keys.forEach((key, index) => {
    const part: string | number = /^\d+$/.test(key) ? Number(key) : key;
    if (index === keys.length - 1) {
      target[part] = nextValue;
      return;
    }
    const currentChild = current?.[part];
    const clone = Array.isArray(currentChild)
      ? [...currentChild]
      : { ...((currentChild as Record<string, unknown> | undefined) ?? {}) };
    target[part] = clone;
    target = clone as unknown as Record<string | number, unknown>;
    current = (currentChild as Record<string | number, unknown> | undefined) ?? {};
  });
  return root;
}

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as unknown as { current: T | null }).current = value;
}

export function isReactNode(value: unknown): value is ReactNode {
  return value == null || typeof value === 'string' || typeof value === 'number';
}
