import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * 将本地「YYYY-MM-DD HH:mm:ss」解析为时刻，再格式化为 UTC 的「YYYY-MM-DD HH:mm:ss」。
 * 后端（Java）按 PC 侧约定解析该格式，不接受带 T/Z 的 ISO-8601（否则会 DateTimeParseException index 10）。
 */
export function toApiUtcTimeString(localDateTime: string): string {
  return dayjs(localDateTime).utc().format('YYYY-MM-DD HH:mm:ss');
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
