import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Cascader } from '../../src/Cascader';
import { TreeSelect } from '../../src/TreeSelect';
import { Dropdown } from '../../src/Dropdown';
import { Menu } from '../../src/Menu';
import { Calendar } from '../../src/Calendar';
import { Slider } from '../../src/Slider';
import { ColorPicker } from '../../src/ColorPicker';
import { Input } from '../../src/Input';
import { InputNumber } from '../../src/InputNumber';
import { NumberTicker } from '../../src/NumberTicker';
import { TimePicker } from '../../src/TimePicker';
import { Splitter, SplitterPanel } from '../../src/Splitter';
import { Carousel } from '../../src/Carousel';
import { Watermark } from '../../src/Watermark';
import { QRCode } from '../../src/QRCode';
import { FeedbackHost, message, notification } from '../../src/internal/feedback';

describe('selector keyboard and search behavior', () => {
  it('navigates cascader columns and commits a keyboard-selected leaf', () => {
    const change = vi.fn(); render(<Cascader options={[{ label: 'Root', value: 'r', children: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] }]} onChange={change} />);
    const trigger = screen.getByRole('combobox');
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'Enter']) fireEvent.keyDown(trigger, { key });
    expect(change).toHaveBeenCalledWith(['r', 'b'], expect.any(Array)); expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('searches cascader paths, selects a result and clears its value', async () => {
    const change = vi.fn(); render(<Cascader showSearch allowClear options={[{ label: 'Root', value: 'r', children: [{ label: 'Leaf', value: 'l' }] }]} onChange={change} />);
    await userEvent.click(screen.getByRole('combobox')); const input = screen.getByRole('textbox'); fireEvent.change(input, { target: { value: 'Leaf' } });
    fireEvent.keyDown(input, { key: 'Enter' }); expect(change).toHaveBeenCalledWith(['r', 'l'], expect.any(Array));
    await userEvent.click(screen.getByLabelText('清除')); expect(change).toHaveBeenLastCalledWith([], []);
  });
  it('searches and checks tree-select branches, then removes the last selection', async () => {
    const change = vi.fn(); render(<TreeSelect treeCheckable showSearch treeDefaultExpandAll treeData={[{ label: 'Root', value: 'r', children: [{ label: 'Alpha', value: 'a' }, { label: 'Blocked', value: 'b', disabled: true }] }]} onChange={change} />);
    await userEvent.click(screen.getByRole('combobox')); await userEvent.click(screen.getByText('Root')); expect(change).toHaveBeenLastCalledWith(['r', 'a'], expect.any(Array));
    const input = screen.getByRole('textbox'); fireEvent.change(input, { target: { value: 'Alpha' } }); expect(screen.queryByText('Blocked')).toBeNull();
    fireEvent.change(input, { target: { value: '' } }); fireEvent.keyDown(input, { key: 'Backspace' }); expect(change).toHaveBeenLastCalledWith(['r'], expect.any(Array));
  });
  it('navigates and chooses tree-select by keyboard while skipping disabled nodes', () => {
    const change = vi.fn(); render(<TreeSelect treeData={[{ label: 'Root', value: 'r', children: [{ label: 'Leaf', value: 'l' }] }]} onChange={change} />);
    const trigger = screen.getByRole('combobox'); for (const key of ['Enter', 'ArrowRight', 'ArrowRight', 'Enter']) fireEvent.keyDown(trigger, { key });
    expect(change).toHaveBeenCalledWith('l', expect.objectContaining({ value: 'l' }));
  });
  it('uses dropdown keyboard navigation, typeahead and returns focus after selection', async () => {
    const select = vi.fn(); render(<Dropdown items={[{ key: 'group', type: 'group', label: 'Actions', children: [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta', disabled: true }, { key: 'c', label: 'Charlie' }] }, { key: 'divider', type: 'divider' }]} onSelect={select}><button>Open menu</button></Dropdown>);
    const trigger = screen.getByRole('button'); fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const menu = screen.getByRole('menu'); await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    fireEvent.keyDown(menu, { key: 'End' }); fireEvent.keyDown(menu, { key: 'Home' }); fireEvent.keyDown(menu, { key: 'c' }); fireEvent.keyDown(menu, { key: 'Enter' });
    expect(select).toHaveBeenCalledWith('c', expect.anything()); expect(trigger).toHaveFocus();
  });
  it('navigates menu siblings and opens/closes a popup submenu', async () => {
    // jsdom does not calculate offsetParent; model visible menu items explicitly.
    vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function (this: HTMLElement) { return this.parentElement; });
    const select = vi.fn(); render(<Menu mode="vertical" onSelect={select} items={[{ key: 'a', label: 'Alpha' }, { key: 'group', label: 'Group', children: [{ key: 'child', label: 'Child' }] }]} />);
    const alpha = screen.getByRole('menuitem', { name: 'Alpha' }); alpha.focus(); fireEvent.keyDown(alpha, { key: 'ArrowDown' }); expect(screen.getByRole('menuitem', { name: 'Group' })).toHaveFocus();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Group' })); const child = screen.getByRole('menuitem', { name: 'Child' }); await userEvent.click(child); expect(select).toHaveBeenCalledWith('child', expect.objectContaining({ key: 'child' }));
  });
  it('changes time columns by keyboard and supports clear/now shortcuts', async () => {
    const change = vi.fn(); vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 0, 1, 12, 30));
    render(<TimePicker format="HH:mm:ss" defaultValue="10:00:00" minuteStep={30} secondStep={30} onChange={change} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    const minutes = screen.getByRole('listbox', { name: '分' }); fireEvent.keyDown(minutes, { key: 'End' }); expect(change).toHaveBeenLastCalledWith('10:30:00', { hour: 10, minute: 30, second: 0 });
    fireEvent.keyDown(minutes, { key: 'Home' }); fireEvent.keyDown(minutes, { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' }); expect(change).toHaveBeenLastCalledWith(null, null);
    fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('此刻')); expect(change).toHaveBeenLastCalledWith('12:30:00', { hour: 12, minute: 30, second: 0 });
  });
});

describe('pointer and numeric interactions', () => {
  it('updates an uncontrolled input and exposes its clear action', async () => {
    const change = vi.fn(); render(<Input label="Search" clearable onChange={change} />); await userEvent.type(screen.getByLabelText('Search'), 'abc'); expect(screen.getByLabelText('Search')).toHaveValue('abc');
    await userEvent.click(screen.getByLabelText('清空输入')); expect(change.mock.calls.at(-1)?.[0].target.value).toBe(''); expect(screen.getByLabelText('Search')).toHaveValue('');
  });
  it('supports held number-step buttons and cancels repeat timers', () => {
    vi.useFakeTimers(); const change = vi.fn(); const { unmount } = render(<InputNumber defaultValue={1} onChange={change} />);
    const increase = screen.getByLabelText('增加'); fireEvent.pointerDown(increase); expect(change).toHaveBeenLastCalledWith(2);
    act(() => vi.advanceTimersByTime(400)); expect(change).toHaveBeenLastCalledWith(3); act(() => vi.advanceTimersByTime(340)); expect(change).toHaveBeenLastCalledWith(4); fireEvent.pointerUp(increase); unmount(); expect(vi.getTimerCount()).toBe(0);
  });
  it('updates slider from pointer coordinates and emits completion on release', () => {
    const change = vi.fn(); const complete = vi.fn(); const { container } = render(<Slider onChange={change} onChangeComplete={complete} />);
    const rail = container.querySelector<HTMLElement>('.at-slider__rail')!; vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 20));
    fireEvent.pointerDown(rail, { button: 0, clientX: 100 }); expect(change).toHaveBeenLastCalledWith(50);
    fireEvent.pointerMove(window, { clientX: 150 }); expect(change).toHaveBeenLastCalledWith(75); fireEvent.pointerUp(window); expect(complete).toHaveBeenLastCalledWith(75);
  });
  it('changes color using sliders and text input, reverting invalid text', async () => {
    const change = vi.fn(); render(<ColorPicker defaultValue="#ff0000" onChange={change} showAlpha />); await userEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('slider', { name: '色相' }), { key: 'ArrowRight' }); expect(change).toHaveBeenCalled();
    const input = screen.getByLabelText('颜色值'); fireEvent.change(input, { target: { value: '#00ff00' } }); fireEvent.blur(input); expect(change).toHaveBeenLastCalledWith('#00ff00', expect.anything());
    fireEvent.change(input, { target: { value: 'invalid' } }); fireEvent.blur(input); expect(input).toHaveValue('#00ff00');
  });
  it('animates a number ticker to the endpoint and cancels frames on unmount', () => {
    vi.useFakeTimers(); const { container, unmount } = render(<NumberTicker value={100} duration={100} delay={20} />); expect(container).toHaveTextContent('0');
    act(() => vi.advanceTimersByTime(200)); expect(container).toHaveTextContent('100'); unmount(); expect(vi.getTimerCount()).toBe(0);
  });
  it('drags and collapses splitter panels then restores their size', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 200)); const resize = vi.fn();
    render(<Splitter onResize={resize}><SplitterPanel collapsible>Left</SplitterPanel><SplitterPanel>Right</SplitterPanel></Splitter>);
    const bar = screen.getByRole('separator'); fireEvent.pointerDown(bar, { button: 0, clientX: 300 }); fireEvent.pointerMove(window, { clientX: 350 }); fireEvent.pointerUp(window, { clientX: 350 }); expect(resize).toHaveBeenLastCalledWith([346, 246]);
    await userEvent.click(screen.getByLabelText('收起左侧面板')); expect(resize).toHaveBeenLastCalledWith([0, 592]); await userEvent.click(screen.getByLabelText('展开面板')); expect(resize).toHaveBeenLastCalledWith([346, 246]);
  });
  it('navigates carousel by keyboard and swiping', () => {
    const change = vi.fn(); const { container } = render(<Carousel items={['A', 'B']} onChange={change} />);
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' }); expect(change).toHaveBeenLastCalledWith(1);
    const viewport = container.querySelector<HTMLElement>('.at-carousel__viewport')!; Object.defineProperty(viewport, 'offsetWidth', { value: 200 });
    fireEvent.pointerDown(viewport, { button: 0, clientX: 150 }); fireEvent.pointerMove(viewport, { clientX: 0 }); fireEvent.pointerUp(viewport); expect(change).toHaveBeenLastCalledWith(0);
  });
  it('moves calendar focus across date/month boundaries and selects by keyboard', () => {
    const change = vi.fn(); render(<Calendar defaultValue={new Date(2026, 9, 31)} onChange={change} />);
    let grid = screen.getByRole('grid'); fireEvent.keyDown(grid, { key: 'ArrowRight' }); expect(screen.getByRole('gridcell', { name: '2026年11月1日' })).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'Enter' }); expect(change).toHaveBeenCalledWith(new Date(2026, 10, 1));
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'Home', 'End', 'PageUp', 'PageDown']) fireEvent.keyDown(grid, { key });
    fireEvent.click(screen.getByRole('radio', { name: '年' })); grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' }); fireEvent.keyDown(grid, { key: 'Enter' }); expect(screen.getByRole('radio', { name: '月' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('canvas and imperative feedback', () => {
  it('draws watermark text and QR modules into a canvas', async () => {
    const context = { scale: vi.fn(), translate: vi.fn(), rotate: vi.fn(), measureText: vi.fn(() => ({ width: 80 })), fillText: vi.fn(), fillRect: vi.fn() };
    // Only the browser canvas boundary is replaced; component drawing logic still executes.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AA==');
    const { container } = render(<><Watermark content={['Private', 'Document']}><span>Content</span></Watermark><QRCode value="hello" type="canvas" /></>);
    await act(async () => {}); expect(context.fillText).toHaveBeenCalledWith('Private', 0, -12); expect(context.fillRect).toHaveBeenCalled(); expect(container.querySelector('.at-watermark__mark')?.getAttribute('style')).toContain('data:image/png;base64,AA==');
  });
  it('auto-closes all imperative message variants and supports persistent notification handles', () => {
    vi.useFakeTimers(); render(<FeedbackHost />); const close = vi.fn();
    act(() => { message.open('Open', { duration: 100, onClose: close }); message.info('Info'); message.warning('Warning'); message.error('Error'); });
    expect(screen.getByRole('alert')).toHaveTextContent('Error'); act(() => vi.advanceTimersByTime(100)); expect(close).toHaveBeenCalledOnce(); act(() => message.destroy()); expect(screen.queryByText('Info')).toBeNull();
    let handle = { close: () => {} }; act(() => { handle = notification.success({ title: 'Success', duration: 0 }); notification.warning({ title: 'Warning' }); notification.error({ title: 'Failure' }); notification.open({ title: 'Open' }); });
    expect(screen.getByText('Success')).toBeInTheDocument(); act(() => handle.close()); expect(screen.queryByText('Success')).toBeNull(); act(() => notification.destroy());
  });
  it('supports standalone feedback hosts and disposes the host on close', () => {
    let handle = { close: () => {} }; act(() => { handle = message.success('Standalone', { duration: 0 }); }); expect(screen.getByText('Standalone')).toBeInTheDocument();
    act(() => handle.close()); expect(document.querySelector('[data-at-feedback-host]')).toBeNull();
  });
});
