import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';
import type { OpenInterestData } from '@/types';

interface OpenInterestProps {
  data: OpenInterestData[];
}

export function OpenInterest({ data }: OpenInterestProps) {
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

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#00D4FF',
      topColor: 'rgba(0, 212, 255, 0.2)',
      bottomColor: 'rgba(0, 212, 255, 0.02)',
      lineWidth: 2,
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

    const areaData = data.map(d => ({
      time: d.time as Time,
      value: d.oi,
    }));

    seriesRef.current.setData(areaData);
  }, [data]);

  const currentOI = data.length > 0 ? data[data.length - 1].oi : 0;
  const prevOI = data.length > 1 ? data[data.length - 2].oi : currentOI;
  const change = ((currentOI - prevOI) / prevOI) * 100;

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
          OPEN INTEREST
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono-data text-sm font-semibold text-white">
            {currentOI.toFixed(2)}B
          </span>
          <span
            className="text-xs font-mono-data"
            style={{ color: change >= 0 ? '#00E5A0' : '#FF4D6A' }}
          >
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
