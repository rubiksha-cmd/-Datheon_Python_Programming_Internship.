const BASE_PRICES: Record<string, number> = {
  AAPL: 178.5,
  NVDA: 875.3,
  TSLA: 248.5,
  GOOGL: 142.8,
  MSFT: 415.2,
  AMZN: 178.2,
  META: 502.1,
  AMD: 165.4,
  NFLX: 612.7,
  INTC: 43.2,
  BABA: 78.9,
  DIS: 102.4,
  KO: 62.1,
  WMT: 58.7,
  JPM: 198.3,
  V: 275.6,
};

export function getBasePrice(ticker: string): number {
  const key = ticker.toUpperCase();
  if (BASE_PRICES[key] != null) return BASE_PRICES[key];
  // deterministic pseudo-random price for unknown tickers
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 10000;
  return 25 + (hash % 400);
}

export function fluctuatePrice(currentPrice: number, volatility: number): number {
  // volatility is a percentage e.g. 2 means +/- 2%
  const delta = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = currentPrice * (1 + delta / 100);
  return Math.max(0.01, Math.round(newPrice * 100) / 100);
}

export const PRESET_STOCKS = ['AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
