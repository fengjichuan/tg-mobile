import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_traffic_summary';

export function loadGetV1DashboardsTrafficSummaryData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
