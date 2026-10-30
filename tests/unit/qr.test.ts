import { describe, expect, it } from 'vitest';
import { encodeQR, type QRErrorLevel } from '../../src/internal/qr';

describe('QR byte encoder', () => {
  it.each<QRErrorLevel>(['L', 'M', 'Q', 'H'])('encodes a square boolean matrix for error level %s with three finder patterns', (level) => {
    const qr = encodeQR('Hello', level);
    expect(qr.version).toBe(1); expect(qr.size).toBe(21); expect(qr.modules).toHaveLength(21);
    expect(qr.modules.every((row) => row.length === 21 && row.every((value) => typeof value === 'boolean'))).toBe(true);
    const finder = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111'];
    for (const [x, y] of [[0, 0], [14, 0], [0, 14]]) expect(qr.modules.slice(y, y + 7).map((row) => row.slice(x, x + 7).map(Number).join(''))).toEqual(finder);
  });
  it('supports Unicode, empty values, larger versions and deterministic masks', () => {
    expect(encodeQR('你好 🌏').size).toBeGreaterThanOrEqual(21);
    expect(encodeQR('').version).toBe(1);
    const qr = encodeQR('a'.repeat(300), 'H'); expect(qr.version).toBeGreaterThan(6); expect(qr.size).toBe(17 + qr.version * 4);
    expect(encodeQR('hello', 'M', 1, 40, 0)).toEqual(encodeQR('hello', 'M', 1, 40, 0));
    expect(encodeQR('hello', 'M', 1, 40, 0).modules).not.toEqual(encodeQR('hello', 'M', 1, 40, 1).modules);
  });
  it('rejects data that does not fit the allowed version range', () => {
    expect(() => encodeQR('x'.repeat(5000))).toThrow();
    expect(() => encodeQR('x'.repeat(100), 'H', 1, 1)).toThrow();
  });
});
