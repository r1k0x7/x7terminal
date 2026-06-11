import { useState, useEffect } from 'react';
import type { MetricData } from '@/types';

interface HeroMetricsProps {
  metrics: MetricData[];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroMetrics({ metrics }: HeroMetricsProps) {
  const [flashingIdx, setFlashingIdx] = useState<number | null>(null);

  useEffect(() => {
    setFlashingIdx(Math.floor(Math.random() * metrics.length));
    const timeout = setTimeout(() => setFlashingIdx(null), 200);
    return () => clearTimeout(timeout);
  }, [metrics]);

  const getColor = (sentiment: string) => {
    switch (sentiment) {
      case 'buy': return '#00E5A0';
      case 'sell': return '#FF4D6A';
      default: return '#00D4FF';
    }
  };

  return (
    <div
      className="flex items-center gap-8 px-6 h-[72px] overflow-x-auto scrollbar-hide border-y"
      style={{
        backgroundColor: '#111318',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {metrics.map((metric, idx) => {
        const color = getColor(metric.sentiment);
        const isFlashing = flashingIdx === idx;

        return (
          <div
            key={metric.label}
            className={`flex flex-col gap-1 min-w-[140px] pl-3 border-l-2 ${isFlashing ? 'animate-flash' : ''}`}
            style={{ borderLeftColor: color }}
          >
            <span
              className="text-[10px] font-mono-data font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              {metric.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-sm font-semibold text-white">
                {metric.value}
              </span>
              <MiniSparkline data={metric.sparkline} color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
