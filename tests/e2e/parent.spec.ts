import { test, expect, Page } from '@playwright/test';
import { open, seedSession } from '../support/app';

const nav = (page: Page, area: string) => page.locator(`.side nav a[href="#/parent/${area}"]`);

test.describe('Parent portal', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, 'parent');
    await open(page, '/parent/dashboard');
  });

  test('overview shows the linked child and latest report', async ({ page }) => {
    await expect(page.locator('.child h2')).toHaveText('Aarav Sharma');
    await expect(page.locator('.content .kpi .card')).toHaveCount(4);
    await expect(page.locator('.panel', { hasText: 'Latest daily report' })).toContainText(/Leaf printing/i);
    await expect(page.locator('.panel', { hasText: 'Notices' })).toBeVisible();
  });

  test('attendance calendar navigates between months', async ({ page }) => {
    await nav(page, 'attendance').click();
    await expect(page.locator('.top h2')).toHaveText('Attendance');
    const header = page.locator('.panel', { has: page.locator('.cal') }).locator('.ph-h h3');
    await expect(header).toHaveText(/October 2026/i);
    await expect(page.locator('.cal .h')).toHaveCount(7);
    await page.getByRole('button', { name: /Next/ }).click();
    await expect(header).toHaveText(/November 2026/i);
    await page.getByRole('button', { name: /Prev/ }).click();
    await page.getByRole('button', { name: /Prev/ }).click();
    await expect(header).toHaveText(/September 2026/i);
  });

  test('daily reports lists the child history', async ({ page }) => {
    await nav(page, 'daily').click();
    await expect(page.locator('.content .grid.g2 .rep')).toHaveCount(2);
  });

  test('fees lists invoices and opens a receipt', async ({ page }) => {
    await nav(page, 'fees').click();
    await expect(page.locator('.kpi .card', { hasText: 'Outstanding' }).locator('b')).toHaveText('₹0');
    const rows = page.locator('.tbl-wrap tbody tr');
    await expect(rows).toHaveCount(3);
    await rows.first().getByRole('button', { name: /Receipt/i }).click();
    const receipt = page.locator('.mbox', { hasText: 'Fee Receipt' });
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText(/PAID/);
    await receipt.getByRole('button', { name: /Done/i }).click();
  });

  test('gallery opens the lightbox', async ({ page }) => {
    await nav(page, 'gallery').click();
    const items = page.locator('.masonry .gi');
    await expect(items).toHaveCount(14);
    await items.first().click();
    await expect(page.locator('#modal .mbox.img img')).toBeVisible();
  });

  test('events and notices are parent-visible', async ({ page }) => {
    await nav(page, 'events').click();
    await expect(page.locator('.content .ev')).toHaveCount(5);
    await nav(page, 'notices').click();
    await expect(page.locator('.content .rep')).toHaveCount(3);
  });
});
