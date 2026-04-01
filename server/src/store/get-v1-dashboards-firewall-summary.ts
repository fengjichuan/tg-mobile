import { ensureAndReadStoreJson } from '../lib/jsonFile.js';

const BASE = 'get_v1_dashboards_firewall_summary';

export function loadGetV1DashboardsFirewallSummaryData(): unknown {
  return ensureAndReadStoreJson(BASE, {});
}
