import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef } from 'react';

import { useI18n } from '../i18n/i18n';
import { formatBitsPerSec } from '../utils/format';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

export type TrafficTrendChartProps = {
  /** X 轴标签（本地时间简写） */
  categories: string[];
  inboundBps: number[];
  outboundBps: number[];
  emptyHint?: string;
};

export function TrafficTrendChart({
  categories,
  inboundBps,
  outboundBps,
  emptyHint,
}: TrafficTrendChartProps) {
  const { t } = useI18n();
  const emptyText = emptyHint ?? t('common.no_data');
  const ref = useRef<HTMLDivElement | null>(null);

  // 与 PC traffic-trends-panel 一致：只要序列有点就渲染（含全 0），仅用空列表判定无数据
  const len = categories.length;
  const hasData =
    len > 0 &&
    inboundBps.length === len &&
    outboundBps.length === len;

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasData) return;

    const chart = echarts.init(el, undefined, { renderer: 'canvas' });

    chart.setOption({
      backgroundColor: 'transparent',
      textStyle: { color: '#c8d4e6' },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const arr = params as {
            axisValueLabel?: string;
            seriesName: string;
            value?: number | [unknown, number];
          }[];
          if (!Array.isArray(arr) || !arr.length) return '';
          const head = String(arr[0].axisValueLabel ?? '');
          const lines = arr.map((it) => {
            const y = Array.isArray(it.value) ? it.value[1] : Number(it.value);
            return `${it.seriesName}: ${formatBitsPerSec(y)}`;
          });
          return [head, ...lines].join('<br/>');
        },
      },
      legend: {
        data: [t('traffic.incoming'), t('traffic.outgoing')],
        textStyle: { color: '#8b9bb4', fontSize: 11 },
        top: 0,
      },
      grid: { left: 12, right: 12, top: 36, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
        axisLine: { lineStyle: { color: '#3d4f6a' } },
        axisLabel: { color: '#8b9bb4', fontSize: 9, rotate: 40 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(61, 79, 106, 0.45)' } },
        axisLabel: {
          color: '#8b9bb4',
          fontSize: 10,
          formatter: (v: number) => formatBitsPerSec(v).replace('bps', ''),
        },
      },
      series: [
        {
          name: t('traffic.incoming'),
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
          data: inboundBps,
        },
        {
          name: t('traffic.outgoing'),
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#22d3ee' },
          areaStyle: { color: 'rgba(34, 211, 238, 0.15)' },
          data: outboundBps,
        },
      ],
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, [categories, inboundBps, outboundBps, hasData, t]);

  if (!hasData) {
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: 14,
        }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ width: '100%', height: 220, minHeight: 200 }}
      aria-label="流量趋势图"
    />
  );
}
