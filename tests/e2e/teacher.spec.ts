import { test, expect, Page } from '@playwright/test';
import { open, seedSession } from '../support/app';

const nav = (page: Page, area: string) => page.locator(`.side nav a[href="#/teacher/${area}"]`);

test.describe('Teacher portal', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, 'teacher');
    await open(page, '/teacher/dashboard');
  });

  test('dashboard summarises the assigned class', async ({ page }) => {
    await expect(page.locator('.child h2')).toHaveText(/Preschool class/i);
    await expect(page.locator('.content .kpi .card')).toHaveCount(4);
    await expect(page.locator('.content')).toContainText(/little learners/i);
    await expect(page.locator('.side nav a[href="#/teacher/attendance"]')).toBeVisible();
  });

  test('my class lists only assigned students', async ({ page }) => {
    await nav(page, 'class').click();
    const cards = page.locator('.content .grid.g3 > .card');
    await expect(cards).toHaveCount(4);
    await expect(page.locator('.content')).toContainText('Aarav Sharma');
    await expect(page.locator('.content')).toContainText('Attendance');
  });

  test('attendance is scoped to the teacher program', async ({ page }) => {
    await nav(page, 'attendance').click();
    await expect(page.locator('.toolbar .badge.b-lav')).toHaveText('Preschool');
    await expect(page.locator('.toolbar select')).toHaveCount(0);
    await expect(page.locator('.att-item')).toHaveCount(4);
  });

  test('posts a daily report for a student', async ({ page }) => {
    await nav(page, 'daily').click();
    await expect(page.locator('.top h2')).toHaveText('Daily Reports');
    const form = page.locator('.panel', { hasText: 'Post a daily report' }).locator('form');
    await form.locator('textarea[name="note"]').fill('Teacher E2E note');
    await form.locator('input[name="activities"]').fill('Teacher E2E music');
    await form.getByRole('button', { name: /Post report/i }).click();
    await expect(page.locator('#toast .tst')).toContainText(/Daily report shared/i);
    await expect(page.locator('.rep', { hasText: 'Teacher E2E music' })).toBeVisible();
  });

  test('shows staff-visible notices and events', async ({ page }) => {
    await nav(page, 'notices').click();
    await expect(page.locator('.content .rep')).not.toHaveCount(0);
    await nav(page, 'events').click();
    await expect(page.locator('.content .ev')).not.toHaveCount(0);
  });
});
