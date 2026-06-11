export interface OrderbookLevel {
  price: number;
  size: number;
  total: number;
}

export interface Trade {
  time: string;
  price: number;
  size: number;
  isBuy: boolean;
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MetricData {
  label: string;
  value: string;
  subValue?: string;
  sentiment: 'buy' | 'sell' | 'neutral';
  sparkline: number[];
}

export interface AISignal {
  signal: 'LONG' | 'SHORT';
  confidence: number;
  factors: string[];
}

export interface HeatmapData {
  time: number;
  bids: number[];
  asks: number[];
  midPrice: number;
}

export interface WhaleAlert {
  time: string;
  price: number;
  size: number;
  type: 'buy' | 'sell';
}

export interface LiquidationData {
  time: string;
  longLiq: number;
  shortLiq: number;
  price: number;
}

export interface OpenInterestData {
  time: number;
  oi: number;
  price: number;
}

export interface FundingRateData {
  time: number;
  rate: number;
}

export interface BacktestResult {
  strategy: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  trades: number;
  equityCurve: number[];
}

