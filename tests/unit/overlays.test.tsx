import { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../../src/Modal';
import { Drawer } from '../../src/Drawer';
import { Popover } from '../../src/Popover';
import { Popconfirm } from '../../src/Popconfirm';
import { Dropdown } from '../../src/Dropdown';
import { Tooltip } from '../../src/Tooltip';
import { Tour } from '../../src/Tour';
import { Message, message } from '../../src/Message';
import { Notification, notification } from '../../src/Notification';
import { FeedbackHost } from '../../src/internal/feedback';

for (const Component of [Modal, Drawer]) {
  describe(Component === Modal ? 'Modal' : 'Drawer', () => {
    it('renders a named portal, locks scrolling and restores it on close', () => {
      document.body.style.overflow = 'auto';
      const { rerender, container } = render(<Component open title="Details" onClose={vi.fn()}>Content</Component>);
      expect(screen.getByRole('dialog', { name: 'Details' })).toHaveTextContent('Content'); expect(container).toBeEmptyDOMElement();
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<Component open={false} onClose={vi.fn()} />); expect(screen.queryByRole('dialog')).toBeNull(); expect(document.body.style.overflow).toBe('auto'); document.body.style.overflow = '';
    });
    it('requests close on Escape and backdrop but ignores panel clicks', () => {
      const close = vi.fn(); render(<Component open title="Details" onClose={close} />);
      const dialog = screen.getByRole('dialog'); fireEvent.mouseDown(dialog); expect(close).not.toHaveBeenCalled();
      fireEvent.keyDown(document, { key: 'Escape' }); fireEvent.mouseDown(dialog.parentElement!); expect(close).toHaveBeenCalledTimes(2);
    });
    it('respects dismissal options and traps Tab at the panel edges', async () => {
      const close = vi.fn(); render(<Component open title="Details" onClose={close} closeOnEscape={false} maskClosable={false}><button>Last action</button></Component>);
      const dialog = screen.getByRole('dialog'); fireEvent.keyDown(document, { key: 'Escape' }); fireEvent.mouseDown(dialog.parentElement!); expect(close).not.toHaveBeenCalled();
      const buttons = dialog.querySelectorAll('button'); const first = buttons[0]; const last = buttons[buttons.length - 1];
      last.focus(); await userEvent.tab(); expect(first).toHaveFocus(); await userEvent.tab({ shift: true }); expect(last).toHaveFocus();
    });
  });
}

describe('Modal actions', () => {
  it('forwards refs and invokes confirmation; supports hidden footer', async () => {
    const ok = vi.fn(); const ref = createRef<HTMLDivElement>(); const { rerender } = render(<Modal ref={ref} open title="Confirm" onClose={vi.fn()} onOk={ok} />);
    expect(ref.current).toBe(screen.getByRole('dialog')); await userEvent.click(screen.getByText('确定')); expect(ok).toHaveBeenCalledOnce();
    rerender(<Modal open onClose={vi.fn()} footer={null} />); expect(screen.queryByText('确定')).toBeNull();
  });
  it('cleans up imperative confirm dialogs after successful confirmation', async () => {
    const ok = vi.fn(); act(() => { Modal.confirm({ title: 'Remove?', content: 'Confirm removal', onOk: ok }); });
    await userEvent.click(screen.getByText('确定')); await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull()); expect(ok).toHaveBeenCalledOnce();
  });
});

