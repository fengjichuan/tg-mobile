# TG Mobile H5

面向移动端的 **TG 控制台精简版**：登录后进入首页仪表盘（KPI、流量趋势、世界地图、近期活动等），接口形态与 PC 端 Dashboard 对齐，便于同一后端或网关联调。

## 技术栈

| 类别 | 选型 |
|------|------|
| 构建 | Vite 6 + TypeScript |
| 框架 | React 18、react-router-dom 6 |
| UI | **antd-mobile**（移动端组件；不沿用 PC 端重型桌面 UI 库，以控制体积与手势体验） |
| 图表 | ECharts 5（`echarts/core` + 按需注册） |
| 请求 | Axios，统一 `baseURL`、拦截器与业务成功码判断 |
| 时间 | dayjs |
| 文案 | 简易 i18n（`src/i18n/`，含中/英） |

## 环境要求

- Node.js **≥ 18**（与 Vite 6 兼容即可，推荐 **20+**）

## 安装与运行

```bash
cd mobile-h5
npm install
npm run dev
```

开发服务器默认 **`http://localhost:5174`**（`host: true` 时可用局域网 IP 访问）。浏览器打开控制台输出的地址即可。

```bash
npm run build    # 类型检查 + 生产构建，产物在 dist/
npm run preview  # 本地预览构建结果
```

## 环境变量

在 **`mobile-h5` 目录**下创建 `.env` 或 `.env.development`（Vite 按 `mode` 加载）。可复制 **`.env.example`** 为 `.env` 后按需修改。常用项如下：

| 变量 | 说明 | 默认 / 示例 |
|------|------|-------------|
| `VITE_API_PREFIX` | Axios `baseURL`，即所有接口路径前缀 | 未设置时为 **`/v1`**（开发走同源代理） |
| `VITE_DEV_API_TARGET` | 仅开发：`/v1` 被 Vite 代理到的后端根地址 | 未设置时为 **`http://192.168.44.3:8080`**（见 `vite.config.ts`） |

**本地联调仓库内 Node Mock 服务**（`../server`）时，可设置：

```env
VITE_DEV_API_TARGET=http://127.0.0.1:8080
```

更多后端说明见 **[../server/README.md](../server/README.md)**。

**无 `.env` 时**：`baseURL` 仍为 `/v1`，代理目标为 `vite.config.ts` 中的上述默认 IP，与是否复制示例文件无关。

## API 与代理

- 浏览器只请求 **`/v1/...`**（与 `VITE_API_PREFIX` 一致），由 Vite 开发服务器转发到 `VITE_DEV_API_TARGET`，避免浏览器直连跨域。
- 若生产部署将静态页与 API 同域且网关前缀为 `/v1`，可保持 `VITE_API_PREFIX=/v1`；若需直连完整网关 URL，将其设为 `https://your-host/v1` 并**关闭或调整**开发代理策略。

### 鉴权

- 登录：**`POST /v1/users/login`**（`skipAuth`），与 PC 侧约定一致。
- 成功后将 `token` 写入 **`sessionStorage`**，并写入 **`tsg-token` Cookie**（`path=/`），便于与 PC 同域共享会话。
- 其余请求在请求头携带 **`Authorization: <token>`**（与 PC Axios 行为一致，非 `Bearer` 前缀）。
- 部分业务码或 HTTP **401** 会清空 token 并跳转 **`/login`**（见 `src/api/http.ts`）。

### 首页相关接口（示例）

与 `src/api/dashboard.ts`、`schema.ts` 等一致，主要包括：

- `GET /dashboards/traffic-overview`、`traffic-summary`、`traffic-map`
- `GET /dashboards/activity`、`policy-summary`、`firewall-summary`
- `GET /resources/schema?auditable=true`（近期活动资源类型文案）
- 其他能力按页面按需扩展（如 `logQuery` 等）

具体 Mock 数据与路由实现见 **`server`** 工程。

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 重定向（已登录 → `/home`，否则 → `/login`） |
| `/login` | 登录页 |
| `/home` | 首页仪表盘（KPI、图表、地图、活动列表等），**无 PC 侧栏/底栏**；右上角退出仅清会话 |

受保护路由由 **`ProtectedRoute`** 包裹，依赖本地 token 是否存在。

## 目录结构（摘要）

```
src/
  api/           # HTTP 封装与各业务 API
  auth/          # token 读写、Cookie 与 PC 对齐
  components/    # 通用组件（图表、地图、布局等）
  dashboard/     # 首页面板与卡片
  i18n/          # 文案与 Provider
  utils/         # 时间范围、dashboard 数据解析等工具
```

## 与 PC 端的关系

- 接口路径、成功响应结构（`code` / `success` / `data`）、登录与 Authorization 习惯尽量与 PC 对齐，便于共用网关或同一 OpenAPI。
- UI 与路由独立裁剪，不复制 PC 全量菜单与页面。
