import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  OrderbookLevel,
  Trade,
  Candle,
  AISignal,
  MetricData,
  HeatmapData,
  WhaleAlert,
  LiquidationData,
  OpenInterestData,
  FundingRateData,
  BacktestResult,
} from '@/types';

const BASE_PRICE = 97245.50;

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

function generateOrderbook(midPrice: number): { bids: OrderbookLevel[]; asks: OrderbookLevel[] } {
  const bids: OrderbookLevel[] = [];
  const asks: OrderbookLevel[] = [];

  for (let i = 0; i < 20; i++) {
    const bidPrice = midPrice - (i + 1) * (Math.random() * 2 + 0.5);
    const askPrice = midPrice + (i + 1) * (Math.random() * 2 + 0.5);
    const bidSize = Math.exp(Math.random() * 3) * (1 - i * 0.03);
    const askSize = Math.exp(Math.random() * 3) * (1 - i * 0.03);

    bids.push({
      price: Math.round(bidPrice * 100) / 100,
      size: Math.round(bidSize * 1000) / 1000,
      total: 0,
    });
    asks.unshift({
      price: Math.round(askPrice * 100) / 100,
      size: Math.round(askSize * 1000) / 1000,
      total: 0,
    });
  }

  // Calculate totals
  let bidTotal = 0;
  for (let i = bids.length - 1; i >= 0; i--) {
    bidTotal += bids[i].size;
    bids[i].total = Math.round(bidTotal * 1000) / 1000;
  }
  let askTotal = 0;
  for (let i = asks.length - 1; i >= 0; i--) {
    askTotal += asks[i].size;
    asks[i].total = Math.round(askTotal * 1000) / 1000;
  }

  return { bids, asks };
}

function generateTrade(midPrice: number): Trade {
  const isBuy = Math.random() > 0.45;
  const priceOffset = (Math.random() - 0.5) * midPrice * 0.0005;
  const size = Math.exp(Math.random() * 3) / 100;
  const now = new Date();

  return {
    time: formatTime(now),
    price: Math.round((midPrice + priceOffset) * 100) / 100,
    size: Math.round(size * 10000) / 10000,
    isBuy,
    timestamp: now.getTime(),
  };
}

function generateCandle(time: number, prevClose?: number): Candle {
  const base = prevClose || BASE_PRICE;
  const change = (Math.random() - 0.48) * base * 0.002;
  const open = base;
  const close = base + change;
  const high = Math.max(open, close) + Math.random() * base * 0.001;
  const low = Math.min(open, close) - Math.random() * base * 0.001;
  const volume = Math.random() * 500 + 100;

  return {
    time,
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
    volume: Math.round(volume),
  };
}

function generateHeatmapData(midPrice: number): HeatmapData {
  const levels = 100;
  const bids: number[] = [];
  const asks: number[] = [];

  for (let i = 0; i < levels; i++) {
    const distFromMid = Math.abs(i - levels / 2) / (levels / 2);
    const bidSize = Math.exp(-distFromMid * 2) * (1 + Math.random() * 0.5) * 100;
    const askSize = Math.exp(-distFromMid * 2) * (1 + Math.random() * 0.5) * 100;
    bids.push(Math.round(bidSize));
    asks.push(Math.round(askSize));
  }

  return {
    time: Date.now(),
    bids,
    asks,
    midPrice,
  };
}

function generateAISignal(): AISignal {
  const isLong = Math.random() > 0.4;
  const factors = [
    'OI Rising',
    'Positive CVD',
    'Funding Negative',
    'Whale Accumulation',
    'Breakout Pattern',
    'Volume Surge',
    'Support Bounce',
    'EMA Crossover',
  ];

  const selectedFactors: string[] = [];
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * factors.length);
    if (!selectedFactors.includes(factors[idx])) {
      selectedFactors.push(factors[idx]);
    }
  }

  return {
    signal: isLong ? 'LONG' : 'SHORT',
    confidence: Math.round((50 + Math.random() * 45) * 10) / 10,
    factors: selectedFactors,
  };
}

