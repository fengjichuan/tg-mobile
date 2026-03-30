import { apiPost } from './http';

/** 与 PC statistics-table-panel 一致：POST /logs/query */
export function queryLogs(params: {
  start_time: string;
  end_time: string;
  identifier_name: string;
  execution_mode: string;
  metric: string;
  limit: number;
  output_mode: string;
}) {
  return apiPost<{ list?: Record<string, unknown>[] }>(
    '/logs/query',
    params,
  );
}
