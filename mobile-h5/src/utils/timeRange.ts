import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Parse local `YYYY-MM-DD HH:mm:ss` in the system timezone and emit UTC ISO like PC:
 * `YYYY-MM-DDTHH:mm:ssZ` (**no milliseconds**).
 *
 * Context:
 * - PC sends e.g. `2026-03-30T08:52:04Z` and gets valid data.
 * - H5 used to send `YYYY-MM-DD HH:mm:ss` (spaces as `+` in URLs), shifting the query window vs PC.
 * - Backend may 500 on `...:ss.SSSZ`; we always strip milliseconds.
 */
export function toApiUtcTimeString(localDateTime: string): string {
  const tz = dayjs.tz.guess();
  return dayjs
    .tz(localDateTime, 'YYYY-MM-DD HH:mm:ss', tz)
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss[Z]');
}

/** Last N hours in local time as yyyy-MM-DD HH:mm:ss */
export function lastHoursLocalRange(hours: number): [string, string] {
  const end = dayjs();
  const start = end.subtract(hours, 'hour');
  return [
    start.format('YYYY-MM-DD HH:mm:ss'),
    end.format('YYYY-MM-DD HH:mm:ss'),
  ];
}

/** traffic-overview: 1D / 7D / etc. (aligned with PC calculateTimeRange) */
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
