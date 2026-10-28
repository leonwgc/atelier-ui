import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const stylesDirectory = resolve(projectRoot, 'src/styles');
const componentClasses = readdirSync(stylesDirectory)
  .filter((fileName) => fileName.endsWith('.css'))
  .flatMap((fileName) => {
    const source = readFileSync(resolve(stylesDirectory, fileName), 'utf8');
    return [...source.matchAll(/\.((?:at-)[\w-]+)/g)].map((match) => match[1]);
  });

test.beforeEach(async ({ page }) => {
  await page.route('**/ui-design/**', async (route) => {
    const url = new URL(route.request().url());
    url.pathname = url.pathname.replace('/ui-design/', '/');
    await route.continue({ url: url.toString() });
  });
  await page.goto('');
});

test('production catalog loads selectors from every component stylesheet', async ({ page }) => {
  const loadedSelectors = await page.evaluate(() => {
    const collectSelectors = (rules: CSSRuleList): string[] =>
      Array.from(rules).flatMap((rule) => {
        if ('selectorText' in rule) return [(rule as CSSStyleRule).selectorText];
        if ('cssRules' in rule) return collectSelectors((rule as CSSGroupingRule).cssRules);
        return [];
      });

    return Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return collectSelectors(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .join('\n');
  });

  const missingClasses = [...new Set(componentClasses)].filter((className) => {
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return !new RegExp(`\\.${escapedClassName}(?![\\w-])`).test(loadedSelectors);
  });

  expect(missingClasses).toEqual([]);
});

test('every component navigation item opens its documentation page', async ({ page }) => {
  const navigationItems = page.locator('.side-nav__item');
  const itemCount = await navigationItems.count();

  for (let index = 0; index < itemCount; index += 1) {
    const item = navigationItems.nth(index);
    const title = await item.getAttribute('aria-label');
    if (title === '组件总览') continue;

    await item.click();
    await expect(page.locator('.page-heading h1')).toContainText(title ?? '');
    await expect(page.locator('.example-card').first()).toBeVisible();
  }
});

test('Rate component keeps its visual style and responds to selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Rate 评分' }).click();

  const secondStar = page.getByRole('button', { name: '2 星' });
  await expect(secondStar).toHaveCSS('border-top-style', 'none');
  await secondStar.click();

  await expect(page.getByRole('button', { name: '1 星' })).toHaveAttribute('aria-pressed', 'true');
  await expect(secondStar).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '3 星' })).toHaveAttribute('aria-pressed', 'false');
});

test('Transfer component is laid out and moves a selected item', async ({ page }) => {
  await page.getByRole('button', { name: 'Transfer 穿梭框' }).click();

  const transfer = page.locator('.at-transfer');
  await expect(transfer).toHaveCSS('display', 'flex');
  await page.getByRole('checkbox', { name: '陈一川' }).check();
  await page.getByRole('button', { name: '移至已选' }).click();

  await expect(page.locator('.at-transfer__panel').nth(1)).toContainText('陈一川');
});

test('InputOTP exposes styled numeric cells and accepts pasted verification codes', async ({ page }) => {
  await page.getByRole('button', { name: 'InputOTP 验证码输入' }).click();

  const cells = page.getByRole('group', { name: '演示验证码' }).locator('input');
  await expect(cells).toHaveCount(6);
  await expect(cells.first()).toHaveCSS('width', '46px');
  await cells.nth(2).focus();
  await cells.nth(2).evaluate((input) => {
    const data = new DataTransfer();
    data.setData('text/plain', '731');
    input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data }));
  });

  await expect(cells.nth(0)).toHaveValue('4');
  await expect(cells.nth(1)).toHaveValue('8');
  await expect(cells.nth(2)).toHaveValue('7');
  await expect(cells.nth(3)).toHaveValue('3');
  await expect(cells.nth(4)).toHaveValue('1');
  await expect(cells.nth(5)).toHaveValue('');
});
