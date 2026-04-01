# tg-mobile-api

Lightweight Node service for **mobile-h5**: Fastify + OpenAPI (Swagger UI). Business data lives as **JSON files** under `data/store/` for local integration and quick edits.

## Requirements

- Node.js **≥ 20**

## Install and run

```bash
cd server
npm install
npm run dev
```

Default listen address: **`http://0.0.0.0:8080`** (use `http://127.0.0.1:8080` locally).

Production:

```bash
npm run build
npm start
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port | `8080` |
| `HOST` | Bind address | `0.0.0.0` |
| `DATA_DIR` | Data root (`store/` under it holds per-endpoint JSON) | `server/data` |
| `PUBLIC_API_ORIGIN` | Service root URL for OpenAPI “Try it out” (no path prefix) | `http://127.0.0.1:<PORT>` |

## Integrating with H5

mobile-h5 calls APIs with `VITE_API_PREFIX=/v1`; Vite proxies to the backend in dev. Point **`VITE_DEV_API_TARGET`** in **`.env`** at this service, e.g.:

```env
VITE_DEV_API_TARGET=http://127.0.0.1:8080
```

## OpenAPI

After start:

- **Swagger UI**: `http://127.0.0.1:8080/docs`
- **OpenAPI JSON**: `http://127.0.0.1:8080/docs/json`

## Layout conventions

| Path | Description |
|------|-------------|
| `src/routes/` | **One file per route**, full path (e.g. `/v1/dashboards/traffic-overview`) |
| `src/store/` | **One module per API**, reads/writes `data/store/<basename>.json` |
| `src/lib/` | Non-domain helpers (JSON IO, `okEnvelope`) |
| `data/store/*.example.json` | Sample payloads; if no matching `.json` exists, it is copied from example on first read |
| `scripts/` | Generators for large fixtures (e.g. traffic trend points) |

Runtime `data/store/*.json` (not `*.example.json`) is **gitignored** so local sessions and edits are not committed.

## Scripts

```bash
npm run generate-fixtures
```

Regenerates script-maintained examples (traffic summary, traffic map, resource schema, etc.); commit `*.example.json` as needed.

## Auth

- **`POST /v1/users/login`**: validates credentials and writes `sessions` in `post_v1_users_login.json`.
- **`GET /v1/users/-`**: requires **`Authorization`** (same `token` as login, bare or `Bearer <token>`); user profile from `get_v1_users_dash.json`.
- Other **dashboard / resources** routes are **open mocks** for home debugging without login; add the same login-store checks as production if needed.
