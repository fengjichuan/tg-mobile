import { LinesChart, MapChart } from 'echarts/charts';
import {
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '../i18n/i18n';
import { formatBytes } from '../utils/format';
import {
  aggregateSourceCountryBytes,
  buildCountryCenters,
  buildFlowLines,
  type TrafficMapRow,
} from '../utils/trafficMapGeo';

echarts.use([
  MapChart,
  LinesChart,
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export type TrafficWorldMapProps = {
  /** `list` from GET /dashboards/traffic-map */
  list: TrafficMapRow[] | undefined | null;
};

export function TrafficWorldMap({ list }: TrafficWorldMapProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);
  const centersRef = useRef<Map<string, [number, number]> | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geoReady, setGeoReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    const base = import.meta.env.BASE_URL || '/';
    (async () => {
      try {
        const res = await fetch(`${base}map/world.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const worldGeo = await res.json();
        if (cancel) return;
        centersRef.current = buildCountryCenters(worldGeo);
        echarts.registerMap('world', worldGeo);
        setGeoReady(true);
      } catch (e) {
        if (!cancel) {
          setMapError(e instanceof Error ? e.message : 'map load failed');
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    const centers = centersRef.current;
    if (!el || !geoReady || mapError || !centers) return;

    const rows = Array.isArray(list) ? list : [];
    const mapData = aggregateSourceCountryBytes(rows, centers);
    const lines = buildFlowLines(rows, centers, 100);
    const maxV =
      mapData.length > 0 ? Math.max(...mapData.map((d) => d.value), 1) : 1;

    if (!chartRef.current) {
      chartRef.current = echarts.init(el, undefined, { renderer: 'canvas' });
    }
    const chart = chartRef.current;
    if (!chart) return;

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        confine: true,
        borderWidth: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as {
            seriesType?: string;
            name?: string;
            value?: number;
            data?: {
              total_bytes?: number;
              fromName?: string;
              toName?: string;
            };
          };
          if (p.seriesType === 'lines' && p.data) {
            const b = Number(p.data.total_bytes) || 0;
            return `${p.data.fromName} → ${p.data.toName}<br/>${t('traffic.map_tooltip_flow')}: ${formatBytes(b)}`;
          }
          if (p.seriesType === 'map' && typeof p.name === 'string') {
            const v = typeof p.value === 'number' ? p.value : 0;
            return `${p.name}<br/>${formatBytes(v)}`;
          }
          return '';
        },
      },
      visualMap: {
        show: mapData.length > 0,
        min: 0,
        max: maxV,
        orient: 'horizontal',
        left: 'center',
        bottom: 4,
        itemWidth: 12,
        itemHeight: 12,
        text: [t('traffic.map_high'), t('traffic.map_low')],
        inRange: {
          color: ['#94c2c6', '#689fa5', '#518599', '#3a6d82'],
        },
        dimension: 0,
        calculable: true,
        textStyle: { color: '#8b9bb4', fontSize: 10 },
      },
      geo: {
        map: 'world',
        roam: true,
        // Fill viewport by shorter side so default projection is not clipped on narrow screens
        layoutCenter: ['50%', mapData.length > 0 ? '44%' : '50%'],
        layoutSize: mapData.length > 0 ? '82%' : '92%',
        aspectScale: 0.75,
        scaleLimit: { min: 0.5, max: 8 },
        label: { show: false },
        itemStyle: {
          areaColor: 'rgba(61, 79, 106, 0.35)',
          borderColor: 'rgba(139, 155, 180, 0.45)',
          borderWidth: 0.5,
        },
        emphasis: {
          label: { show: false },
          itemStyle: {
            areaColor: 'rgba(7, 77, 124, 0.55)',
          },
        },
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: mapData,
          emphasis: {
            label: { show: false },
          },
        },
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: lines.length > 0,
            period: 5,
            trailLength: 0.25,
            symbolSize: 4,
            color: '#22d3ee',
          },
          lineStyle: {
            color: 'rgba(34, 211, 238, 0.65)',
            width: 1,
            opacity: 0.75,
            curveness: 0.18,
          },
          data: lines.map((item) => ({
            coords: item.coords,
            total_bytes: item.total_bytes,
            fromName: item.fromName,
            toName: item.toName,
          })),
        },
      ],
    };

    chart.setOption(option, true);
    requestAnimationFrame(() => chart.resize());

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [geoReady, mapError, list, t]);

  if (mapError) {
    return (
      <div
        style={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: 13,
        }}
      >
        {t('traffic.map_load_failed')}: {mapError}
      </div>
    );
  }

  if (!geoReady) {
    return (
      <div
        style={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: 13,
        }}
      >
        {t('traffic.map_loading')}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: 300,
        maxWidth: '100%',
        boxSizing: 'border-box',
        marginTop: 12,
        touchAction: 'none',
      }}
      aria-label={t('panel.traffic_map_summary')}
    />
  );
}
