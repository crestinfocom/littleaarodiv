import { test, expect, Page } from '@playwright/test';
import { open, seedSession, stubInbox, INBOX_EMAIL } from '../support/app';

const ENDPOINT = `https://formsubmit.co/ajax/${INBOX_EMAIL}`;

/** Labels of every `[required]` control inside a form, for sign checks. */
async function requiredLabels(page: Page, formSelector: string) {
  return page.$$eval(`${formSelector} [required]`, (els) =>
    els.map((el) => {
      const wrap = el.closest('div, label') ?? el.parentElement;
      const label = wrap?.querySelector('label');
      return {
        name: el.getAttribute('name') || el.id || el.tagName.toLowerCase(),
        label: (label?.textContent || '').trim(),
      };
    }),
  );
}

function expectAllSigned(fields: Array<{ name: string; label: string }>) {
  expect(fields.length, 'expected at least one required field').toBeGreaterThan(0);
  const missing = fields.filter((f) => !f.label.includes('*'));
  expect(missing, `required fields without a * sign: ${JSON.stringify(missing)}`).toEqual([]);
}

test.describe('Website forms email the admissions inbox', () => {
  test('the enquiry form posts the submission to crestinfocom@gmail.com', async ({ page }) => {
    const calls = await stubInbox(page);
    await open(page, '/admissions');

    const form = page.locator('#app form.f').first();
    await form.locator('input[name="child"]').fill('Riya Test');
    await form.locator('input[name="age"]').fill('3 yrs');
    await form.locator('input[name="parent"]').fill('Test Parent');
    await form.locator('input[name="phone"]').fill('+91 90000 00000');
    await form.locator('input[name="email"]').fill('parent@example.com');
    await form.getByRole('button', { name: /Submit Enquiry/i }).click();

    await expect(page.locator('#modal .mbox')).toContainText(/Thank you/i, { timeout: 10_000 });
    await expect.poll(() => calls.length, { timeout: 10_000 }).toBeGreaterThan(0);

    expect(calls[0].url).toBe(ENDPOINT);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toMatchObject({
      Form: 'Admission enquiry',
      'Child name': 'Riya Test',
      'Parent name': 'Test Parent',
      Phone: '+91 90000 00000',
      Email: 'parent@example.com',
    });
  });

  test('the contact form posts the message to crestinfocom@gmail.com', async ({ page }) => {
    const calls = await stubInbox(page);
    await open(page, '/contact');

    const form = page.locator('#app form.f').first();
    await form.locator('input[name="name"]').fill('Test Family');
    await form.locator('input[name="email"]').fill('family@example.com');
    await form.locator('textarea[name="message"]').fill('Hello, we would like a tour.');
    await form.getByRole('button', { name: /Send Message/i }).click();

    await expect(page.locator('#toast .tst')).toContainText(/Message sent/i, { timeout: 10_000 });
    await expect.poll(() => calls.length, { timeout: 10_000 }).toBeGreaterThan(0);

    expect(calls[0].url).toBe(ENDPOINT);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toMatchObject({
      Form: 'Contact message',
      Name: 'Test Family',
      Email: 'family@example.com',
      Message: 'Hello, we would like a tour.',
    });
  });

  test('a failed inbox call never blocks the visitor confirmation', async ({ page }) => {
    await page.route('**/formsubmit.co/**', (route) => route.abort());
    await open(page, '/admissions');

    const form = page.locator('#app form.f').first();
    await form.locator('input[name="child"]').fill('Offline Brat');
    await form.locator('input[name="age"]').fill('2 yrs');
    await form.locator('input[name="parent"]').fill('Offline Parent');
    await form.locator('input[name="phone"]').fill('+91 90000 11111');
    await form.getByRole('button', { name: /Submit Enquiry/i }).click();

    await expect(page.locator('#modal .mbox')).toContainText(/Thank you/i, { timeout: 10_000 });
  });
});

test.describe('Mandatory * sign on every required field', () => {
  for (const { name, route } of [
    { name: 'admissions enquiry', route: '/admissions' },
    { name: 'contact message', route: '/contact' },
    { name: 'login', route: '/login' },
  ]) {
    test(`${name} form marks its required fields with *`, async ({ page }) => {
      await open(page, route);
      expectAllSigned(await requiredLabels(page, '#app form.f'));
    });
  }

  test('admin add-student form marks its required fields with *', async ({ page }) => {
    await seedSession(page, 'admin');
    await open(page, '/admin/students');
    await page.getByRole('button', { name: /Add Student/i }).click();
    expectAllSigned(await requiredLabels(page, '#modal form.f'));
  });

  test('teacher daily report form marks its required fields with *', async ({ page }) => {
    await seedSession(page, 'teacher');
    await open(page, '/teacher/daily');
    expectAllSigned(await requiredLabels(page, '#app form.f'));
  });
});
