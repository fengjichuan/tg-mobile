import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_traffic_overview';

export function loadGetV1DashboardsTrafficOverviewData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
