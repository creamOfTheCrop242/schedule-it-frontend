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

## More

[Angular CLI documentation](https://angular.dev/tools/cli)
