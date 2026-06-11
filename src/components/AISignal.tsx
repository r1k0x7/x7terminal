import { useState, useEffect } from 'react';
import type { AISignal as AISignalType } from '@/types';

interface AISignalProps {
  signal: AISignalType;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 40;
  const height = 16;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
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

export function AISignal({ signal }: AISignalProps) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const timeout = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(timeout);
  }, [signal.signal, signal.confidence]);

  const isLong = signal.signal === 'LONG';
  const signalColor = isLong ? '#00E5A0' : '#FF4D6A';

  // Generate sparkline data
  const sparklineData = Array.from({ length: 20 }, (_, i) => {
    return 50 + Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 10;
  });

  const metrics = [
    { label: 'CVD 1H', value: `+${(Math.random() * 5).toFixed(1)}M`, sentiment: 'buy' as const },
    { label: 'LIQ 24H', value: `$${(70 + Math.random() * 40).toFixed(1)}M`, sentiment: 'sell' as const },
    { label: 'OI CHANGE', value: `+${(Math.random() * 8).toFixed(1)}%`, sentiment: 'neutral' as const },
    { label: 'WHALE FLOW', value: `+$${(50 + Math.random() * 100).toFixed(0)}M`, sentiment: 'buy' as const },
  ];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden ${flash ? 'animate-signal-flash' : ''}`}
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* AI Signal Section */}
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 212, 255, 0.03), transparent)',
        }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-qs-cyan">
          AI SIGNAL
        </span>

        <div className="flex items-center gap-3 mt-2">
          <span
            className="font-display text-2xl font-bold"
            style={{ color: signalColor }}
          >
            {signal.signal}
          </span>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-semibold"
            style={{
              backgroundColor: isLong ? 'rgba(0, 229, 160, 0.15)' : 'rgba(255, 77, 106, 0.15)',
              color: signalColor,
            }}
          >
            {signal.confidence}%
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1A1D24' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${signal.confidence}%`,
              background: isLong
                ? 'linear-gradient(to right, #00E5A0, #00D4FF)'
                : 'linear-gradient(to right, #FF4D6A, #FFB800)',
            }}
          />
        </div>

        {/* Factors */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {signal.factors.map((factor, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                backgroundColor: '#1A1D24',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {factor}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 p-4 pt-0">
        {metrics.map((metric) => {
          const color = metric.sentiment === 'buy' ? '#00E5A0' : metric.sentiment === 'sell' ? '#FF4D6A' : '#00D4FF';
          return (
            <div
              key={metric.label}
              className="flex flex-col gap-1 p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            >
              <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/30">
                {metric.label}
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-sm font-semibold text-white">
                  {metric.value}
                </span>
                <MiniSparkline data={sparklineData} color={color} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
                               }

