---
name: tg-mobile-test-deploy
description: >-
  Runs automated tests (when configured) and production build or run steps for
  mobile-h5 (Vite) and server (Fastify). Use when the user asks to run tests,
  deploy, ship, build for production, CI checks, or verify mobile-h5/server
  before release.
---

# tg-mobile — tests and deploy

Workspace root: repository root (sibling directories `mobile-h5/` and `server/`).

## 1. Automated tests

**Current state:** Neither `mobile-h5/package.json` nor `server/package.json` defines a `test` script. There is no shared root test runner.

**When the user asks to run automated tests:**

- Report that no test script is wired yet.
- If they add one later, run from the matching directory, for example:
  - `cd mobile-h5 && npm test`
  - `cd server && npm test`
- If a root-level script is added (e.g. `npm test` with workspaces), use that instead.

**Placeholder (fill in when tests exist):**

| Package   | Command (TBD) | Notes |
|-----------|-----------------|-------|
| mobile-h5 | _e.g. `npm run test`_ | _Vitest/Jest + RTL, etc._ |
| server    | _e.g. `npm run test`_ | _node:test, vitest, etc._ |

---

## 2. Deploy / production — `mobile-h5`

Static SPA: production output is **`mobile-h5/dist/`** after Vite build.

```bash
cd mobile-h5
npm ci
npm run build
```

- **`npm run build`**: runs `tsc --noEmit` then `vite build`.
- Upload or serve the contents of **`dist/`** behind your CDN or static host; configure API base URL / `VITE_*` at build time if required.

**Local smoke check of the built bundle:**

```bash
cd mobile-h5
npm run preview
```

(Default preview host/port are printed by Vite; often `http://localhost:4173`.)

---

## 3. Deploy / production — `server`

Node service: compile then run with Node.

```bash
cd server
npm ci
npm run build
npm start
```

- **`npm run build`**: `tsc` → output under **`server/dist/`**.
- **`npm start`**: `node dist/server.js`.
- Set **`PORT`**, **`HOST`**, **`DATA_DIR`**, **`PUBLIC_API_ORIGIN`** as documented in **`server/README.md`** for the target environment.

**Development (not deploy):**

```bash
cd server
npm run dev
```

---

## Agent checklist

1. **Tests** — If no `test` script exists, say so clearly; otherwise run the appropriate command and report exit code and relevant logs.
2. **mobile-h5 deploy** — `npm ci` (or `npm install` if user prefers) + `npm run build`; confirm `dist/` exists; optionally `npm run preview` for verification.
3. **server deploy** — `npm ci` + `npm run build` + `npm start` (or document env vars for the host); ensure Node **≥ 20** per `server/package.json`.

Do not assume Docker or cloud CLIs unless the repo adds them; stick to the scripts above unless the user specifies another path.
