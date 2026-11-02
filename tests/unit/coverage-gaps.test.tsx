import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from '../../src/ColorPicker';
import { List } from '../../src/List';
import { Rate } from '../../src/Rate';

describe('Rate hover', () => {
  it('reports hover changes and shows the tooltip caption', () => {
    const hover = vi.fn();
    const { container } = render(<Rate tooltips={['bad', 'ok', 'good']} count={3} onHoverChange={hover} />);
    const star = container.querySelectorAll('.at-rate__star')[1];
    fireEvent.pointerMove(star);
    expect(hover).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('ok')).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByRole('slider'));
    expect(hover).toHaveBeenLastCalledWith(null);
  });

  it('ignores hover and pointer input while disabled', () => {
    const hover = vi.fn(); const change = vi.fn();
    const { container } = render(<Rate disabled onHoverChange={hover} onChange={change} />);
    const star = container.querySelectorAll('.at-rate__star')[0];
    fireEvent.pointerMove(star); fireEvent.pointerDown(star);
    expect(hover).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });
});

describe('ColorPicker slider keyboard', () => {
  it('adjusts saturation/brightness, hue and alpha with arrow keys', async () => {
    const change = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" showAlpha onChange={change} />);
    await userEvent.click(screen.getByRole('button'));
    const [area, hue, alpha] = screen.getAllByRole('slider');
    for (const slider of [area, hue, alpha]) {
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) fireEvent.keyDown(slider, { key });
      fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true });
    }
    expect(change).toHaveBeenCalled();
    const before = change.mock.calls.length;
    fireEvent.keyDown(hue, { key: 'a' });
    expect(change.mock.calls.length).toBe(before);
  });
});

describe('List', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('picks the grid column count from the measured width', () => {
    let notify: (width: number) => void = () => {};
    class MockObserver {
      constructor(callback: ResizeObserverCallback) { notify = (width) => callback([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver); }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', MockObserver);
    const { container } = render(<List grid={{ column: 4, xs: 1, sm: 2, md: 3 }} dataSource={['a', 'b']} renderItem={(item) => <List.Item>{item}</List.Item>} />);
    const items = () => container.querySelector('.at-list__items') as HTMLElement;
    for (const [width, columns] of [[400, 1], [600, 2], [800, 3], [1200, 3]] as const) {
      act(() => notify(width));
      expect(items().style.gridTemplateColumns).toContain(`repeat(${columns},`);
    }
  });

  it('calls onEndReached when scrolled near the bottom', () => {
    const reached = vi.fn();
    const { container } = render(<List height={100} onEndReached={reached} dataSource={['a']} renderItem={(item) => <List.Item>{item}</List.Item>} />);
    const body = container.querySelector('.at-list__body') as HTMLElement;
    Object.defineProperties(body, { scrollHeight: { value: 500 }, clientHeight: { value: 100 }, scrollTop: { value: 390, configurable: true } });
    fireEvent.scroll(body); expect(reached).toHaveBeenCalledTimes(1);
  });

  it('resolves keys from a field name or function', () => {
    const { container } = render(<List rowKey="id" dataSource={[{ id: 'x' }, { id: 'y' }]} renderItem={(item) => <List.Item>{item.id}</List.Item>} />);
    expect(container.querySelectorAll('li.at-list__cell')).toHaveLength(2);
  });
});
