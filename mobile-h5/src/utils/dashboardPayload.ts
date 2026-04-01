import type { ApiBody } from '../api/http';

/**
 * Unwrap dashboard `data`: supports { code, data: T }, double wrap { data: { data: T } },
 * and fields on the response root (same shapes PC axios returns).
 */
export function unwrapDashboardData<T extends Record<string, unknown>>(
  body: ApiBody<unknown>,
  markerKeys: string[],
): T | undefined {
  const tryMatch = (candidate: unknown): T | undefined => {
    if (candidate == null || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return undefined;
    }
    const o = candidate as T;
    if (markerKeys.some((k) => k in (o as object))) {
      return o;
    }
    return undefined;
  };

  const nested = body.data as Record<string, unknown> | undefined;
  if (nested && typeof nested.data === 'object' && nested.data !== null) {
    const inner = tryMatch(nested.data);
    if (inner) return inner;
  }

  const direct = tryMatch(body.data);
  if (direct) return direct;

  return tryMatch(body as unknown);
}
