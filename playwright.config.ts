import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

// Set PW_DEVTOOLS=1 to auto-open Chrome DevTools in headed runs:
//   PowerShell:  $env:PW_DEVTOOLS=1; npx playwright test --headed
//   cmd.exe:     set PW_DEVTOOLS=1 && npx playwright test --headed
const devtoolsArgs = process.env.PW_DEVTOOLS ? ['--auto-open-devtools-for-tabs'] : [];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.03 } },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',
    launchOptions: { args: devtoolsArgs },
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /.*\.mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions: { args: devtoolsArgs } },
    },
    {
      name: 'mobile',
      testMatch: /.*\.mobile\.spec\.ts/,
      use: { ...devices['Pixel 5'], launchOptions: { args: devtoolsArgs } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
