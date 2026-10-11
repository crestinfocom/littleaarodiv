import { Page, expect } from '@playwright/test';

export const FIXED_TIME = new Date('2026-10-10T10:30:00+05:30');

export const DEMO = {
  admin: { id: 'u1', email: 'admin@littleaarodiv.com', pass: 'admin123', name: 'Meera Krishnan' },
  teacher: { id: 'u2', email: 'teacher@littleaarodiv.com', pass: 'teacher123', name: 'Ananya Bose' },
  parent: { id: 'u3', email: 'parent@littleaarodiv.com', pass: 'parent123', name: 'Priya Sharma' },
} as const;

export type Role = keyof typeof DEMO;

/** Deterministic Math.random so the seeded demo database is identical on every run. */
const SEEDED_RANDOM = `(() => {
  let s = 0x9e3779b9;
  Math.random = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;

export async function installDeterminism(page: Page): Promise<void> {
  await page.clock.setFixedTime(FIXED_TIME);
  await page.addInitScript({ content: SEEDED_RANDOM });
}

/** Sign a role straight in by pre-populating the session, skipping the login UI. */
export async function seedSession(page: Page, role: Role): Promise<void> {
  const id = DEMO[role].id;
  await page.addInitScript((userId) => {
    try {
      window.sessionStorage.setItem('la_user', JSON.stringify({ id: userId }));
    } catch {
      /* ignore */
    }
  }, id);
}

/** Wait until the app has rendered and the branded splash screen is gone. */
export async function waitForApp(page: Page): Promise<void> {
  await page.locator('#app').waitFor({ state: 'attached' });
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 15_000 });
}

/** Navigate to a hash route, with determinism installed. */
export async function open(page: Page, hash = '/home'): Promise<void> {
  await installDeterminism(page);
  await page.goto('/#' + hash.replace(/^#?\/?/, ''));
  await waitForApp(page);
}

/** Navigate through the SPA without a full reload. */
export async function goHash(page: Page, hash: string): Promise<void> {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
  await expect(page.locator('#pageLoader')).not.toHaveClass(/on/, { timeout: 10_000 });
}

/** Log in through the real login UI (used by the auth specs). */
export async function loginViaUI(page: Page, role: Role): Promise<void> {
  await open(page, '/login');
  await page.locator('.tabs button', { hasText: new RegExp(`^${role}$`, 'i') }).click();
  await page.getByRole('button', { name: new RegExp(`Sign in as ${role}`, 'i') }).click();
  await expect(page).toHaveURL(new RegExp(`#/${role}/dashboard`, 'i'));
}

/** Make screenshots deterministic: freeze animations and wait for fonts/images. */
export async function stabilize(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `*,*::before,*::after{animation:none!important;transition:none!important}`,
  });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise<void>((res) => {
          img.addEventListener('load', () => res(), { once: true });
          img.addEventListener('error', () => res(), { once: true });
        })),
    );
  });
  await page.locator('#splash').evaluateAll((els) => els.forEach((e) => e.remove()));
  await page.locator('#toast').evaluateAll((els) => (els.forEach((e) => ((e as HTMLElement).innerHTML = ''))));
}

/** The admissions inbox every website form is emailed to. */
export const INBOX_EMAIL = 'crestinfocom@gmail.com';

export interface InboxCall {
  url: string;
  method: string;
  body: Record<string, unknown>;
}

/**
 * Intercept the FormSubmit AJAX endpoint so tests never send real email.
 * Returns the live array of captured calls for assertions.
 */
export async function stubInbox(page: Page): Promise<InboxCall[]> {
  const calls: InboxCall[] = [];
  await page.route('**/formsubmit.co/**', async (route) => {
    const req = route.request();
    let body: Record<string, unknown> = {};
    try {
      body = (req.postDataJSON() as Record<string, unknown>) ?? {};
    } catch {
      body = { raw: req.postData() };
    }
    calls.push({ url: req.url(), method: req.method(), body });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ success: 'true', message: 'stubbed by test' }),
    });
  });
  return calls;
}

/** Accept or provide a value for the next native dialog (confirm/prompt/alert). */
export function acceptDialog(page: Page, promptValue?: string): void {
  page.once('dialog', (d) => {
    if (promptValue !== undefined && d.type() === 'prompt') d.accept(promptValue);
    else d.accept();
  });
}

export function expectNoPageErrors(page: Page, errors: string[]): void {
  expect(errors, `page errors:\n${errors.join('\n')}`).toEqual([]);
}
