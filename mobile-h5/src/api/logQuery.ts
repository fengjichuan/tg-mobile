import { apiPost } from './http';

/** Matches PC statistics-table-panel: POST /logs/query */
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
