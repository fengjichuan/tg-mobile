import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_policy_summary';

export function loadGetV1DashboardsPolicySummaryData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
