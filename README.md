# The Guide Log (frontend)

Angular app for **The Guide Log**: journals/logs, tasks, habits, numeric **log progress goals** (logs added or completed, with daily targets and week/month/year derived from the daily number), **personal goals** (link logs from each log’s form; goal detail shows linked logs and optional **AI coaching**), **Story of the day** (one shared AI piece per UTC calendar day), and **AI summary** on the logs list (uses your current filters, up to 50 entries).

## Prerequisites

- Node.js and npm compatible with the Angular version in `package.json`
- Backend API running and `environment.baseUrl` pointing at it (see `src/environments/`)

## Development server

```bash
npm install
ng serve
```

Open `http://localhost:4200/`. The app reloads when you change source files.

## Build

```bash
ng build
```

Output goes to `dist/` (production build is optimized by default).

## Tests

```bash
ng test
```

Uses the Karma test runner.

## QA onboarding (development)

To re-run the **welcome / first-log** flow without registering a new account:

1. Register once with a dedicated sandbox email and use it for QA.
2. In the backend repo, add `DEV_ONBOARDING_RESET_SECRET` to `.env` to the same value as `devOnboardingResetSecret` in [`src/environments/environment.development.ts`](src/environments/environment.development.ts) (default: `local-dev-onboarding-reset`; see backend `.env.example`). Do not set `NODE_ENV=production` locally. Restart the API after editing `.env`.
3. Run `ng serve` (development build), open **Settings**, and use **QA: Reset onboarding sandbox**. That calls `POST /internal/dev/reset-onboarding-sandbox`, clears `gl_onboarding_v1` / `gl_onboarding_banner_dismiss_v1` in localStorage, and navigates to Home so guards can send you to `/welcome` when the log list is empty.

This control is omitted in production builds (`environment.production`).

## More

[Angular CLI documentation](https://angular.dev/tools/cli)
