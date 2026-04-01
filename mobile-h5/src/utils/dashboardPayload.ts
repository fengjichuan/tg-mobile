import type { ApiBody } from '../api/http';

/**
 * 解包 dashboard 类接口的 data：兼容标准 { code, data: T }、双包一层 { data: { data: T } }，
 * 以及少数场景下业务字段在响应根上的情况（与 PC axios 拿到的一致结构）。
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