describe('Popover and overlay triggers', () => {
  it('chains child click handlers and refs, dismisses outside and on Escape', async () => {
    const click = vi.fn(); const ref = createRef<HTMLButtonElement>(); render(<Popover content="Panel" title="Details"><button ref={ref} onClick={click}>Open</button></Popover>);
    await userEvent.click(screen.getByRole('button', { name: 'Open' })); expect(click).toHaveBeenCalledOnce(); expect(ref.current).toBe(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveTextContent('Panel'); fireEvent.pointerDown(document.body); expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button')); fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('honors hover delays and cancels timers when unmounted', () => {
    vi.useFakeTimers(); const change = vi.fn(); const { unmount } = render(<Popover trigger="hover" mouseEnterDelay={50} mouseLeaveDelay={100} onOpenChange={change} content="Panel"><span>Hover</span></Popover>);
    const trigger = screen.getByRole('button'); fireEvent.mouseEnter(trigger); act(() => vi.advanceTimersByTime(49)); expect(screen.queryByRole('dialog')).toBeNull();
    act(() => vi.advanceTimersByTime(1)); expect(screen.getByRole('dialog')).toBeInTheDocument(); fireEvent.mouseLeave(trigger); unmount(); act(() => vi.runOnlyPendingTimers()); expect(change).toHaveBeenCalledTimes(1);
  });
  it('supports context-menu activation and disabled state', () => {
    const { rerender } = render(<Popover trigger="contextMenu" content="Panel"><button>Open</button></Popover>);
    fireEvent.contextMenu(screen.getByRole('button')); expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<Popover disabled content="Panel"><button>Open</button></Popover>); expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('popup components', () => {
  it('keeps a failed Popconfirm open with an error, then retries successfully', async () => {
    const confirm = vi.fn().mockRejectedValueOnce(new Error('Failed')).mockResolvedValueOnce(undefined);
    render(<Popconfirm title="Remove?" onConfirm={confirm}><button>Remove</button></Popconfirm>);
    await userEvent.click(screen.getByText('Remove')); await userEvent.click(screen.getByText('确定'));
    expect(await screen.findByRole('alert')).toHaveTextContent('操作失败，请重试。'); expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await userEvent.click(screen.getByText('确定')); await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull()); expect(confirm).toHaveBeenCalledTimes(2);
  });
  it('selects dropdown items, calls item handlers and closes', async () => {
    const select = vi.fn(); const click = vi.fn(); render(<Dropdown items={[{ key: 'a', label: 'Action', onClick: click }, { key: 'b', label: 'Blocked', disabled: true }]} onSelect={select}><button>Menu</button></Dropdown>);
    await userEvent.click(screen.getByText('Menu')); await userEvent.click(screen.getByRole('menuitem', { name: 'Blocked' })); expect(select).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Action' })); expect(select).toHaveBeenCalledWith('a', expect.objectContaining({ key: 'a' })); expect(click).toHaveBeenCalledOnce(); expect(screen.queryByRole('menu')).toBeNull();
  });
  it('shows tooltip on focus and removes it on blur', () => {
    const { container } = render(<Tooltip title="Helpful">Target</Tooltip>);
    const trigger = container.querySelector<HTMLElement>('[tabindex]')!; fireEvent.focus(trigger); const tooltip = screen.getByRole('tooltip'); expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    fireEvent.blur(trigger); expect(screen.queryByRole('tooltip')).toBeNull();
  });
  it('navigates tour steps and reports completion', async () => {
    const finish = vi.fn(); const close = vi.fn(); render(<Tour open steps={[{ title: 'First' }, { title: 'Second' }]} onFinish={finish} onClose={close} />);
    await userEvent.click(screen.getByText('下一步')); expect(screen.getByRole('dialog', { name: 'Second' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('上一步')); expect(screen.getByRole('dialog', { name: 'First' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('下一步')); await userEvent.click(screen.getByText('完成')); expect(finish).toHaveBeenCalledOnce(); expect(close).toHaveBeenCalledWith(1);
  });
});

describe('feedback', () => {
  it('auto-dismisses Message exactly once and cancels its timeout on unmount', () => {
    vi.useFakeTimers(); const close = vi.fn(); const { unmount } = render(<Message content="Saved" duration={100} onClose={close} />);
    act(() => vi.advanceTimersByTime(100)); expect(screen.queryByRole('status')).toBeNull(); expect(close).toHaveBeenCalledOnce(); unmount(); act(() => vi.runOnlyPendingTimers()); expect(close).toHaveBeenCalledOnce();
  });
  it('supports persistent messages and notification close callbacks', async () => {
    const close = vi.fn(); render(<><Message type="error" duration={0} content="Failed" onClose={close} /><Notification title="News" description="Details" onClose={close} /></>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed'); await userEvent.click(screen.getByLabelText('关闭提示')); await userEvent.click(screen.getByLabelText('关闭通知')); expect(close).toHaveBeenCalledTimes(2);
  });
  it('hosts imperative feedback and removes it through returned handles', () => {
    render(<FeedbackHost />); let remove: () => void = () => undefined;
    act(() => { remove = message.success('Saved').close; notification.info({ title: 'News', description: 'Details', duration: 0 }); });
    expect(screen.getByText('Saved')).toBeInTheDocument(); expect(screen.getByText('News')).toBeInTheDocument();
    act(() => remove()); expect(screen.queryByText('Saved')).toBeNull(); act(() => notification.destroy()); expect(screen.queryByText('News')).toBeNull();
  });
});
