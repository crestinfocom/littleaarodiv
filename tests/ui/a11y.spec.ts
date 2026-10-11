import { test, expect } from '@playwright/test';
import { open, seedSession } from '../support/app';

/**
 * Accessibility & keyboard smoke checks for the whole UI.
 */
test.describe('Accessibility & keyboard', () => {
  test('document declares a language', async ({ page }) => {
    await open(page, '/home');
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  });

  for (const route of ['/home', '/about', '/programs', '/gallery', '/admissions', '/contact']) {
    test(`public page ${route} has exactly one h1 and real headings`, async ({ page }) => {
      await open(page, route);
      await expect(page.locator('#app h1')).toHaveCount(1);
      const h1 = (await page.locator('#app h1').first().innerText()).trim();
      expect(h1.length).toBeGreaterThan(0);
    });
  }

  test('every image exposes an alt attribute', async ({ page }) => {
    await open(page, '/home');
    const missing = await page.$$eval('#app img', (imgs) =>
      imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src') || '(no src)'),
    );
    expect(missing, `images without alt: ${missing.join(', ')}`).toEqual([]);
  });

  test('all buttons and links have accessible names on the home page', async ({ page }) => {
    await open(page, '/home');
    const unnamed = await page.$$eval('#app button, #app a', (els) =>
      els
        .filter((el) => {
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
          const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
          return !text && !label;
        })
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(unnamed, `unlabelled controls: ${unnamed.join(' | ')}`).toEqual([]);
  });

  test('all controls have accessible names in the admin console', async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/dashboard');
    const unnamed = await page.$$eval('.side nav a, .top button, .me', (els) =>
      els
        .filter((el) => {
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
          const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
          return !text && !label;
        })
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(unnamed, `unlabelled controls: ${unnamed.join(' | ')}`).toEqual([]);
  });

  test('keyboard focus reaches interactive controls', async ({ page }) => {
    await open(page, '/home');
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName || '');
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(tag);
    const insideApp = await page.evaluate(() => !!document.activeElement?.closest('#app'));
    expect(insideApp).toBe(true);
  });
});
