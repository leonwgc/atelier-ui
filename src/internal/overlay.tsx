import { useCallback, useEffect, useId, useRef, type CSSProperties, type MouseEvent } from 'react';
import '../styles/theme.css';
import { useControllableState } from '../utils';
import { useDismiss, useFloatingPanel, type PopupPlacement } from './floating';

export type OverlayTrigger = 'click' | 'hover' | 'focus' | 'contextMenu';

export interface OverlayProps {
  trigger?: OverlayTrigger | OverlayTrigger[];
  placement?: PopupPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  disabled?: boolean;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
}

interface UseOverlayOptions extends OverlayProps {
  gap?: number;
  matchWidth?: boolean;
  /** Keep the overlay open when the pointer moves onto it (hover trigger). */
  interactive?: boolean;
}

/** Shared open-state, trigger-binding and positioning logic for Popover, Popconfirm and Dropdown. */
export function useOverlay({ trigger = 'click', placement = 'bottom', open: openProp, defaultOpen = false, onOpenChange, mouseEnterDelay = 80, mouseLeaveDelay = 120, disabled = false, gap, matchWidth }: UseOverlayOptions) {
  const id = useId();
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange);
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const isOpen = open && !disabled;
  const { anchorRef, panelRef, position } = useFloatingPanel<HTMLElement, HTMLDivElement>(isOpen, placement, { gap, matchWidth });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const setOpen = useCallback((next: boolean, delay = 0) => {
    clear();
    if (delay > 0) timer.current = setTimeout(() => setOpenState(next), delay);
    else setOpenState(next);
  }, [setOpenState]);
  useEffect(() => clear, []);
  useDismiss(isOpen, [anchorRef, panelRef], () => setOpen(false));

  const has = (name: OverlayTrigger) => triggers.includes(name);
  const triggerProps = {
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? id : undefined,
    onClick: has('click') ? () => { if (!disabled) setOpen(!open); } : undefined,
    onContextMenu: has('contextMenu') ? (event: MouseEvent) => { if (disabled) return; event.preventDefault(); setOpen(true); } : undefined,
    onMouseEnter: has('hover') ? () => { if (!disabled) setOpen(true, mouseEnterDelay); } : undefined,
    onMouseLeave: has('hover') ? () => setOpen(false, mouseLeaveDelay) : undefined,
    onFocus: has('focus') || has('hover') ? () => { if (!disabled) setOpen(true); } : undefined,
    onBlur: has('focus') || has('hover') ? () => setOpen(false, mouseLeaveDelay) : undefined,
  };
  const panelHoverProps = has('hover') ? { onMouseEnter: () => clear(), onMouseLeave: () => setOpen(false, mouseLeaveDelay) } : {};

  return { id, open: isOpen, setOpen, anchorRef, panelRef, position, placement, triggerProps, panelHoverProps };
}
