import { Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
import { assignRef, cx } from '../utils';

const NATIVE_INTERACTIVE = new Set(['button', 'a', 'input', 'textarea', 'select', 'summary']);

type TriggerHandlers = Pick<HTMLAttributes<HTMLElement>, 'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onContextMenu'> & Record<`aria-${string}`, string | boolean | undefined> & { id?: string; className?: string };

function chain<E>(...handlers: Array<((event: E) => void) | undefined>) {
  return (event: E) => handlers.forEach((handler) => handler?.(event));
}

/**
 * Attach trigger props to the child. Native interactive elements and custom components are cloned in place;
 * plain inline content is wrapped in a focusable span so the trigger stays keyboard reachable.
 */
export function renderTrigger(children: ReactNode, props: TriggerHandlers, ref: Ref<HTMLElement>, wrapperClassName: string) {
  const only = Children.count(children) === 1 ? Children.only(children) : null;
  const canClone = isValidElement(only) && (typeof only.type !== 'string' || NATIVE_INTERACTIVE.has(only.type));
  if (!canClone) {
    return <span ref={ref as Ref<HTMLSpanElement>} {...props} className={cx(wrapperClassName, props.className)} role="button" tabIndex={0}>{children}</span>;
  }
  const element = only as ReactElement<Record<string, unknown>> & { ref?: Ref<HTMLElement> };
  const childProps = element.props;
  const merged: Record<string, unknown> = { ...props };
  (['onClick', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur', 'onKeyDown', 'onContextMenu'] as const).forEach((name) => {
    if (props[name] || childProps[name]) merged[name] = chain(childProps[name] as (event: unknown) => void, props[name] as (event: unknown) => void);
  });
  merged.className = cx(childProps.className as string | undefined, props.className) || undefined;
  merged.ref = (node: HTMLElement | null) => { assignRef(ref, node); assignRef(element.ref, node); };
  return cloneElement(element, merged);
}
