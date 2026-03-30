import { apiGet } from './http';

/** 与 PC recent-activity 一致：GET /resources/schema?auditable=true */
export function fetchResourceSchema() {
  return apiGet<{ type?: string; label?: string }[]>('/resources/schema', {
    auditable: true,
  } as Record<string, unknown>);
}
