import { useMarketData } from '@/hooks/useMarketData';
import { Navigation } from '@/components/Navigation';
import { HeroMetrics } from '@/components/HeroMetrics';
import { TradingChart } from '@/components/TradingChart';
import { OrderbookHeatmap } from '@/components/OrderbookHeatmap';
import { Orderbook } from '@/components/Orderbook';
import { RecentTrades } from '@/components/RecentTrades';
import { AISignal } from '@/components/AISignal';
import { LiquidationHeatmap } from '@/components/LiquidationHeatmap';
import { WhaleTracker } from '@/components/WhaleTracker';
import { OpenInterest } from '@/components/OpenInterest';
import { FundingRate } from '@/components/FundingRate';
import { Backtesting } from '@/components/Backtesting';

export default function App() {
  const {
    midPrice,
    orderbook,
    trades,
    candles,
    cvd,
    aiSignal,
    metrics,
    whaleAlerts,
    liquidations,
    oiHistory,
    fundingHistory,
    backtestResults,
    refreshBacktest,
  } = useMarketData();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#0A0B0F',
        backgroundImage: 'url(/bg-abstract.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navigation */}
      <Navigation midPrice={midPrice} />

      {/* Main content */}
      <div className="pt-14">
        {/* Hero Metrics */}
        <HeroMetrics metrics={metrics} />

        {/* Main Dashboard Grid */}
        <div className="p-6">
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: '1fr 380px',
            }}
          >
            {/* Left Column - Main Charting Area */}
            <div className="flex flex-col gap-6">
              {/* Trading Chart */}
              <TradingChart candles={candles} cvd={cvd} />

              {/* WebGL Orderbook Heatmap */}
              <OrderbookHeatmap />
            </div>

            {/* Right Column - Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Orderbook */}
              <Orderbook bids={orderbook.bids} asks={orderbook.asks} />

              {/* Recent Trades */}
              <RecentTrades trades={trades} />

              {/* AI Signal */}
              <AISignal signal={aiSignal} />
            </div>
          </div>

          {/* Analytics Section 1: Liquidation + Whale */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <LiquidationHeatmap data={liquidations} />
            <WhaleTracker alerts={whaleAlerts} />
          </div>

          {/* Analytics Section 2: OI + Funding */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <OpenInterest data={oiHistory} />
            <FundingRate data={fundingHistory} />
          </div>

          {/* Analytics Section 3: Backtesting */}
          <div className="mt-6">
            <Backtesting results={backtestResults} onRefresh={refreshBacktest} />
          </div>
        </div>

        {/* Footer */}
        <footer
          className="flex items-center justify-between px-6 h-12 border-t"
          style={{
            backgroundColor: '#0A0B0F',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <span className="text-[10px] font-mono-data tracking-wider text-white/30">
            QuantStream v2.4.1
          </span>
          <span className="text-[10px] font-mono-data tracking-wider text-white/30">
            Data: Binance Futures
          </span>
          <span className="text-[10px] font-mono-data tracking-wider text-qs-buy">
            Latency: 24ms
          </span>
        </footer>
      </div>
    </div>
  );
}
