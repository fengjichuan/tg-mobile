import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_activity';

export function loadGetV1DashboardsActivityData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
