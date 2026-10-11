import { test, expect } from '@playwright/test';
import { open, seedSession } from '../support/app';

/**
 * Responsive UI behaviour on a small phone viewport (Pixel 5, ~393px wide).
 * These run only in the `mobile` Playwright project (see testMatch in config).
 */
test.describe('Mobile responsive UI', () => {
  test('public site uses the burger menu to reveal navigation', async ({ page }) => {
    await open(page, '/home');
    const burger = page.locator('.nav .burger');
    await expect(burger).toBeVisible();
    await expect(page.locator('.nav .links')).toBeHidden();

    await burger.click();
    await expect(page.locator('.nav .links')).toBeVisible();
    await expect(page.locator('.nav .links a', { hasText: /Programs/ })).toBeVisible();

    await burger.click();
    await expect(page.locator('.nav .links')).toBeHidden();
  });

  test('public navigation works from the opened burger menu', async ({ page }) => {
    await open(page, '/home');
    await page.locator('.nav .burger').click();
    await page.locator('.nav .links a', { hasText: /^Programs$/ }).click();
    await expect(page).toHaveURL(/#\/programs$/);
    await expect(page.locator('#app .prog')).toHaveCount(6);
  });

  test('admin portal uses an off-canvas sidebar drawer', async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/dashboard');
    const side = page.locator('.side');
    const toggle = page.locator('.menu-t');

    await expect(toggle).toBeVisible();
    await expect(side).not.toHaveClass(/open/);
    await expect(side).not.toBeInViewport();

    await toggle.click();
    await expect(side).toHaveClass(/open/);
    await expect(page.locator('#ovl')).toHaveClass(/open/);
    await expect(side).toBeInViewport();

    await page.locator('#ovl').click({ position: { x: 360, y: 400 } });
    await expect(side).not.toHaveClass(/open/);
  });

  test('sidebar link navigates and closes the drawer', async ({ page }) => {
    await seedSession(page, 'teacher');
    await open(page, '/teacher/dashboard');
    await page.locator('.menu-t').click();
    await page.locator('.side nav a[href="#/teacher/attendance"]').click();
    await expect(page).toHaveURL(/#\/teacher\/attendance$/);
    await expect(page.locator('.top h2')).toHaveText('Attendance');
  });

  test('login page is usable without horizontal scrolling', async ({ page }) => {
    await open(page, '/login');
    await expect(page.locator('#app .auth')).toBeVisible();
    await expect(page.locator('#lem')).toBeVisible();
    await page.locator('.tabs button', { hasText: /^Admin$/ }).click();
    await expect(page.locator('#lem')).toHaveValue('admin@littleaarodiv.com');
  });

  for (const route of ['/home', '/about', '/programs', '/gallery', '/admissions', '/contact', '/login']) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await open(page, route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(2);
    });
  }

  test('admin tables scroll inside their wrapper, not the page', async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/students');
    const wrap = page.locator('.tbl-wrap').first();
    await expect(wrap).toBeVisible();
    const scrolls = await wrap.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true);
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(pageOverflow).toBeLessThanOrEqual(2);
  });
});
