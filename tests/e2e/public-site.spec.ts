import { test, expect, Page } from '@playwright/test';
import { open, goHash, stubInbox } from '../support/app';

test.describe('Public website', () => {
  test('home page renders all major sections', async ({ page }) => {
    await open(page, '/home');
    const app = page.locator('#app');
    await expect(app.locator('.nav')).toBeVisible();
    await expect(app.locator('.hero h1')).toContainText(/Tiny hands/i);
    await expect(app.locator('.hero .btn', { hasText: /Book a Campus Tour/i })).toBeVisible();
    await expect(app.locator('section .card').first()).toBeVisible();
    await expect(app.locator('.band b').first()).toBeVisible();
    await expect(app.locator('.cta')).toBeVisible();
    await expect(app.locator('footer .fg')).toBeVisible();
  });

  test('top navigation routes to every public page', async ({ page }) => {
    await open(page, '/home');
    const cases: Array<[string, RegExp, string]> = [
      ['About', /childhood is/i, 'about'],
      ['Programs', /Thoughtful programs/i, 'programs'],
      ['Gallery', /Moments of pure joy/i, 'gallery'],
      ['Admissions', /journey/i, 'admissions'],
      ['Contact', /hear from you/i, 'contact'],
      ['Home', /Tiny hands/i, 'home'],
    ];
    for (const [label, heading, hash] of cases) {
      await page.locator('.nav .links a', { hasText: new RegExp(`^${label}$`) }).click();
      await expect(page).toHaveURL(new RegExp(`#/${hash}$`));
      await expect(page.locator('#app h1')).toContainText(heading);
      await expect(page.locator('#app .nav a.on')).toContainText(label);
    }
  });

  test('programs page lists all six programs with fees', async ({ page }) => {
    await open(page, '/programs');
    const cards = page.locator('#app .prog');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('#app .prog h3', { hasText: 'Infant Care' })).toBeVisible();
    await expect(page.locator('#app .prog', { hasText: 'Infant Care' }).locator('.meta b')).toHaveText(/₹14,000/);
  });

  test('gallery filters by category and opens the lightbox', async ({ page }) => {
    await open(page, '/gallery');
    const items = page.locator('#app .masonry .gi');
    await expect(items).toHaveCount(14);

    await page.locator('#app .chip', { hasText: /^Outdoor$/ }).click();
    await expect(items).toHaveCount(2);
    await expect(page.locator('#app .chip.on')).toHaveText('Outdoor');

    await items.first().click();
    await expect(page.locator('#modal .mbox.img img')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.locator('#modal .mbox.img')).toHaveCount(0);
  });

  test('admissions enquiry form submits and shows confirmation', async ({ page }) => {
    await stubInbox(page);
    await open(page, '/admissions');
    const form = page.locator('#app form.f').first();
    await form.locator('input[name="child"]').fill('Riya Test');
    await form.locator('input[name="age"]').fill('3 yrs');
    await form.locator('input[name="parent"]').fill('Test Parent');
    await form.locator('input[name="phone"]').fill('+91 90000 00000');
    await form.getByRole('button', { name: /Submit Enquiry/i }).click();

    await expect(page.locator('#modal .mbox')).toContainText(/Thank you/i, { timeout: 10_000 });
    await page.getByRole('button', { name: /Wonderful/i }).click();
    await expect(page.locator('#modal .mbox')).toHaveCount(0);
  });

  test('contact form submits and shows a toast', async ({ page }) => {
    await stubInbox(page);
    await open(page, '/contact');
    const form = page.locator('#app form.f').first();
    await form.locator('input[name="name"]').fill('Test Family');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill('Hello, we would like a tour.');
    await form.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.locator('#toast .tst')).toContainText(/Message sent/i, { timeout: 10_000 });
  });

  test('FAQ accordion expands', async ({ page }) => {
    await open(page, '/admissions');
    const faq = page.locator('#app details').first();
    await expect(faq).not.toHaveAttribute('open', /.*/);
    await faq.locator('summary').click();
    await expect(faq).toHaveAttribute('open', /.*/);
  });

  test('unknown hash falls back to the home page', async ({ page }) => {
    await open(page, '/home');
    await goHash(page, '/does-not-exist');
    await expect(page.locator('#app h1')).toContainText(/Tiny hands/i);
  });
});

export async function gotoPublic(page: Page, section: string) {
  await goHash(page, '/' + section);
}