function generateSparkline(points: number = 20, trend: number = 0): number[] {
  const data: number[] = [];
  let val = 50;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.5) * 10 + trend;
    val = Math.max(10, Math.min(90, val));
    data.push(val);
  }
  return data;
}

function generateMetrics(): MetricData[] {
  return [
    { label: '24H VOLUME', value: `$${(40 + Math.random() * 5).toFixed(1)}B`, sentiment: 'neutral', sparkline: generateSparkline() },
    { label: 'OPEN INTEREST', value: `${(17 + Math.random() * 3).toFixed(1)}B USDT`, sentiment: Math.random() > 0.5 ? 'buy' : 'sell', sparkline: generateSparkline(20, 0.5) },
    { label: 'FUNDING RATE', value: `${(Math.random() * 0.01).toFixed(4)}%`, sentiment: 'neutral', sparkline: generateSparkline(20, 0.2) },
    { label: 'LIQUIDATIONS', value: `$${(70 + Math.random() * 40).toFixed(1)}M`, sentiment: 'sell', sparkline: generateSparkline(20, -0.3) },
    { label: 'CVD (1H)', value: `${(Math.random() > 0.5 ? '+' : '')}${(Math.random() * 5).toFixed(1)}M`, sentiment: Math.random() > 0.5 ? 'buy' : 'sell', sparkline: generateSparkline(20, Math.random() > 0.5 ? 0.3 : -0.3) },
    { label: 'WHALE INDEX', value: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH', sentiment: Math.random() > 0.5 ? 'buy' : 'sell', sparkline: generateSparkline() },
  ];
}

function generateWhaleAlerts(count: number = 5): WhaleAlert[] {
  const alerts: WhaleAlert[] = [];
  for (let i = 0; i < count; i++) {
    const now = new Date(Date.now() - i * 60000);
    alerts.push({
      time: formatTime(now),
      price: BASE_PRICE + (Math.random() - 0.5) * 200,
      size: 1 + Math.random() * 20,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
    });
  }
  return alerts;
}

function generateLiquidations(): LiquidationData[] {
  const data: LiquidationData[] = [];
  for (let i = 0; i < 24; i++) {
    const now = new Date(Date.now() - (23 - i) * 3600000);
    data.push({
      time: `${now.getHours()}:00`,
      longLiq: Math.random() * 15,
      shortLiq: Math.random() * 15,
      price: BASE_PRICE + (Math.random() - 0.5) * 1000,
    });
  }
  return data;
}

function generateOIHistory(): OpenInterestData[] {
  const data: OpenInterestData[] = [];
  let oi = 18.2;
  const now = Date.now() / 1000;
  for (let i = 0; i < 100; i++) {
    oi += (Math.random() - 0.48) * 0.1;
    data.push({
      time: now - (99 - i) * 3600,
      oi: Math.round(oi * 100) / 100,
      price: BASE_PRICE + (Math.random() - 0.5) * 500,
    });
  }
  return data;
}

function generateFundingHistory(): FundingRateData[] {
  const data: FundingRateData[] = [];
  const now = Date.now() / 1000;
  for (let i = 0; i < 30; i++) {
    data.push({
      time: now - (29 - i) * 8 * 3600,
      rate: (Math.random() - 0.5) * 0.01,
    });
  }
  return data;
}

function generateBacktestResult(): BacktestResult {
  const strategies = ['EMA Crossover', 'RSI Mean Reversion', 'Breakout Momentum', 'Grid Trading', 'MACD Divergence'];
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  const totalReturn = (Math.random() * 80 - 20);
  const winRate = 40 + Math.random() * 40;
  const equityCurve: number[] = [100];
  for (let i = 1; i < 100; i++) {
    equityCurve.push(equityCurve[i - 1] * (1 + (Math.random() - 0.48) * 0.02));
  }

  return {
    strategy,
    totalReturn: Math.round(totalReturn * 100) / 100,
    maxDrawdown: Math.round(Math.random() * 25 * 100) / 100,
    sharpeRatio: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    trades: Math.floor(50 + Math.random() * 200),
    equityCurve,
  };
}

export function useMarketData() {
  const [midPrice, setMidPrice] = useState(BASE_PRICE);
  const [orderbook, setOrderbook] = useState<{ bids: OrderbookLevel[]; asks: OrderbookLevel[] }>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [cvd, setCvd] = useState<number>(0);
  const [aiSignal, setAiSignal] = useState<AISignal>(generateAISignal());
  const [metrics, setMetrics] = useState<MetricData[]>(generateMetrics());
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>(generateWhaleAlerts());
  const [liquidations, setLiquidations] = useState<LiquidationData[]>(generateLiquidations());
  const [oiHistory, _setOiHistory] = useState<OpenInterestData[]>(generateOIHistory());
  const [fundingHistory, _setFundingHistory] = useState<FundingRateData[]>(generateFundingHistory());
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);

  const cvdRef = useRef(0);
  const midPriceRef = useRef(BASE_PRICE);

  // Initialize candles
  useEffect(() => {
    const initialCandles: Candle[] = [];
    const now = Date.now() / 1000;
    let prevClose = BASE_PRICE;
    for (let i = 0; i < 200; i++) {
      const candle = generateCandle(now - (199 - i) * 60, prevClose);
      initialCandles.push(candle);
      prevClose = candle.close;
    }
    setCandles(initialCandles);
    midPriceRef.current = prevClose;
    setMidPrice(prevClose);

    // Initialize backtest results
    const results: BacktestResult[] = [];
    for (let i = 0; i < 3; i++) {
      results.push(generateBacktestResult());
    }
    setBacktestResults(results);
  }, []);

  // Orderbook updates (100ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const ob = generateOrderbook(midPriceRef.current);
      setOrderbook(ob);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Trade updates (50-200ms random)
  useEffect(() => {
    const scheduleTrade = () => {
      const delay = 50 + Math.random() * 150;
      setTimeout(() => {
        const trade = generateTrade(midPriceRef.current);
        setTrades(prev => [trade, ...prev].slice(0, 100));

        // Update CVD
        if (trade.isBuy) {
          cvdRef.current += trade.size;
        } else {
          cvdRef.current -= trade.size;
        }
        setCvd(Math.round(cvdRef.current * 10000) / 10000);

        scheduleTrade();
      }, delay);
    };
    scheduleTrade();
  }, []);

  // Price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.48) * midPriceRef.current * 0.0002;
      midPriceRef.current += change;
      midPriceRef.current = Math.round(midPriceRef.current * 100) / 100;
      setMidPrice(midPriceRef.current);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Candle updates (1 minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const newCandle = generateCandle(now, midPriceRef.current);
      setCandles(prev => [...prev.slice(-199), newCandle]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // AI Signal updates (30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setAiSignal(generateAISignal());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Metrics updates (2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Heatmap data updates (500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateHeatmapData(midPriceRef.current);
      setHeatmapData(prev => [...prev.slice(-200), data]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Whale alerts (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setWhaleAlerts(generateWhaleAlerts());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Liquidations (10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidations(generateLiquidations());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshBacktest = useCallback(() => {
    const results: BacktestResult[] = [];
    for (let i = 0; i < 3; i++) {
      results.push(generateBacktestResult());
    }
    setBacktestResults(results);
  }, []);

  return {
    midPrice,
    orderbook,
    trades,
    candles,
    cvd,
    aiSignal,
    metrics,
    heatmapData,
    whaleAlerts,
    liquidations,
    oiHistory,
    fundingHistory,
    backtestResults,
    refreshBacktest,
  };
}
