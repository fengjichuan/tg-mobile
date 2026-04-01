import { Card, DotLoading, ErrorBlock } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { isApiSuccess } from '../api/http';
import {
  getDashboardActivity,
  getFirewallSummary,
  getPolicyHitByAction,
  getPolicySummary,
  getStatisticsTemplateCharts,
  getTrafficMap,
  getTrafficOverview,
  getTrafficSummary,
} from '../api/dashboard';
import { queryLogs } from '../api/logQuery';
import { fetchResourceSchema } from '../api/schema';
import { fetchCurrentUser } from '../api/user';
import { TrafficTrendChart } from '../components/TrafficTrendChart';
import { TrafficWorldMap } from '../components/TrafficWorldMap';
import type { TrafficMapRow } from '../utils/trafficMapGeo';
import { useI18n } from '../i18n/i18n';
import { unwrapDashboardData } from '../utils/dashboardPayload';
import {
  extractTrafficSummaryFromResponse,
  trendRowsToChartSeries,
} from '../utils/trafficSummary';
import {
  formatBitsPerSec,
  formatBytes,
  formatNumber,
} from '../utils/format';
import {
  lastHoursLocalRange,
  rangeForLabel,
  toApiUtcTimeString,
} from '../utils/timeRange';

function shell(title: string, children: React.ReactNode) {
  return (
    <Card title={title} style={{ background: 'var(--card-bg)' }}>
      {children}
    </Card>
  );
}

function LoadState({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <DotLoading />
      </div>
    );
  }
  if (error) {
    return <ErrorBlock status="default" title={error} />;
  }
  return <>{children}</>;
}

export function GreetingCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ip, setIp] = useState('—');
  const [time, setTime] = useState('—');
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const body = await fetchCurrentUser();
        if (!isApiSuccess(body)) {
          throw new Error(body.message || 'Failed to load user profile');
        }
        const u = body.data;
        if (!cancel && u) {
          setName(u.name || u.username || '—');
          setIp(u.last_login_ip || '—');
          setTime(
            u.last_login_time
              ? dayjs(u.last_login_time).format('YYYY-MM-DD HH:mm')
              : '—',
          );
          const rl = u.role_list || [];
          setRoles(
            rl
              .map((r: { name?: string }) => r?.name)
              .filter(Boolean) as string[],
          );
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.greeting'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{name || '—'}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
        {t('panel.greeting')}: {time}
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
        IP: {ip}
      </div>
      {roles.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          Roles: {roles.join(', ')}
        </div>
      )}
    </LoadState>,
  );
}

export function TrafficOverviewCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<
    { label: string; value: string }[] | null
  >(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { start, end } = rangeForLabel('1D');
        const body = await getTrafficOverview({
          start_time: toApiUtcTimeString(start),
          end_time: toApiUtcTimeString(end),
        });
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const d =
          unwrapDashboardData<Record<string, any>>(body, [
            'real_time_traffic',
            'active_sessions',
          ]) ?? {};
        const rt = d.real_time_traffic;
        const act = d.active_sessions;
        if (!cancel) {
          setStats([
            {
              label: t('traffic.avg_rate'),
              value: formatBitsPerSec(rt?.avg_bits_per_sec),
            },
            {
              label: t('traffic.active_sessions'),
              value: formatNumber(act?.current_active_sessions),
            },
            {
              label: t('traffic.incoming'),
              value: formatBitsPerSec(rt?.avg_in_bits_per_sec),
            },
            {
              label: t('traffic.outgoing'),
              value: formatBitsPerSec(rt?.avg_out_bits_per_sec),
            },
          ]);
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.traffic_overview'),
    <LoadState loading={loading} error={error}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {stats?.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </LoadState>,
  );
}

export function TrafficTrendsCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgBits, setAvgBits] = useState<string>('—');
  const [chart, setChart] = useState<{
    categories: string[];
    inbound: number[];
    outbound: number[];
  }>({ categories: [], inbound: [], outbound: [] });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [start, end] = lastHoursLocalRange(24);
        const body = await getTrafficSummary({
          start_time: toApiUtcTimeString(start),
          end_time: toApiUtcTimeString(end),
        });
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const { list, avg_bits_per_sec } = extractTrafficSummaryFromResponse(body);
        if (!cancel) {
          setAvgBits(formatBitsPerSec(avg_bits_per_sec));
          setChart(trendRowsToChartSeries(list));
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.traffic_trends'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {t('traffic.current_avg')}: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{avgBits}</span>
      </div>
      <TrafficTrendChart
        categories={chart.categories}
        inboundBps={chart.inbound}
        outboundBps={chart.outbound}
        emptyHint={t('traffic.trend_empty')}
      />
    </LoadState>,
  );
}

