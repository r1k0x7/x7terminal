import { useEffect, useRef } from 'react';
import { createChart, HistogramSeries } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';
import type { FundingRateData } from '@/types';

interface FundingRateProps {
  data: FundingRateData[];
}

export function FundingRate({ data }: FundingRateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#111318' },
        textColor: 'rgba(255, 255, 255, 0.4)',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      crosshair: {
        vertLine: { color: 'rgba(0, 212, 255, 0.3)', width: 1 },
        horzLine: { color: 'rgba(0, 212, 255, 0.3)', width: 1 },
      },
    });

    const series = chart.addSeries(HistogramSeries, {
      color: '#00D4FF',
    });
    seriesRef.current = series;
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const histogramData = data.map(d => ({
      time: d.time as Time,
      value: d.rate * 100,
      color: d.rate >= 0 ? 'rgba(0, 229, 160, 0.6)' : 'rgba(255, 77, 106, 0.6)',
    }));

    seriesRef.current.setData(histogramData);
  }, [data]);

  const currentRate = data.length > 0 ? data[data.length - 1].rate : 0;
  const annualized = currentRate * 3 * 365;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '280px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/40">
          FUNDING RATE
        </span>
        <div className="flex items-center gap-3">
          <span
            className="font-mono-data text-sm font-semibold"
            style={{ color: currentRate >= 0 ? '#00E5A0' : '#FF4D6A' }}
          >
            {(currentRate * 100).toFixed(4)}%
          </span>
          <span className="text-xs font-mono-data text-white/40">
            {annualized >= 0 ? '+' : ''}{annualized.toFixed(1)}% APR
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
