// @vitest-environment node
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const BROWSER_GLOBAL = /\b(window|document|navigator|localStorage|matchMedia|ResizeObserver|IntersectionObserver|MutationObserver|HTMLElement|requestAnimationFrame) is not defined/;

describe('SSR safety', () => {
  it('imports the package entry without browser globals', async () => {
    await expect(import('../../src/index')).resolves.toBeDefined();
  });

  it('does not touch browser globals while rendering exported components', async () => {
    const mod = (await import('../../src/index')) as Record<string, unknown>;
    const offenders: string[] = [];

    for (const [name, value] of Object.entries(mod)) {
      if (!/^[A-Z]/.test(name)) continue;
      if (typeof value !== 'function' && !(typeof value === 'object' && value !== null && '$$typeof' in value)) continue;
      try {
        renderToString(createElement(value as never, {}));
      } catch (error) {
        // Missing required props are expected; only browser-global access is a failure.
        if (error instanceof ReferenceError || BROWSER_GLOBAL.test(String((error as Error)?.message))) {
          offenders.push(`${name}: ${(error as Error).message}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