export function RecentActivityCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [typeMap, setTypeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [schemaRes, actRes] = await Promise.all([
          fetchResourceSchema(),
          getDashboardActivity({ page_no: 1, page_size: 8 }),
        ]);
        if (!cancel && isApiSuccess(schemaRes) && Array.isArray(schemaRes.data)) {
          const m: Record<string, string> = {};
          schemaRes.data.forEach((row: { type?: string; label?: string }) => {
            if (row.type) m[row.type] = row.label || row.type;
          });
          setTypeMap(m);
        }
        if (!isApiSuccess(actRes)) {
          throw new Error(actRes.message || t('common.load_failed'));
        }
        if (!cancel) {
          setItems((actRes.data as { list?: any[] })?.list || []);
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.recent_activity'),
    <LoadState loading={loading} error={error}>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid rgba(139, 155, 180, 0.2)',
              fontSize: 12,
            }}
          >
            <div style={{ color: 'var(--text-primary)' }}>
              {typeMap[it.resource_type] || it.resource_type || '—'}{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                ·{' '}
                {it.op_type === 'create'
                  ? t('activity.create')
                  : it.op_type === 'edit'
                    ? t('activity.edit')
                    : it.op_type === 'delete'
                      ? t('activity.delete')
                      : it.op_type === 'import'
                        ? t('activity.import')
                        : it.op_type === 'export'
                          ? t('activity.export')
                          : String(it.op_type || '')}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {it.op_time
                ? dayjs(it.op_time).format('YYYY-MM-DD HH:mm:ss')
                : ''}
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('activity.none')}</div>
        )}
      </div>
    </LoadState>,
  );
}

export function TrafficMapCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBytes, setTotalBytes] = useState('—');
  const [uniqDest, setUniqDest] = useState('—');
  const [countries, setCountries] = useState(0);
  const [mapList, setMapList] = useState<TrafficMapRow[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [start, end] = lastHoursLocalRange(24);
        const body = await getTrafficMap({
          start_time: toApiUtcTimeString(start),
          end_time: toApiUtcTimeString(end),
        });
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const d =
          unwrapDashboardData<Record<string, any>>(body, [
            'total_bytes',
            'source_country_list',
            'unique_destination_ip',
            'list',
          ]) ?? {};
        if (!cancel) {
          setTotalBytes(formatBytes(d.total_bytes));
          setUniqDest(
            d.unique_destination_ip != null
              ? String(d.unique_destination_ip)
              : '—',
          );
          setCountries(
            Array.isArray(d.source_country_list)
              ? d.source_country_list.length
              : 0,
          );
          setMapList(
            Array.isArray(d.list) ? (d.list as TrafficMapRow[]) : [],
          );
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.traffic_map_summary'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 13 }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>{t('traffic.total_traffic')} </span>
          <strong>{totalBytes}</strong>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('traffic.dest_ip_count')} </span>
          <strong>{uniqDest}</strong>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('traffic.source_country_count')} </span>
          <strong>{countries}</strong>
        </div>
      </div>
      {!loading && !error ? <TrafficWorldMap list={mapList} /> : null}
    </LoadState>,
  );
}

export function FirewallCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const body = await getFirewallSummary();
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const d = body.data as { list?: any[] };
        if (!cancel) setList(d?.list || []);
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.firewalls'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <strong>{list.length}</strong>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {list.slice(0, 5).map((f) => (
          <div key={f.uuid || f.id || f.name} style={{ marginTop: 4 }}>
            {f.name || f.hostname || f.uuid || '—'}
          </div>
        ))}
      </div>
    </LoadState>,
  );
}

export function ObjectSummaryCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState('—');
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const body = await getPolicySummary();
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const usage = (body.data as any)?.object_usage;
        if (!cancel && Array.isArray(usage)) {
          const sum = usage.reduce(
            (a: number, it: any) => a + (Number(it.object_count) || 0),
            0,
          );
          setTotal(formatNumber(sum));
          setLines(
            usage
              .slice(0, 5)
              .map(
                (it: any) =>
                  `${it.object_type || '—'}: ${formatNumber(it.object_count)}`,
              ),
          );
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.object_summary'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{total}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('panel.object_summary')}</div>
      {lines.map((t) => (
        <div key={t} style={{ fontSize: 12, marginTop: 6 }}>
          {t}
        </div>
      ))}
    </LoadState>,
  );
}

export function PolicySummaryCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState('—');
  const [security, setSecurity] = useState('—');
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const body = await getPolicySummary();
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const usage = (body.data as any)?.rule_usage;
        if (!cancel && Array.isArray(usage)) {
          const en = usage.reduce(
            (a: number, it: any) => a + (Number(it.enable_rule_count) || 0),
            0,
          );
          setEnabled(formatNumber(en));
          const sec = usage.find((it: any) => it.policy_type === 'security');
          setSecurity(formatNumber(sec?.enable_rule_count));
          setLines(
            usage
              .slice(0, 5)
              .map(
                (it: any) =>
                  `${it.policy_type || '—'}: ${formatNumber(it.enable_rule_count)}`,
              ),
          );
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.policy_summary'),
    <LoadState loading={loading} error={error}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Enabled</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{enabled}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Security enabled</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{security}</div>
        </div>
      </div>
      {lines.map((t) => (
        <div key={t} style={{ fontSize: 12, marginTop: 8, color: 'var(--text-secondary)' }}>
          {t}
        </div>
      ))}
    </LoadState>,
  );
}

