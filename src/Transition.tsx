import './styles/theme.css';
import './styles/transition.css';
import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';

export type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';
export type TransitionAnimation = 'fade' | 'slide-up' | 'collapse' | 'none';
export type TransitionClassNames = string | Partial<Record<TransitionStatus, string>>;

export interface TransitionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  in?: boolean;
  timeout?: number;
  appear?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  animation?: TransitionAnimation;
  classNames?: TransitionClassNames;
  exit?: ReactNode;
  onEnter?: (node: HTMLDivElement) => void;
  onEntered?: (node: HTMLDivElement) => void;
  onExit?: (node: HTMLDivElement) => void;
  onExited?: (node: HTMLDivElement) => void;
  childrenClassName?: string;
}

function resolveClassNames(classNames: TransitionClassNames | undefined, status: TransitionStatus) {
  if (typeof classNames === 'string') return classNames ? `${classNames}-${status}` : '';
  return classNames?.[status] ?? '';
}

export function Transition({
  children,
  in: isIn = true,
  timeout = 200,
  appear = false,
  mountOnEnter = true,
  unmountOnExit = true,
  animation = 'fade',
  classNames,
  exit,
  onEnter,
  onEntered,
  onExit,
  onExited,
  childrenClassName = '',
  className = '',
  style,
  ...props
}: TransitionProps) {
  const [status, setStatus] = useState<TransitionStatus>(() => isIn ? (appear ? 'entering' : 'entered') : 'exited');
  const [mounted, setMounted] = useState(() => isIn || !mountOnEnter);
  const nodeRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const firstEffectRef = useRef(true);
  const hasEnteredRef = useRef(isIn);
  const callbacksRef = useRef({ onEnter, onEntered, onExit, onExited });
  callbacksRef.current = { onEnter, onEntered, onExit, onExited };

  useEffect(() => () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
  }, []);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const start = (entering: boolean) => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
      if (entering) {
        setMounted(true);
        hasEnteredRef.current = true;
      }
      const nextStatus: TransitionStatus = entering ? 'entering' : 'exiting';
      const settledStatus: TransitionStatus = entering ? 'entered' : 'exited';
      setStatus(nextStatus);
      if (node) (entering ? callbacksRef.current.onEnter : callbacksRef.current.onExit)?.(node);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      timerRef.current = window.setTimeout(() => {
        setStatus(settledStatus);
        const currentNode = nodeRef.current;
        if (currentNode) (entering ? callbacksRef.current.onEntered : callbacksRef.current.onExited)?.(currentNode);
      }, reducedMotion ? 0 : Math.max(0, timeout));
    };

    if (firstEffectRef.current) {
      firstEffectRef.current = false;
      if (isIn && appear) start(true);
      return;
    }
    start(isIn);
  }, [appear, isIn, timeout]);

  const isExitSnapshot = !isIn && hasEnteredRef.current && exit !== undefined;
  useLayoutEffect(() => {
    if (nodeRef.current) nodeRef.current.inert = isExitSnapshot;
  }, [isExitSnapshot]);

  const shouldRender = mounted && !(status === 'exited' && unmountOnExit);
  if (!shouldRender) return null;

  const content = isExitSnapshot ? exit : children;
  const transitionStyle = {
    '--at-transition-duration': `${Math.max(0, timeout)}ms`,
    ...style,
  } as CSSProperties;
  const customClassName = resolveClassNames(classNames, status);
  return (
    <div
      {...props}
      ref={nodeRef}
      className={`at-transition at-transition--${animation} at-transition--${status} ${className} ${customClassName}`}
      style={transitionStyle}
      aria-hidden={isExitSnapshot || status === 'exited' ? true : undefined}
    >
      <div className={`at-transition__content ${childrenClassName}`}>{content}</div>
    </div>
  );
}

type TransitionElement = ReactElement<TransitionProps>;

function isTransitionElement(node: ReactNode): node is TransitionElement {
  return isValidElement<TransitionProps>(node) && node.type === Transition;
}

export interface TransitionGroupProps {
  children: ReactNode;
  className?: string;
}

export function TransitionGroup({ children, className = '' }: TransitionGroupProps) {
  const childNodes = Children.toArray(children);
  const currentTransitions = childNodes.filter(isTransitionElement);
  const currentByKey = new Map(currentTransitions.map((child) => [String(child.key), child]));
  const previousByKeyRef = useRef(new Map<string, TransitionElement>());
  const [exiting, setExiting] = useState(() => new Map<string, TransitionElement>());

  const removed = [...previousByKeyRef.current].filter(([key]) => !currentByKey.has(key) && !exiting.has(key));
  if (removed.length > 0) {
    setExiting((current) => new Map([...current, ...removed]));
  }
  const reentered = [...exiting.keys()].filter((key) => currentByKey.has(key));
  if (reentered.length > 0) {
    setExiting((current) => new Map([...current].filter(([key]) => !currentByKey.has(key))));
  }

  useLayoutEffect(() => {
    previousByKeyRef.current = currentByKey;
  });

  const renderedCurrent = childNodes.map((child) => {
    if (!isTransitionElement(child)) return child;
    const key = String(child.key);
    return cloneElement(child, {
      in: true,
      appear: child.props.appear ?? true,
      onExited: (node) => child.props.onExited?.(node),
      key,
    });
  });

  const renderedExiting = [...exiting].map(([key, child]) => cloneElement(child, {
    in: false,
    appear: child.props.appear ?? true,
    onExited: (node) => {
      child.props.onExited?.(node);
      setExiting((current) => {
        if (!current.has(key)) return current;
        const next = new Map(current);
        next.delete(key);
        return next;
      });
    },
    key,
  }));

  return <div className={`at-transition-group ${className}`}>{[...renderedCurrent, ...renderedExiting]}</div>;
}