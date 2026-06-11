import { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';

interface NavigationProps {
  midPrice: number;
}

export function Navigation({ midPrice }: NavigationProps) {
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState(midPrice);

  // Detect price direction
  if (midPrice !== prevPrice) {
    const direction = midPrice > prevPrice ? 'up' : 'down';
    setPrevPrice(midPrice);
    setPriceFlash(direction);
    setTimeout(() => setPriceFlash(null), 300);
  }

  const priceChange = 2.34;
  const priceColor = priceFlash === 'up' ? 'text-qs-buy' : priceFlash === 'down' ? 'text-qs-sell' : 'text-white';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 h-14 border-b"
      style={{
        backgroundColor: 'rgba(10, 11, 15, 0.9)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Left: Logo + Ticker */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-qs-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-qs-cyan"></span>
          </span>
          <span className="font-display text-xl font-bold text-qs-cyan tracking-tight">QuantStream</span>
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono-data font-semibold transition-colors"
          style={{
            backgroundColor: '#1A1D24',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          BTCUSDT Perp
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Center: Live Price */}
      <div className="flex items-center gap-3">
        <span className={`font-mono-data text-2xl font-bold tabular-nums transition-colors duration-300 ${priceColor}`}>
          {midPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(0, 229, 160, 0.15)',
            color: '#00E5A0',
          }}
        >
          +{priceChange}%
        </span>
      </div>

      {/* Right: Status + Settings */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(0, 229, 160, 0.1)',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-qs-buy animate-pulse"></span>
          <span className="text-[10px] font-mono-data font-semibold tracking-widest text-qs-buy">LIVE</span>
        </div>
        <button className="p-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
