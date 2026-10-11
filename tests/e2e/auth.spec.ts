import { test, expect } from '@playwright/test';
import { open, loginViaUI, seedSession, DEMO, Role } from '../support/app';

test.describe('Authentication & routing', () => {
  test('login page defaults to the parent role with prefilled demo credentials', async ({ page }) => {
    await open(page, '/login');
    await expect(page.locator('#app .auth')).toBeVisible();
    await expect(page.locator('.tabs button.on')).toHaveText('Parent');
    await expect(page.locator('#lem')).toHaveValue(DEMO.parent.email);
    await expect(page.locator('#lpw')).toHaveValue(DEMO.parent.pass);
  });

  test('switching role tabs updates the prefilled credentials', async ({ page }) => {
    await open(page, '/login');
    await page.locator('.tabs button', { hasText: /^Teacher$/ }).click();
    await expect(page.locator('#lem')).toHaveValue(DEMO.teacher.email);
    await expect(page.locator('#lpw')).toHaveValue(DEMO.teacher.pass);
  });

  test('invalid credentials show an error toast and stay on login', async ({ page }) => {
    await open(page, '/login');
    await page.locator('#lem').fill('nobody@example.com');
    await page.locator('#lpw').fill('wrong');
    await page.getByRole('button', { name: /Sign in as/i }).click();
    await expect(page.locator('#toast .tst.err')).toContainText(/Invalid email or password/i);
    await expect(page).toHaveURL(/#\/?login/);
  });

  for (const role of ['admin', 'teacher', 'parent'] as Role[]) {
    test(`logs in as ${role} and lands on the ${role} dashboard`, async ({ page }) => {
      await loginViaUI(page, role);
      await expect(page.locator('#app .shell')).toBeVisible();
      await expect(page.locator('.side .lbl')).toContainText(
        role === 'admin' ? /Admin Console/i : role === 'teacher' ? /Teacher Portal/i : /Parent Portal/i,
      );
      await expect(page.locator('.side nav a.on')).toBeVisible();
      await expect(page.locator('.top .me b')).toHaveText(DEMO[role].name);
    });
  }

  test('signing out returns to the login page', async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/dashboard');
    await page.locator('.side-foot a', { hasText: /Sign out/i }).click();
    await expect(page).toHaveURL(/#\/login/);
    await expect(page.locator('#app .auth')).toBeVisible();
  });

  test('protected routes redirect to login when there is no session', async ({ page }) => {
    await open(page, '/admin/dashboard');
    await expect(page).toHaveURL(/#\/login/);
    await expect(page.locator('#app .auth')).toBeVisible();
  });

  test('a parent session cannot open the admin console', async ({ page }) => {
    await seedSession(page, 'parent');
    await open(page, '/admin/dashboard');
    await expect(page).toHaveURL(/#\/login/);
    await expect(page.locator('#app .auth')).toBeVisible();
  });
});
