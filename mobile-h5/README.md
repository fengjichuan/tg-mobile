# TG Mobile H5（最小 Demo）

## 技术选型说明

- **构建**：Vite + React 18 + TypeScript  
- **UI**：**antd-mobile**（推荐用于本移动最小集；**不建议**沿用 PC 端 MUI：体积大、默认交互偏桌面，移动端手势与适配成本高）  
- **图表**：ECharts 5，使用 `echarts/core` + 按需组件注册  

## 运行

```bash
cd mobile-h5
npm install
npm run dev
```

默认请求前缀为 `VITE_API_PREFIX`（默认 `/v1`），开发时由 Vite 代理到后端，与 PC 项目 `config/proxy.ts` 一致。可复制 `.env.example` 为 `.env.development` 并修改 `VITE_DEV_API_TARGET`（默认 `http://192.168.44.3:8080`）。

登录调用 **`POST /v1/users/login`**（与 PC `api/user.ts` 相同），成功后保存返回的 `token` 到 `sessionStorage`，后续请求带 **`Authorization: <token>`**（与 PC Axios 拦截器一致）。

首页各卡片调用与 PC dashboard 同源接口，例如：`/dashboards/traffic-overview`、`/dashboards/traffic-summary`、`/dashboards/activity`、`/logs/query` 等。

## 页面

- `/login`：登录  
- `/home`：仅仪表盘（KPI 卡片 + 流量趋势图），**无侧栏/底部导航/其他业务菜单**；右上角「退出」仅用于清空会话  
