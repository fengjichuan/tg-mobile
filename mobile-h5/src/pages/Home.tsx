import { Button, Space } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logoutRequest } from '../api/auth';
import { fetchDashboardPanels } from '../api/dashboard';
import { clearToken } from '../auth/session';
import { useI18n } from '../i18n/i18n';
import {
  CustomStatisticsCard,
  FirewallCard,
  GreetingCard,
  ObjectSummaryCard,
  PolicyHitCard,
  PolicySummaryCard,
  RecentActivityCard,
  TopListCard,
  TrafficMapCard,
  TrafficOverviewCard,
  TrafficTrendsCard,
} from '../dashboard/panel-cards';

export function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [customChartUuid, setCustomChartUuid] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const panels = await fetchDashboardPanels();
        const custom = panels.find(
          (p) => p.type === 'statistics-policy-result' && p.dataview?.uuid,
        );
        if (!cancel) {
          setCustomChartUuid(custom?.dataview?.uuid ?? null);
        }
      } catch {
        if (!cancel) setCustomChartUuid(null);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function logout() {
    await logoutRequest();
    clearToken();
    navigate('/login', { replace: true });
  }

  return (
    <div
      style={{
        minHeight: '100%',
        padding: '16px 14px 28px',
        maxWidth: 520,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{t('home.title')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {t('home.subtitle')}
          </div>
        </div>
        <Button size="small" fill="none" color="primary" onClick={logout}>
          {t('home.logout')}
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} block>
        <GreetingCard />
        <TrafficOverviewCard />
        <TrafficTrendsCard />
        <RecentActivityCard />
        <TrafficMapCard />
        <FirewallCard />
        <ObjectSummaryCard />
        <PolicySummaryCard />
        <TopListCard kind="top-source-ips" />
        <TopListCard kind="top-destination-ips" />
        <TopListCard kind="top-applications" />
        <TopListCard kind="top-destination-countries" />
        <TopListCard kind="top-destination-fqdns" />
        <PolicyHitCard />
        <CustomStatisticsCard chartUuid={customChartUuid} />
      </Space>
    </div>
  );
}
