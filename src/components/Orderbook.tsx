import { useMemo } from 'react';
import type { OrderbookLevel } from '@/types';

interface OrderbookProps {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export function Orderbook({ bids, asks }: OrderbookProps) {
  const maxBidTotal = useMemo(() => {
    if (bids.length === 0) return 1;
    return Math.max(...bids.map(b => b.total));
  }, [bids]);

  const maxAskTotal = useMemo(() => {
    if (asks.length === 0) return 1;
    return Math.max(...asks.map(a => a.total));
  }, [asks]);

  const spread = useMemo(() => {
    if (asks.length === 0 || bids.length === 0) return 0;
    return Math.round((asks[asks.length - 1].price - bids[0].price) * 100) / 100;
  }, [bids, asks]);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '480px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-white/40">
          ORDERBOOK
        </span>
        <span className="text-xs font-mono-data text-white/30">
          Spread: {spread}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-[10px] font-mono-data text-white/30">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed - highest at top) */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col-reverse">
          {asks.slice(-10).map((ask, i) => (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-3 px-3 py-0.5 text-xs font-mono-data relative hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-qs-sell">{ask.price.toFixed(2)}</span>
              <span className="text-right text-white/60">{ask.size.toFixed(4)}</span>
              <span className="text-right text-white/30">{ask.total.toFixed(4)}</span>
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{
                  width: `${(ask.total / maxAskTotal) * 100}%`,
                  background: 'linear-gradient(to left, rgba(255, 77, 106, 0.15), transparent)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mid price divider */}
      <div
        className="flex items-center justify-center h-6 border-y"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(0, 212, 255, 0.03)',
        }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-qs-cyan">
          MID
        </span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col">
          {bids.slice(0, 10).map((bid, i) => (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-3 px-3 py-0.5 text-xs font-mono-data relative hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-qs-buy">{bid.price.toFixed(2)}</span>
              <span className="text-right text-white/60">{bid.size.toFixed(4)}</span>
              <span className="text-right text-white/30">{bid.total.toFixed(4)}</span>
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{
                  width: `${(bid.total / maxBidTotal) * 100}%`,
                  background: 'linear-gradient(to left, rgba(0, 229, 160, 0.15), transparent)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
