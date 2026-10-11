import { test, expect } from '@playwright/test';
import { open, seedSession, stabilize } from '../support/app';

/**
 * Visual regression snapshots (desktop only).
 * Run `npm run test:update` once to record baselines, then `npm test` compares.
 * The determinism helpers fix the clock, seed Math.random and wait for fonts
 * and images so the pixels are stable across runs.
 */
test.describe('Visual snapshots', () => {
  const shots: Array<{ name: string; route: string; role?: 'admin' | 'teacher' | 'parent' }> = [
    { name: 'home.png', route: '/home' },
    { name: 'programs.png', route: '/programs' },
    { name: 'gallery.png', route: '/gallery' },
    { name: 'admissions.png', route: '/admissions' },
    { name: 'login.png', route: '/login' },
    { name: 'admin-dashboard.png', route: '/admin/dashboard', role: 'admin' },
    { name: 'admin-students.png', route: '/admin/students', role: 'admin' },
    { name: 'teacher-attendance.png', route: '/teacher/attendance', role: 'teacher' },
    { name: 'parent-overview.png', route: '/parent/dashboard', role: 'parent' },
    { name: 'parent-fees.png', route: '/parent/fees', role: 'parent' },
  ];

  for (const shot of shots) {
    test(`snapshot: ${shot.name}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'Snapshots are recorded on desktop only.');
      if (shot.role) await seedSession(page, shot.role);
      await open(page, shot.route);
      await stabilize(page);
      await expect(page.locator('#app')).toHaveScreenshot(shot.name, { fullPage: true, animations: 'disabled' });
    });
  }
});
