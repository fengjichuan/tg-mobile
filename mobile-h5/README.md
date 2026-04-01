# TG Mobile H5

A **slim TG console for mobile**: after login, the home dashboard shows KPIs, traffic trends, a world map, recent activity, etc. API shape matches the PC dashboard so you can share one backend or gateway.

## Stack

| Area | Choice |
|------|--------|
| Build | Vite 6 + TypeScript |
| Framework | React 18, react-router-dom 6 |
| UI | **antd-mobile** (mobile components; not the heavy desktop UI from PC, for bundle size and touch) |
| Charts | ECharts 5 (`echarts/core` + on-demand registration) |
| HTTP | Axios with shared `baseURL`, interceptors, and business success checks |
| Time | dayjs |
| Copy | Lightweight i18n under `src/i18n/` (Chinese / English) |

## Requirements

- Node.js **≥ 18** (compatible with Vite 6; **20+** recommended)

## Install and run

```bash
cd mobile-h5
npm install
npm run dev
```

Dev server default: **`http://localhost:5174`** (LAN IP when `host: true`). Use the URL printed in the terminal.

```bash
npm run build    # typecheck + production build → dist/
npm run preview  # preview build locally
```

## Environment variables

Create `.env` or `.env.development` **in the `mobile-h5` folder** (Vite loads by `mode`). Copy **`.env.example`** to `.env` and adjust. Common variables:

| Variable | Description | Default / example |
|----------|-------------|-------------------|
| `VITE_API_PREFIX` | Axios `baseURL` (API path prefix) | If unset, **`/v1`** (dev uses same-origin proxy) |
| `VITE_DEV_API_TARGET` | Dev only: where Vite proxies `/v1` | If unset, **`http://192.168.44.3:8080`** (see `vite.config.ts`) |

**Against the repo’s Node mock** (`../server`):

```env
VITE_DEV_API_TARGET=http://127.0.0.1:8080
```

Backend details: **[../server/README.md](../server/README.md)**.

**Without `.env`**: `baseURL` stays `/v1`; proxy target is the default IP in `vite.config.ts`, whether or not you copied the example file.

## API and proxy

- The browser calls **`/v1/...`** only (same as `VITE_API_PREFIX`); Vite forwards to `VITE_DEV_API_TARGET` to avoid CORS.
- If production serves static files and API on the same origin with prefix `/v1`, keep `VITE_API_PREFIX=/v1`. For a full gateway URL, set `https://your-host/v1` and **adjust or disable** the dev proxy.

### Auth

- Login: **`POST /v1/users/login`** (`skipAuth`), same contract as PC.
- On success, `token` is stored in **`sessionStorage`** and in the **`tsg-token` Cookie** (`path=/`) for same-site sharing with PC.
- Other requests send **`Authorization: <token>`** (same as PC Axios, no `Bearer` prefix).
- Some business codes or HTTP **401** clear the token and redirect to **`/login`** (see `src/api/http.ts`).

### Home-related APIs (examples)

Aligned with `src/api/dashboard.ts`, `schema.ts`, etc.:

- `GET /dashboards/traffic-overview`, `traffic-summary`, `traffic-map`
- `GET /dashboards/activity`, `policy-summary`, `firewall-summary`
- `GET /resources/schema?auditable=true` (recent activity resource labels)
- Extend as needed (e.g. `logQuery`)

Mock data and routes live in the **`server`** project.

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirect: logged in → `/home`, else → `/login` |
| `/login` | Login page |
| `/home` | Home dashboard (KPIs, charts, map, activity); **no PC sidebar/footer**; top-right logout clears session only |

Protected routes use **`ProtectedRoute`** and depend on a local token.

## `src/` layout (summary)

```
src/
  api/           # HTTP layer and feature APIs
  auth/          # Token read/write, cookies aligned with PC
  components/    # Shared UI (charts, map, layout)
  dashboard/     # Home panels and cards
  i18n/          # Messages and provider
  utils/         # Time ranges, dashboard parsing helpers
```

## Relationship to PC

- Paths, success envelope (`code` / `success` / `data`), login, and `Authorization` follow PC where possible for one gateway or OpenAPI.
- UI and routes are trimmed independently; not a copy of the full PC menu.
