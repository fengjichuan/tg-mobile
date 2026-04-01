# tg-mobile

This repository brings together **TG product front ends and a local mock API**: the desktop console (PC), a slim mobile H5 console, and an optional **lightweight Node API** (JSON-backed so H5 can integrate without a full backend).

The three parts are **independent**: install dependencies, run, and build inside each folder; there is no root-level `npm workspaces`. Start one or more subprojects as needed.

---

## Overview

| Directory | Role | Description |
|-----------|------|-------------|
| **`pc/`** | Desktop web console | Full Umi + React admin UI (policies, logs, dashboards, etc.) against real gateways or test environments. |
| **`mobile-h5/`** | Mobile H5 | Phone-sized dashboard and login; API paths and auth align with PC, with UI and routes trimmed. |
| **`server/`** | Local API (optional) | Fastify + OpenAPI; data in `data/store/` JSON files for H5 (or scripts) when no backend is available. |

Typical setups:

- **H5 + mock only**: run `server` + `mobile-h5`, and point H5 `VITE_DEV_API_TARGET` at the local `server` port.  
- **H5 against a real gateway**: run `mobile-h5` only and set the proxy target in `.env` to the real backend.  
- **Full PC**: follow `pc/` docs; no dependency on `server/`.

---

## Repository layout

```
tg-mobile/
├── README.md                 # This file: repo overview
├── pc/                       # Desktop console (Umi)
│   └── README.md             # PC build, commit conventions, etc.
├── mobile-h5/                # Mobile H5 (Vite + React)
│   ├── README.md             # H5 env, proxy, routes, APIs
│   └── .env.example          # Example dev environment variables
└── server/                   # Node mock API (Fastify)
    └── README.md             # Port, DATA_DIR, OpenAPI, JSON store conventions
```

Each subdirectory also has `src/`, `package.json`, etc.; see the matching **README**.

---

## Subprojects and commands

Run these **inside the matching directory** (after `npm install`).

### `pc/` — desktop console

| Command | Description |
|---------|-------------|
| `npm run dev` / `npm start` | Dev server (Umi; port from terminal output, often `8000` or team default) |
| `npm run build` | Production build |
| `npm run preview` | Preview build output (see `package.json` for default port) |

See **[pc/README.md](./pc/README.md)** for versions, Docker, and commit rules.

---

### `mobile-h5/` — mobile H5

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server, default **http://localhost:5174** (LAN access when `host: true`) |
| `npm run build` | Typecheck + Vite production build |
| `npm run preview` | Preview `dist/` locally |

Env vars, Vite `/v1` proxy, auth, and home APIs: **[mobile-h5/README.md](./mobile-h5/README.md)**. Copy **`mobile-h5/.env.example`** to `.env` as needed.

---

### `server/` — local mock API

| Command | Description |
|---------|-------------|
| `npm run dev` | `tsx watch` dev server, default **http://0.0.0.0:8080** |
| `npm run build` + `npm start` | Compile then run with Node |
| `npm run generate-fixtures` | Regenerate some `data/store/*.example.json` (e.g. traffic summary) |

OpenAPI UI: **`/docs`**. Env, data dir, `DATA_DIR`: **[server/README.md](./server/README.md)**.

---

## Debug H5 and `server` together

1. Terminal A: `cd server && npm install && npm run dev`  
2. Terminal B: set `VITE_DEV_API_TARGET=http://127.0.0.1:8080` in `mobile-h5/.env`, then `cd mobile-h5 && npm install && npm run dev`  
3. Open the H5 URL in the browser and log in with the sample account from `server/data/store/post_v1_users_login.example.json`.

More detail: **[server/README.md](./server/README.md)** and **[mobile-h5/README.md](./mobile-h5/README.md)**.
