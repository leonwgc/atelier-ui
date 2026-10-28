/*
 * Minimal QR Code encoder (byte mode, versions 1–40, all error-correction levels).
 * Follows ISO/IEC 18004; structure adapted from the public-domain algorithm description by Project Nayuki.
 */

export type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';

const ECC_FORMAT_BITS: Record<QRErrorLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

// Index 0 is unused so that the version number can be used directly.
const ECC_CODEWORDS_PER_BLOCK: Record<QRErrorLevel, number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const NUM_ERROR_CORRECTION_BLOCKS: Record<QRErrorLevel, number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

function numRawDataModules(version: number) {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function numDataCodewords(version: number, level: QRErrorLevel) {
  return Math.floor(numRawDataModules(version) / 8) - ECC_CODEWORDS_PER_BLOCK[level][version] * NUM_ERROR_CORRECTION_BLOCKS[level][version];
}

function alignmentPatternPositions(version: number) {
  if (version === 1) return [];
  const numAlign = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

// GF(256) arithmetic with the QR polynomial 0x11D.
function gfMultiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsDivisor(degree: number) {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]) {
  const result = new Array<number>(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);
    divisor.forEach((coefficient, index) => { result[index] ^= gfMultiply(coefficient, factor); });
  }
  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

export interface QRMatrix { size: number; version: number; modules: boolean[][] }

export function encodeQR(text: string, level: QRErrorLevel = 'M', minVersion = 1, maxVersion = 40, forcedMask?: number): QRMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = Math.max(1, minVersion);
  let dataCapacityBits = 0;
  for (; ; version++) {
    const countBits = version < 10 ? 8 : 16;
    const needed = 4 + countBits + bytes.length * 8;
    dataCapacityBits = numDataCodewords(version, level) * 8;
    if (needed <= dataCapacityBits) break;
    if (version >= Math.min(40, maxVersion)) throw new Error('QRCode: content too long');
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, dataCapacityBits - bits.length));
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < dataCapacityBits; pad ^= 0xec ^ 0x11) appendBits(bits, pad, 8);
  const dataCodewords: number[] = [];
  bits.forEach((bit, index) => { dataCodewords[index >>> 3] = (dataCodewords[index >>> 3] ?? 0) | (bit << (7 - (index & 7))); });

  const codewords = interleave(dataCodewords, version, level);
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));

  const set = (x: number, y: number, dark: boolean) => { modules[y][x] = dark; isFunction[y][x] = true; };
  const drawFinder = (x: number, y: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      const xx = x + dx; const yy = y + dy;
      if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, distance !== 2 && distance !== 4);
    }
  };
  const drawAlignment = (x: number, y: number) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  };
  const drawFormatBits = (mask: number) => {
    const data = (ECC_FORMAT_BITS[level] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fmt = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((fmt >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  const drawVersion = () => {
    if (version < 7) return;
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const info = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((info >>> i) & 1) === 1;
      const a = size - 11 + (i % 3); const b = Math.floor(i / 3);
      set(a, b, bit); set(b, a, bit);
    }
  };

  // Function patterns.
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  drawFinder(3, 3); drawFinder(size - 4, 3); drawFinder(3, size - 4);
  const align = alignmentPatternPositions(version);
  align.forEach((cy, i) => align.forEach((cx, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) || (i === align.length - 1 && j === 0)) return;
    drawAlignment(cx, cy);
  }));
  drawFormatBits(0);
  drawVersion();

  // Data placement in the zigzag order.
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) === 1;
          bitIndex++;
        }
      }
    }
  }

  // Choose the mask with the lowest penalty.
  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (isFunction[y][x]) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = (x + y) % 2 === 0; break;
        case 1: invert = y % 2 === 0; break;
        case 2: invert = x % 3 === 0; break;
        case 3: invert = (x + y) % 3 === 0; break;
        case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
        case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
      }
      if (invert) modules[y][x] = !modules[y][x];
    }
  };
  let bestMask = forcedMask ?? 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8 && forcedMask == null; mask++) {
    applyMask(mask);
    drawFormatBits(mask);
    const penalty = penaltyScore(modules, size);
    if (penalty < bestPenalty) { bestPenalty = penalty; bestMask = mask; }
    applyMask(mask);
  }
  applyMask(bestMask);
  drawFormatBits(bestMask);

  return { size, version, modules };
}

function interleave(data: number[], version: number, level: QRErrorLevel) {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[level][version];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[level][version];
  const rawCodewords = Math.floor(numRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const divisor = rsDivisor(blockEccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const length = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const block = data.slice(k, k + length);
    k += length;
    const ecc = rsRemainder(block, divisor);
    if (i < numShortBlocks) block.push(0);
    blocks.push(block.concat(ecc));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

function penaltyScore(modules: boolean[][], size: number) {
  let result = 0;
  const finderPenalty = (history: number[]) => {
    const n = history[1];
    const core = n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
    return (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) + (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0);
  };
  // The quiet zone counts as a light run at both ends of every line.
  const addHistory = (run: number, history: number[]) => {
    if (history[0] === 0) run += size;
    history.pop();
    history.unshift(run);
  };
  const terminate = (runColor: boolean, run: number, history: number[]) => {
    if (runColor) { addHistory(run, history); run = 0; }
    addHistory(run + size, history);
    return finderPenalty(history);
  };
  const scanLine = (read: (index: number) => boolean) => {
    let runColor = false; let run = 0; const history = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < size; i++) {
      const color = read(i);
      if (color === runColor) {
        run++;
        if (run === 5) result += 3; else if (run > 5) result++;
      } else {
        addHistory(run, history);
        if (!runColor) result += finderPenalty(history) * 40;
        runColor = color; run = 1;
      }
    }
    result += terminate(runColor, run, history) * 40;
  };
  for (let y = 0; y < size; y++) scanLine((x) => modules[y][x]);
  for (let x = 0; x < size; x++) scanLine((y) => modules[y][x]);
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
    const color = modules[y][x];
    if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) result += 3;
  }
  let dark = 0;
  modules.forEach((row) => row.forEach((module) => { if (module) dark++; }));
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * 10;
  return result;
}
