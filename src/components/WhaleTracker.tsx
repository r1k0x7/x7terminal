import { useMemo } from 'react';
import type { WhaleAlert } from '@/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface WhaleTrackerProps {
  alerts: WhaleAlert[];
}

export function WhaleTracker({ alerts }: WhaleTrackerProps) {
  const stats = useMemo(() => {
    const buyVolume = alerts.filter(a => a.type === 'buy').reduce((s, a) => s + a.size, 0);
    const sellVolume = alerts.filter(a => a.type === 'sell').reduce((s, a) => s + a.size, 0);
    return { buyVolume, sellVolume, netFlow: buyVolume - sellVolume };
  }, [alerts]);

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
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-data font-semibold tracking-widest text-qs-gold">
            WHALE TRACKER
          </span>
        </div>
        <span
          className="text-xs font-mono-data font-semibold"
          style={{ color: stats.netFlow >= 0 ? '#00E5A0' : '#FF4D6A' }}
        >
          Net: {stats.netFlow >= 0 ? '+' : ''}{stats.netFlow.toFixed(2)} BTC
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2">
        <div
          className="flex flex-col items-center p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(0, 229, 160, 0.05)' }}
        >
          <span className="text-[10px] font-mono-data text-white/40">Buy Volume</span>
          <span className="font-mono-data text-sm font-semibold text-qs-buy">{stats.buyVolume.toFixed(2)} BTC</span>
        </div>
        <div
          className="flex flex-col items-center p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(255, 77, 106, 0.05)' }}
        >
          <span className="text-[10px] font-mono-data text-white/40">Sell Volume</span>
          <span className="font-mono-data text-sm font-semibold text-qs-sell">{stats.sellVolume.toFixed(2)} BTC</span>
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        <div className="flex flex-col">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}
            >
              <div className="flex items-center gap-2">
                {alert.type === 'buy' ? (
                  <ArrowUpRight size={14} className="text-qs-buy" />
                ) : (
                  <ArrowDownRight size={14} className="text-qs-sell" />
                )}
                <span className="text-[10px] font-mono-data text-white/30">{alert.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-data text-white/60">{alert.price.toFixed(2)}</span>
                <span
                  className="text-xs font-mono-data font-semibold"
                  style={{ color: alert.type === 'buy' ? '#00E5A0' : '#FF4D6A' }}
                >
                  {alert.size.toFixed(2)} BTC
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
