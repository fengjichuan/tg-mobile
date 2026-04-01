import dayjs from 'dayjs';

import type { ApiBody } from '../api/http';
import { unwrapDashboardData } from './dashboardPayload';

function looksLikeTrendRow(x: unknown): x is Record<string, unknown> {
  if (typeof x !== 'object' || x == null) return false;
  const o = x as Record<string, unknown>;
  return (
    'stat_time' in o ||
    'statTime' in o ||
    'time' in o ||
    'timestamp' in o ||
    'avg_in_bits_per_sec' in o ||
    'avgInBitsPerSec' in o ||
    'avg_out_bits_per_sec' in o ||
    'avgOutBitsPerSec' in o
  );
}

function isTrendPointArray(arr: unknown): arr is Record<string, unknown>[] {
  return Array.isArray(arr) && arr.length > 0 && looksLikeTrendRow(arr[0]);
}

/** 在嵌套对象中查找趋势点数组（对齐后端可能用的 list / items / records 等字段名） */
function deepFindTrendList(obj: unknown, depth = 0): Record<string, unknown>[] | null {
  if (depth > 10 || obj == null || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    return isTrendPointArray(obj) ? obj : null;
  }
  const o = obj as Record<string, unknown>;
  const preferKeys = ['list', 'items', 'records', 'series', 'points', 'rows', 'values'];
  for (const key of preferKeys) {
    const v = o[key];
    if (isTrendPointArray(v)) return v;
  }
  for (const v of Object.values(o)) {
    const found = deepFindTrendList(v, depth + 1);
    if (found) return found;
  }
  return null;
}

function pickAvgBits(data: unknown): number | undefined {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return undefined;
  const o = data as Record<string, unknown>;
  const v =
    o.avg_bits_per_sec ??
    o.avgBitsPerSec ??
    o.current_avg_bits_per_sec;
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * 从 /dashboards/traffic-summary 响应中取出 list 与 avg（兼容嵌套包层、驼峰字段、多种数组字段名）。
 */
export function extractTrafficSummaryFromResponse(body: ApiBody<unknown>): {
  list: Record<string, unknown>[];
  avg_bits_per_sec: number | undefined;
} {
  const base =
    unwrapDashboardData<Record<string, unknown>>(body, [
      'list',
      'avg_bits_per_sec',
    ]) ?? {};

  let list: Record<string, unknown>[] = Array.isArray(base.list)
    ? (base.list as Record<string, unknown>[])
    : [];
  let avg_bits_per_sec = pickAvgBits(base);

  if (list.length === 0) {
    const found = deepFindTrendList(body.data ?? body);
    if (found) list = found;
  }

  if (avg_bits_per_sec == null) {
    avg_bits_per_sec =
      pickAvgBits(body.data) ??
      (body.data &&
      typeof body.data === 'object' &&
      !Array.isArray(body.data) &&
      (body.data as Record<string, unknown>).data
        ? pickAvgBits((body.data as Record<string, unknown>).data)
        : undefined);
  }

  return { list, avg_bits_per_sec };
}

export function trendRowsToChartSeries(
  list: Record<string, unknown>[],
): {
  categories: string[];
  inbound: number[];
  outbound: number[];
} {
  const categories: string[] = [];
  const inbound: number[] = [];
  const outbound: number[] = [];

  for (const it of list) {
    const raw =
      it.stat_time ?? it.statTime ?? it.time ?? it.timestamp;
    let d = dayjs(raw as string | number | Date);
    if (!d.isValid() && typeof raw === 'number') {
      d = raw > 1e12 ? dayjs(raw) : dayjs.unix(raw);
    } else if (!d.isValid() && typeof raw === 'string') {
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        d = n > 1e12 ? dayjs(n) : dayjs.unix(n);
      }
    }
    categories.push(d.isValid() ? d.format('MM-DD HH:mm') : '—');
    inbound.push(
      Number(
        it.avg_in_bits_per_sec ??
          it.avgInBitsPerSec ??
          it.in_bits_per_sec ??
          it.inBitsPerSec ??
          0,
      ) || 0,
    );
    outbound.push(
      Number(
        it.avg_out_bits_per_sec ??
          it.avgOutBitsPerSec ??
          it.out_bits_per_sec ??
          it.outBitsPerSec ??
          0,
      ) || 0,
    );
  }

  return { categories, inbound, outbound };
}
