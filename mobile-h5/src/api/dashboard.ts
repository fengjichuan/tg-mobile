import { http, apiGet, isApiSuccess } from './http';

export type DashboardPanel = {
  id: string | number;
  type: string;
  grid_pos?: unknown;
  dataview?: { uuid?: string; rule_uuid?: string; template_uuid?: string };
};

export async function fetchDashboardPanels(): Promise<DashboardPanel[]> {
  const body = await apiGet<{ panels?: DashboardPanel[] }>('/dashboards');
  if (isApiSuccess(body) && Array.isArray(body.data?.panels)) {
    return body.data!.panels!;
  }
  return [];
}

export function getTrafficOverview(params: {
  start_time: string;
  end_time: string;
}) {
  return apiGet('/dashboards/traffic-overview', params as Record<string, unknown>);
}

export function getTrafficSummary(params: {
  start_time: string;
  end_time: string;
}) {
  return apiGet('/dashboards/traffic-summary', params as Record<string, unknown>);
}

export function getTrafficMap(params: {
  start_time: string;
  end_time: string;
}) {
  return apiGet('/dashboards/traffic-map', params as Record<string, unknown>);
}

export function getFirewallSummary() {
  return apiGet('/dashboards/firewall-summary');
}

export function getPolicySummary() {
  return apiGet('/dashboards/policy-summary');
}

export function getDashboardActivity(params: {
  page_no: number;
  page_size: number;
  created_after?: string;
}) {
  return apiGet('/dashboards/activity', params as Record<string, unknown>);
}

export function getPolicyHitByAction(params: {
  start_time: string;
  end_time: string;
}) {
  return apiGet(
    '/dashboards/security-policy-rule-hits-by-action',
    params as Record<string, unknown>,
  );
}

export async function getStatisticsTemplateCharts(chartUuids: string[]) {
  const usp = new URLSearchParams();
  chartUuids.forEach((u) => usp.append('chart_uuids', u));
  const res = await http.get<
    import('./http').ApiBody<{ list?: unknown[] }>
  >(`/dashboards/statistics-template-charts?${usp.toString()}`);
  return res.data;
}
