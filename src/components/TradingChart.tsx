import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';
import type { Candle } from '@/types';

interface TradingChartProps {
  candles: Candle[];
  cvd: number;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'];

export function TradingChart({ candles }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [activeTf, setActiveTf] = useState('1H');
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const cvdSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#111318' },
        textColor: 'rgba(255, 255, 255, 0.4)',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(0, 212, 255, 0.3)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(0, 212, 255, 0.3)',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        timeVisible: true,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00E5A0',
      downColor: '#FF4D6A',
      wickUpColor: 'rgba(255, 255, 255, 0.4)',
      wickDownColor: 'rgba(255, 255, 255, 0.4)',
      borderUpColor: '#00E5A0',
      borderDownColor: '#FF4D6A',
    });
    candleSeriesRef.current = candleSeries;

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#00E5A0',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // CVD Line
    const cvdSeries = chart.addSeries(LineSeries, {
      color: '#00D4FF',
      lineWidth: 2,
      priceScaleId: 'right',
    });
    cvdSeriesRef.current = cvdSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update candles
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    const candleData = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData = candles.map(c => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(0, 229, 160, 0.3)' : 'rgba(255, 77, 106, 0.3)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // CVD data - cumulative from trades
    const cvdData: { time: Time; value: number }[] = [];
    let cumCvd = 0;
    candles.forEach((c, i) => {
      cumCvd += (c.close - c.open) * c.volume * 0.001;
      if (i % 5 === 0) {
        cvdData.push({
          time: c.time as Time,
          value: Math.round(cumCvd * 100) / 100,
        });
      }
    });
    cvdSeriesRef.current.setData(cvdData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '520px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-12 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTf === tf ? '#1A1D24' : 'transparent',
                color: activeTf === tf ? '#00D4FF' : 'rgba(255, 255, 255, 0.4)',
                border: activeTf === tf ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono-data tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            TradingView
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  );
}
