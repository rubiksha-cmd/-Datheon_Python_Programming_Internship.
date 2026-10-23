export interface Holding {
  id: string;
  ticker: string;
  buyPrice: number;
  quantity: number;
  currentPrice: number;
}

export interface PortfolioMetrics {
  totalInvested: number;
  totalMarketValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topPerformer: { ticker: string; returnPercent: number } | null;
}
