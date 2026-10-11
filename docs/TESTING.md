# Testing

The suite uses Playwright (Chromium only) and is split into functional
end-to-end tests and UI tests (responsive, visual, accessibility).

## Commands

| Command                        | What it runs                                   |
| ------------------------------ | ---------------------------------------------- |
| `npm test`                     | Everything, both projects                       |
| `npm run test:e2e`             | Functional end-to-end specs (`tests/e2e`)       |
| `npm run test:ui`              | Responsive / visual / a11y specs (`tests/ui`)   |
| `npm run test:headed`          | Any of the above with a visible browser         |
| `npm run test:devtools`        | Headed **with Chrome DevTools** auto-opened      |
| `npm run test:update`          | Re-record visual snapshots                      |
| `npm run report`               | Open the last HTML report                        |

Append filters, e.g. `npm run test:e2e -- --project=desktop`.

## Watching a run (headed + DevTools)

Headed mode opens a real browser window so you can watch each step:

```
npm run test:headed
```

To also open Chrome DevTools automatically on every tab (inspect the DOM, console
and network live):

```
npm run test:devtools
```

Under the hood this sets `PW_DEVTOOLS=1`, which the Playwright config turns into
the `--auto-open-devtools-for-tabs` Chromium flag. You can also do it manually:

```
# PowerShell
$env:PW_DEVTOOLS=1; npx playwright test --headed

# cmd.exe
set PW_DEVTOOLS=1 && npx playwright test --headed
```

Tip: use `--workers=1` when watching to keep a single browser window focused:

```
npm run test:devtools -- --workers=1
```

DevTools is heavier than a normal headless run, so expect it to be slower.

## Projects

The config defines two projects (see `playwright.config.ts`):

- **desktop** (1440x900) — runs every `*.spec.ts` except `*.mobile.spec.ts`.
- **mobile** (Pixel 5, ~393px) — runs only `*.mobile.spec.ts` responsive specs.

Run one with `--project=desktop` or `--project=mobile`.

## Layout

```
tests/
  support/app.ts              shared helpers (determinism, sessions, login, inbox stub)
  e2e/                        smoke, public-site, enquiry-form, auth, admin, teacher, parent
  ui/                         a11y.spec.ts, visual.spec.ts, responsive.mobile.spec.ts
  ui/visual.spec.ts-snapshots recorded baseline images (*-desktop-win32.png)
```

## Determinism

To keep runs reproducible the helper in `tests/support/app.ts`:

- fixes the clock to a constant instant,
- seeds `Math.random` with a fixed value,
- removes the splash screen and waits for fonts and images before assertions.

Visual snapshots therefore compare stable pixels. Baselines are OS-specific
(`*-desktop-win32.png`); record them on the target machine with
`npm run test:update`. The tolerance is `maxDiffPixelRatio: 0.03`.

## Artifacts

On failure Playwright writes traces, screenshots and videos to `test-results/`,
and the HTML report to `playwright-report/`. Both are gitignored. Open the report
with `npm run report`.

## Notes

- The frontend tests run against the Vite dev server on port 5173. The API is
  **not** required for them — the SPA uses its in-browser demo data.
- The admin **Neon Sync** spec asserts the panel degrades gracefully when the API
  is down, so it is safe to run with or without the backend.
- Form submissions email `crestinfocom@gmail.com` through FormSubmit. Every spec
  that submits a form calls the `stubInbox(page)` helper (in `tests/support/app.ts`)
  to intercept `formsubmit.co`, capture the request payload for assertions and
  guarantee **no real email is ever sent** during a test run.
