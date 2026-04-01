# tg-mobile-api

面向 **mobile-h5** 的轻量 Node 服务：Fastify + OpenAPI（Swagger UI），业务数据以 **JSON 文件** 形式存放在 `data/store/`，便于本地联调与快速改数。

## 要求

- Node.js **≥ 20**

## 安装与运行

```bash
cd server
npm install
npm run dev
```

默认监听 **`http://0.0.0.0:8080`**（本机访问 `http://127.0.0.1:8080`）。

生产构建与启动：

```bash
npm run build
npm start
```

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | HTTP 端口 | `8080` |
| `HOST` | 监听地址 | `0.0.0.0` |
| `DATA_DIR` | 数据根目录（其下使用 `store/` 子目录存放各接口 JSON） | `server/data` |
| `PUBLIC_API_ORIGIN` | OpenAPI 文档里「Try it out」使用的服务根 URL（不含路径前缀） | `http://127.0.0.1:<PORT>` |

## 与 H5 联调

mobile-h5 通过 `VITE_API_PREFIX=/v1` 请求接口，开发环境下由 Vite 代理到后端。将 **`.env`** 中 `VITE_DEV_API_TARGET` 指到本服务即可，例如：

```env
VITE_DEV_API_TARGET=http://127.0.0.1:8080
```

## OpenAPI

启动后访问：

- **Swagger UI**：`http://127.0.0.1:8080/docs`
- **规范 JSON**：`http://127.0.0.1:8080/docs/json`

## 目录约定

| 路径 | 说明 |
|------|------|
| `src/routes/` | **一路由一文件**，注册完整路径（如 `/v1/dashboards/traffic-overview`） |
| `src/store/` | **一接口一模块**，只负责读写对应的 `data/store/<basename>.json` |
| `src/lib/` | 与业务无关的工具（如 JSON 读写、`okEnvelope`） |
| `data/store/*.example.json` | 各接口的示例数据；若不存在同名 `.json`，首次读取时会从 example 复制 |
| `scripts/` | 生成部分大型 fixture 的脚本（如流量趋势点列表） |

运行期生成的 `data/store/*.json`（非 `*.example.json`）默认已加入 `.gitignore`，避免把本地会话与改动提交进仓库。

## 脚本

```bash
npm run generate-fixtures
```

会重新生成部分由脚本维护的示例文件（流量摘要、流量地图、资源 schema 等），再按需提交 `*.example.json`。

## 鉴权说明

- **`POST /v1/users/login`**：校验账号并写入 `post_v1_users_login.json` 中的 `sessions`。
- **`GET /v1/users/-`**：依赖请求头 **`Authorization`**（与登录返回的 `token` 一致，可为裸 token 或 `Bearer <token>`），并从 `get_v1_users_dash.json` 读取用户资料。
- 其余 **dashboard / resources** 类接口当前为 **公开 mock**，便于无登录调试首页；若需与生产一致，可在对应路由上增加与登录 store 相同的校验逻辑。
