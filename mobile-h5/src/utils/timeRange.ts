import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将本地「YYYY-MM-DD HH:mm:ss」按当前系统时区解析，并输出为与 PC 端一致的 UTC ISO 字符串：
 * `YYYY-MM-DDTHH:mm:ssZ`（注意：**不带毫秒**）。
 *
 * 背景：
 * - PC 请求示例：`2026-03-30T08:52:04Z`（可正常返回数据）
 * - H5 之前发的是 `YYYY-MM-DD HH:mm:ss`（URL 中会编码为空格 `+`），导致后端解析/查询窗口与 PC 不一致
 * - 后端对 `...:ss.SSSZ`（带毫秒）可能会 500，因此这里强制无毫秒
 */
export function toApiUtcTimeString(localDateTime: string): string {
  const tz = dayjs.tz.guess();
  return dayjs
    .tz(localDateTime, 'YYYY-MM-DD HH:mm:ss', tz)
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss[Z]');
}

/** 最近 N 小时的本地起止，格式 yyyy-MM-DD HH:mm:ss */
export function lastHoursLocalRange(hours: number): [string, string] {
  const end = dayjs();
  const start = end.subtract(hours, 'hour');
  return [
    start.format('YYYY-MM-DD HH:mm:ss'),
    end.format('YYYY-MM-DD HH:mm:ss'),
  ];
}

/** traffic-overview：1D / 7D 等（对齐 PC calculateTimeRange） */
export function rangeForLabel(
  label: '1D' | '7D' | '1M',
): { start: string; end: string } {
  const end = dayjs();
  let start = end;
  if (label === '1D') start = end.subtract(1, 'day');
  if (label === '7D') start = end.subtract(7, 'day');
  if (label === '1M') start = end.subtract(1, 'month');
  return {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    end: end.format('YYYY-MM-DD HH:mm:ss'),
  };
}
