import type { BacktestResult } from '@/types';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

interface BacktestingProps {
  results: BacktestResult[];
  onRefresh: () => void;
}

function EquityCurve({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={areaPoints}
        fill={`${color}20`}
      />
    </svg>
  );
}

export function Backtesting({ results, onRefresh }: BacktestingProps) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        minHeight: '400px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/40">
          BACKTESTING
        </span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono-data font-medium transition-colors hover:bg-white/5"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <RotateCcw size={10} />
          RUN
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 space-y-3">
        {results.map((result, i) => {
          const isProfitable = result.totalReturn > 0;
          const color = isProfitable ? '#00E5A0' : '#FF4D6A';

          return (
            <div
              key={i}
              className="flex flex-col gap-2 p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Strategy name + equity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isProfitable ? (
                    <TrendingUp size={14} className="text-qs-buy" />
                  ) : (
                    <TrendingDown size={14} className="text-qs-sell" />
                  )}
                  <span className="font-mono-data text-sm font-semibold text-white">
                    {result.strategy}
                  </span>
                </div>
                <EquityCurve data={result.equityCurve} color={color} />
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono-data text-white/30 uppercase tracking-wider">Return</span>
                  <span className="font-mono-data text-xs font-semibold" style={{ color }}>
                    {isProfitable ? '+' : ''}{result.totalReturn.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono-data text-white/30 uppercase tracking-wider">Drawdown</span>
                  <span className="font-mono-data text-xs font-semibold text-qs-sell">
                    -{result.maxDrawdown.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono-data text-white/30 uppercase tracking-wider">Sharpe</span>
                  <span className="font-mono-data text-xs font-semibold text-qs-cyan">
                    {result.sharpeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono-data text-white/30 uppercase tracking-wider">Win Rate</span>
                  <span className="font-mono-data text-xs font-semibold text-white">
                    {result.winRate.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Trades count */}
              <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                <span className="text-[9px] font-mono-data text-white/30">
                  {result.trades} trades
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${result.winRate * 0.8}px`,
                      backgroundColor: color,
                      minWidth: '4px',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-2 border-t"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[9px] font-mono-data text-white/20">
          Past performance does not guarantee future results. Run button simulates 1000 iterations.
        </span>
      </div>
    </div>
  );
}
