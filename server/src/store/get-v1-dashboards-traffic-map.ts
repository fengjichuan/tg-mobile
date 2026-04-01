import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_traffic_map';

export function loadGetV1DashboardsTrafficMapData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
