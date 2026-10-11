import { test, expect, Page } from '@playwright/test';
import { open, seedSession, acceptDialog, stabilize } from '../support/app';

const nav = (page: Page, area: string) => page.locator(`.side nav a[href="#/admin/${area}"]`);

test.describe('Admin console', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/dashboard');
  });

  test('dashboard shows KPIs, charts and recent enquiries', async ({ page }) => {
    await expect(page.locator('.top .tl small')).toContainText(/Good morning, Meera/i);
    const kpis = page.locator('.content .kpi .card');
    await expect(kpis).toHaveCount(4);
    await expect(kpis.filter({ hasText: 'Active students' })).toBeVisible();
    await expect(kpis.filter({ hasText: 'Active staff' })).toBeVisible();
    await expect(kpis.filter({ hasText: 'New enquiries' })).toBeVisible();
    await expect(page.locator('.panel h3', { hasText: 'Enrollment by program' })).toBeVisible();
    await expect(page.locator('.panel h3', { hasText: /Today.s attendance/i })).toBeVisible();
    await expect(page.locator('.donut b')).toContainText(/%/);
    await expect(page.locator('.panel', { hasText: 'Latest enquiries' }).locator('tbody tr')).toHaveCount(5);
  });

  test('every admin menu item opens its view', async ({ page }) => {
    const items: Array<[string, RegExp]> = [
      ['admissions', /Admissions/i],
      ['students', /^Students$/i],
      ['staff', /^Staff$/i],
      ['programs', /^Programs$/i],
      ['attendance', /^Attendance$/i],
      ['daily', /Daily Reports/i],
      ['fees', /Fees & Billing/i],
      ['events', /^Events$/i],
      ['gallery', /^Gallery$/i],
      ['notices', /^Notices$/i],
      ['messages', /^Messages$/i],
      ['reports', /^Reports$/i],
      ['settings', /^Settings$/i],
      ['sync', /Neon Sync/i],
    ];
    for (const [area, title] of items) {
      await nav(page, area).click();
      await expect(page).toHaveURL(new RegExp(`#/admin/${area}$`));
      await expect(page.locator('.top h2')).toHaveText(title);
      await expect(nav(page, area)).toHaveClass(/on/);
    }
  });

  test('students: add, search, edit and delete', async ({ page }) => {
    await nav(page, 'students').click();
    const rows = page.locator('#tbl-students tbody tr');
    await expect(rows).toHaveCount(12);

    // Add
    await page.getByRole('button', { name: /\+ Add Student/i }).click();
    const form = page.locator('#cf');
    await form.locator('input[name="name"]').fill('QA Child');
    await form.locator('select[name="gender"]').selectOption('Girl');
    await form.locator('select[name="program"]').selectOption('Preschool');
    await form.locator('input[name="parent"]').fill('QA Parent');
    await form.locator('input[name="phone"]').fill('+91 90000 12345');
    await page.getByRole('button', { name: /Create Student/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Student added/i);
    await expect(rows).toHaveCount(13);
    await expect(rows.filter({ hasText: 'QA Child' })).toHaveCount(1);

    // Search
    const search = page.locator('.content .toolbar input');
    await search.fill('QA Child');
    await expect(rows).toHaveCount(1);
    await search.fill('');

    // Edit
    const qaRow = rows.filter({ hasText: 'QA Child' });
    await qaRow.getByRole('button', { name: /^Edit$/ }).click();
    await page.locator('#cf input[name="name"]').fill('QA Child Renamed');
    await page.getByRole('button', { name: /Save changes/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Student updated/i);
    await expect(rows.filter({ hasText: 'QA Child Renamed' })).toHaveCount(1);

    // Delete
    acceptDialog(page);
    await rows.filter({ hasText: 'QA Child Renamed' }).getByRole('button', { name: /Delete/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Deleted/i);
    await expect(rows).toHaveCount(12);
  });

  test('students: export CSV downloads a file', async ({ page }) => {
    await nav(page, 'students').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export CSV/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/little-aarodiv-students-\d{4}-\d{2}-\d{2}\.csv/);
  });

  test('admissions: pipeline filter and enroll an enquiry', async ({ page }) => {
    await nav(page, 'admissions').click();
    const pipes = page.locator('.pipe .card');
    await expect(pipes).toHaveCount(5);

    await pipes.filter({ hasText: 'New' }).click();
    const rows = page.locator('#tbl-inquiries tbody tr');
    await expect(rows.first()).toBeVisible();
    for (const t of await rows.all()) {
      await expect(t.locator('.badge')).toHaveText('New');
    }
    await pipes.filter({ hasText: 'New' }).click();

    await page.locator('#tbl-inquiries tbody tr', { hasText: 'Navya Chowdary' })
      .getByRole('button', { name: /Enroll/i }).click();
    await expect(page.locator('#cf')).toBeVisible();
    await page.getByRole('button', { name: /Create Student/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Student added/i);

    await nav(page, 'students').click();
    await expect(page.locator('#tbl-students tbody tr', { hasText: 'Navya Chowdary' })).toHaveCount(1);
  });

  test('attendance: mark everyone present', async ({ page }) => {
    await nav(page, 'attendance').click();
    await expect(page.locator('.top h2')).toHaveText('Attendance');
    const items = page.locator('.att-item');
    await expect(items.first()).toBeVisible();
    const total = await items.count();
    expect(total).toBeGreaterThan(0);

    await items.first().locator('.seg button', { hasText: /^Present$/ }).click();
    await expect(items.first().locator('.seg button', { hasText: /^Present$/ })).toHaveClass(/p/);

    await page.getByRole('button', { name: /Mark all present/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/All marked present/i);
    await expect(page.locator('.kpi .card', { hasText: 'Present' }).locator('b')).toHaveText(String(total));
  });

  test('daily reports: post a report for a child', async ({ page }) => {
    await nav(page, 'daily').click();
    await expect(page.locator('.top h2')).toHaveText('Daily Reports');
    const form = page.locator('.panel', { hasText: 'Post a daily report' }).locator('form');
    await form.locator('textarea[name="note"]').fill('E2E automated note');
    await form.locator('input[name="activities"]').fill('E2E block play');
    await form.getByRole('button', { name: /Post report/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Daily report shared/i);
    await expect(page.locator('.rep', { hasText: 'E2E block play' })).toBeVisible();
  });

  test('fees: record a payment and print a receipt', async ({ page }) => {
    await nav(page, 'fees').click();
    await expect(page.locator('.content .kpi .card')).toHaveCount(4);

    const unpaidRow = page.locator('#tbl-fees tbody tr', { hasText: 'Mark paid' }).first();
    await expect(unpaidRow).toBeVisible();
    await unpaidRow.getByRole('button', { name: /Mark paid/i }).click();
    await expect(page.locator('#pm')).toBeVisible();
    await page.getByRole('button', { name: /Confirm payment/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Payment recorded/i);

    const paidRow = page.locator('#tbl-fees tbody tr', { hasText: 'Receipt' }).first();
    await paidRow.getByRole('button', { name: /^Receipt$/ }).click();
    const receipt = page.locator('.mbox', { hasText: 'Fee Receipt' });
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText(/Receipt No\./);
    await expect(receipt).toContainText(/PAID/);
    await receipt.getByRole('button', { name: /Done/i }).click();
  });

  test('fees: generate monthly invoices', async ({ page }) => {
    await nav(page, 'fees').click();
    const before = await page.locator('#tbl-fees tbody tr').count();
    acceptDialog(page, '2026-11');
    await page.getByRole('button', { name: /Generate monthly invoices/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/invoices generated|already exist/i);
    const after = await page.locator('#tbl-fees tbody tr').count();
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('messages: opening a message marks it read', async ({ page }) => {
    await nav(page, 'messages').click();
    await expect(page.locator('.top h2')).toHaveText('Messages');
    const unreadBefore = await page.locator('.msg.unread').count();
    expect(unreadBefore).toBeGreaterThan(0);
    await page.locator('.msg.unread').first().click();
    await expect(page.locator('#modal .mbox')).toBeVisible();
    await page.locator('#modal .x').click();
    await expect(page.locator('.msg.unread')).toHaveCount(unreadBefore - 1);
  });

  test('settings: save profile changes and reflect them on the public site', async ({ page }) => {
    await nav(page, 'settings').click();
    await page.locator('input[name="name"]').fill('Little Aarodiv QA');
    await page.getByRole('button', { name: /Save settings/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Settings saved/i);
    await page.locator('.side-foot a', { hasText: /View website/i }).click();
    await expect(page).toHaveURL(/#\/home/);
    await expect(page.locator('#app footer')).toContainText('Little Aarodiv QA');
  });

  test('settings: reset demo data restores defaults', async ({ page }) => {
    await nav(page, 'settings').click();
    await page.locator('input[name="name"]').fill('Temporary Name');
    await page.getByRole('button', { name: /Save settings/i }).click();
    acceptDialog(page);
    await page.getByRole('button', { name: /Reset demo data/i }).click();
    await expect(page.locator('#toast .tst').last()).toContainText(/Demo data restored/i);
    await expect(page.locator('input[name="name"]')).toHaveValue('Little Aarodiv');
  });

  test('neon sync: panel is available and explains the API state', async ({ page }) => {
    await nav(page, 'sync').click();
    await expect(page.locator('.top h2')).toHaveText('Neon Sync');
    await expect(page.getByRole('button', { name: /Sync from Neon now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Refresh status/i })).toBeVisible();
    // The API is not running during the e2e suite, so the panel must degrade gracefully.
    await expect(page.locator('#sync-status')).toBeVisible();
    await expect(page.locator('#sync-status')).toContainText(/Local Docker|Neon|reachable|synced/i);
  });
});
