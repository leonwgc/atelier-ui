import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { assignRef, clamp, cx, getPathValue, isReactNode, setPathValue, useControllableState } from '../../src/utils';
import { positionForRects, type PopupPlacement } from '../../src/internal/floating';
import { parseTime, formatTime } from '../../src/TimePicker';
import { parseColor, rgbToHsv, hsvToRgb, toHex } from '../../src/ColorPicker';
import { formatCountdown, formatStatistic } from '../../src/Statistic';

describe('shared utilities', () => {
  it('joins only defined classes and clamps both boundaries', () => {
    expect(cx('a', false, undefined, '', null, 'b')).toBe('a b');
    expect([clamp(-1, 0, 10), clamp(5, 0, 10), clamp(11, 0, 10)]).toEqual([0, 5, 10]);
  });
  it('reads nested arrays and missing paths, and updates without mutating siblings', () => {
    const source = { people: [{ name: 'Ada' }], stable: { value: 1 } };
    const next = setPathValue(source, 'people.0.name', 'Grace');
    expect(getPathValue(next, 'people.0.name')).toBe('Grace');
    expect(source.people[0].name).toBe('Ada');
    expect(next.stable).toBe(source.stable);
    expect(getPathValue(source, 'missing.deep')).toBeUndefined();
    expect(setPathValue({}, 'profile.name', 'Ada')).toEqual({ profile: { name: 'Ada' } });
  });
  it('assigns object and callback refs including null', () => {
    const ref = createRef<string>(); const callback = vi.fn();
    assignRef(ref, 'value'); expect(ref.current).toBe('value');
    assignRef(callback, null); expect(callback).toHaveBeenCalledWith(null);
    assignRef(undefined, null);
    expect([null, undefined, '', 0].every(isReactNode)).toBe(true);
    expect(isReactNode({})).toBe(false);
  });
  it('updates uncontrolled state, deduplicates callbacks, and uses the latest handler', () => {
    const first = vi.fn(); const second = vi.fn();
    const { result, rerender } = renderHook(({ handler }) => useControllableState<number>(undefined, 1, handler), { initialProps: { handler: first } });
    act(() => result.current[1](1)); expect(first).not.toHaveBeenCalled();
    act(() => result.current[1]((n) => n + 1)); expect(result.current[0]).toBe(2);
    rerender({ handler: second });
    act(() => result.current[1](3)); expect(second).toHaveBeenCalledWith(3);
  });
  it('requests controlled changes without replacing the supplied value', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState(value, 0, onChange), { initialProps: { value: 1 } });
    act(() => result.current[1](2)); expect(result.current[0]).toBe(1);
    expect(onChange).toHaveBeenCalledWith(2); rerender({ value: 2 }); expect(result.current[0]).toBe(2);
  });
});

describe('floating placement', () => {
  const anchor = { top: 100, left: 100, width: 40, height: 20, right: 140, bottom: 120 };
  const panel = { top: 0, left: 0, width: 60, height: 30, right: 60, bottom: 30 };
  it.each<[PopupPlacement, number, number]>([
    ['top', 64, 90], ['bottom', 126, 90], ['left', 95, 34], ['right', 95, 146],
    ['bottom-start', 126, 100], ['bottom-end', 126, 80], ['right-start', 100, 146], ['left-end', 90, 34],
  ])('positions %s', (placement, top, left) => expect(positionForRects(anchor, panel, placement)).toEqual({ placement, top, left }));
  it('flips when space is unavailable and clamps to viewport edges', () => {
    expect(positionForRects({ ...anchor, top: 1, bottom: 21 }, panel, 'top').placement).toBe('bottom');
    expect(positionForRects({ ...anchor, left: 0, right: 40 }, panel, 'bottom').left).toBe(12);
  });
});

describe('formatters and parsers', () => {
  it.each(['', '24:00', '12:60', '12:00:60', 'nonsense'])('rejects invalid time %s', (value) => expect(parseTime(value)).toBeNull());
  it('parses and formats time with optional seconds', () => {
    expect(parseTime(' 1:2:3 ')).toEqual({ hour: 1, minute: 2, second: 3 });
    expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59, second: 0 });
    expect(formatTime({ hour: 1, minute: 2, second: 3 })).toBe('01:02');
    expect(formatTime({ hour: 1, minute: 2, second: 3 }, 'HH:mm:ss')).toBe('01:02:03');
  });
  it.each(['#f00', '#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)'])('parses color %s', (value) => expect(parseColor(value)).toEqual({ r: 255, g: 0, b: 0, a: 1 }));
  it('handles alpha, invalid colors and RGB/HSV round trips', () => {
    expect(parseColor('#0008')?.a).toBeCloseTo(136 / 255);
    expect(parseColor('rgba(1, 2, 3, 50%)')?.a).toBe(.5);
    expect(parseColor('bad-color')).toBeNull();
    for (const rgb of [{ r: 255, g: 0, b: 0, a: .5 }, { r: 0, g: 255, b: 0, a: 1 }, { r: 0, g: 0, b: 255, a: 1 }, { r: 0, g: 0, b: 0, a: 1 }, { r: 80, g: 80, b: 80, a: 1 }]) expect(hsvToRgb(rgbToHsv(rgb))).toEqual(rgb);
    expect(toHex({ r: 255, g: 0, b: 0, a: .5 })).toBe('#ff000080');
  });
  it('formats grouped negative numbers and countdown tokens', () => {
    expect(formatStatistic(-12345.67, { precision: 1, groupSeparator: ' ', decimalSeparator: ',' })).toEqual({ integer: '-12 345', decimal: ',7' });
    expect(formatStatistic('unknown', {})).toEqual({ integer: 'unknown', decimal: '' });
    expect(formatCountdown(-1)).toBe('00:00:00');
    expect(formatCountdown(90061005, 'D HH:mm:ss.SSS')).toBe('1 01:01:01.005');
    expect(formatCountdown(3600000, 'mm:ss')).toBe('60:00');
  });
});
