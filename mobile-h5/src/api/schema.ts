import { apiGet } from './http';

/** Matches PC recent-activity: GET /resources/schema?auditable=true */
export function fetchResourceSchema() {
  return apiGet<{ type?: string; label?: string }[]>('/resources/schema', {
    auditable: true,
  } as Record<string, unknown>);
}