const TOP_TYPES = {
  'top-source-ips': {
    titleKey: 'top.source_ips',
    identifier: 'traffic-sketch-top-source-ip',
    pick: (r: Record<string, unknown>) =>
      `${r.source_ip || '—'} · ${formatBytes(Number(r.bytes) || 0)}`,
  },
  'top-destination-ips': {
    titleKey: 'top.destination_ips',
    identifier: 'traffic-sketch-top-destination-ip',
    pick: (r: Record<string, unknown>) =>
      `${r.destination_ip || '—'} · ${formatBytes(Number(r.bytes) || 0)}`,
  },
  'top-applications': {
    titleKey: 'top.applications',
    identifier: 'traffic-sketch-top-application',
    pick: (r: Record<string, unknown>) =>
      `${r.application || '—'} · ${formatBytes(Number(r.bytes) || 0)}`,
  },
  'top-destination-countries': {
    titleKey: 'top.destination_countries',
    identifier: 'traffic-sketch-top-destination-country',
    pick: (r: Record<string, unknown>) =>
      `${r.destination_country || r.country_region || '—'} · ${formatBytes(Number(r.bytes) || 0)}`,
  },
  'top-destination-fqdns': {
    titleKey: 'top.destination_fqdns',
    identifier: 'traffic-sketch-top-fqdn',
    pick: (r: Record<string, unknown>) =>
      `${r.fqdn || '—'} · ${formatBytes(Number(r.bytes) || 0)}`,
  },
} as const;

export function TopListCard({ kind }: { kind: keyof typeof TOP_TYPES }) {
  const { t } = useI18n();
  const spec = TOP_TYPES[kind];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<string[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [start, end] = lastHoursLocalRange(24);
        const body = await queryLogs({
          start_time: toApiUtcTimeString(start),
          end_time: toApiUtcTimeString(end),
          identifier_name: spec.identifier,
          execution_mode: 'oneshot',
          metric: 'bytes',
          limit: 8,
          output_mode: 'json',
        });
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const list = (body.data as { list?: Record<string, unknown>[] })?.list || [];
        if (!cancel) {
          setRows(list.map((r) => spec.pick(r)));
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [kind]);

  return shell(
    t(spec.titleKey),
    <LoadState loading={loading} error={error}>
      {rows.map((t) => (
        <div
          key={t}
          style={{
            fontSize: 12,
            padding: '6px 0',
            borderBottom: '1px solid rgba(139,155,180,0.15)',
          }}
        >
          {t}
        </div>
      ))}
      {rows.length === 0 && !loading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('common.no_data')}</div>
      )}
    </LoadState>,
  );
}

export function PolicyHitCard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [denyRate, setDenyRate] = useState('—');
  const [denyTotal, setDenyTotal] = useState('—');

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [start, end] = lastHoursLocalRange(24);
        const body = await getPolicyHitByAction({
          start_time: toApiUtcTimeString(start),
          end_time: toApiUtcTimeString(end),
        });
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const list = (body.data as { list?: any[] })?.list || [];
        const deny = list.filter(
          (it) => String(it.action).toLowerCase() === 'deny',
        );
        if (!cancel && deny.length) {
          const last = deny[deny.length - 1];
          setDenyRate(formatBitsPerSec(last.avg_bits_per_sec));
          setDenyTotal(formatNumber(last.total_hit_count ?? last.total_bytes));
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return shell(
    t('panel.policy_hit_deny'),
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('panel.policy_hit_deny')}</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{denyRate}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>Total</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{denyTotal}</div>
    </LoadState>,
  );
}

export function CustomStatisticsCard({ chartUuid }: { chartUuid: string | null }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(t('panel.custom_statistics'));
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    if (!chartUuid) {
      setLoading(false);
      setDetail(t('common.no_data'));
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const body = await getStatisticsTemplateCharts([chartUuid]);
        if (!isApiSuccess(body)) {
          throw new Error(body.message || t('common.request_failed'));
        }
        const list = (body.data as { list?: any[] })?.list || [];
        const first = list[0];
        if (!cancel) {
          setTitle(first?.name || first?.title || t('panel.custom_statistics'));
          const points =
            first?.time_series?.length ??
            first?.data?.length ??
            first?.values?.length ??
            0;
          setDetail(
            points
              ? `Loaded chart config. About ${points} points (summary only on mobile).`
              : JSON.stringify(first ?? {}).slice(0, 200),
          );
        }
      } catch (e: unknown) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : t('common.load_failed'));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [chartUuid]);

  return shell(
    title,
    <LoadState loading={loading} error={error}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {detail}
      </div>
    </LoadState>,
  );
}
