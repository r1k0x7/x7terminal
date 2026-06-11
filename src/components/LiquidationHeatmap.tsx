import { useMemo } from 'react';
import type { LiquidationData } from '@/types';

interface LiquidationHeatmapProps {
  data: LiquidationData[];
}

export function LiquidationHeatmap({ data }: LiquidationHeatmapProps) {
  const maxLiq = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => Math.max(d.longLiq, d.shortLiq)));
  }, [data]);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '300px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/40">
          LIQUIDATION HEATMAP
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-qs-sell"></span>
            <span className="text-[10px] font-mono-data text-white/40">Longs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-qs-buy"></span>
            <span className="text-[10px] font-mono-data text-white/40">Shorts</span>
          </div>
        </div>
      </div>

      {/* Heatmap bars */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
        <div className="flex flex-col gap-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data text-white/30 w-10 text-right">
                {item.time}
              </span>
              <div className="flex-1 flex items-center gap-0.5 h-4">
                {/* Long liquidations (left, red) */}
                <div className="flex-1 flex justify-end">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${(item.longLiq / maxLiq) * 100}%`,
                      backgroundColor: 'rgba(255, 77, 106, 0.7)',
                    }}
                  />
                </div>
                {/* Divider */}
                <div className="w-px h-full bg-white/10" />
                {/* Short liquidations (right, green) */}
                <div className="flex-1">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${(item.shortLiq / maxLiq) * 100}%`,
                      backgroundColor: 'rgba(0, 229, 160, 0.7)',
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono-data text-white/30 w-16 text-right">
                ${(item.longLiq + item.shortLiq).toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data text-white/30">
          Total 24H
        </span>
        <span className="font-mono-data text-sm font-semibold text-white">
          ${data.reduce((sum, d) => sum + d.longLiq + d.shortLiq, 0).toFixed(1)}M
        </span>
      </div>
    </div>
  );
}
