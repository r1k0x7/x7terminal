import { useEffect, useRef } from 'react';
import type { Trade } from '@/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(trades.length);

  useEffect(() => {
    if (trades.length > prevLength.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevLength.current = trades.length;
  }, [trades]);

  const displayTrades = trades.slice(0, 50);

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
        className="flex items-center px-4 h-9 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/40">
          RECENT TRADES
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-3 py-1 text-[10px] font-mono-data text-white/30">
        <span>Time</span>
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right"></span>
      </div>

      {/* Trades */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {displayTrades.map((trade, i) => {
          const isWhale = trade.size > 1;
          const isBigWhale = trade.size > 5;
          const bgColor = isBigWhale
            ? 'rgba(255, 215, 0, 0.1)'
            : isWhale
              ? 'rgba(255, 215, 0, 0.05)'
              : 'transparent';

          return (
            <div
              key={`${trade.timestamp}-${i}`}
              className="grid grid-cols-4 px-3 py-0.5 text-xs font-mono-data animate-slide-in"
              style={{ backgroundColor: bgColor }}
            >
              <span className="text-white/30">{trade.time}</span>
              <span className={trade.isBuy ? 'text-qs-buy' : 'text-qs-sell'} style={{ fontWeight: isBigWhale ? 700 : 400 }}>
                {trade.price.toFixed(2)}
              </span>
              <span className="text-right text-white/60">{trade.size.toFixed(4)}</span>
              <span className="text-right">
                {trade.isBuy ? (
                  <ArrowUpRight size={12} className="text-qs-buy inline" />
                ) : (
                  <ArrowDownRight size={12} className="text-qs-sell inline" />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
