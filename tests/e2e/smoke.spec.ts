import { test, expect } from '@playwright/test';
import { open } from '../support/app';

test('app boots, renders the home page and logs no page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await open(page, '/home');

  await expect(page.locator('#app .nav')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Tiny hands/i);
  await expect(page.locator('footer')).toBeVisible();
  expect(errors).toEqual([]);
});
