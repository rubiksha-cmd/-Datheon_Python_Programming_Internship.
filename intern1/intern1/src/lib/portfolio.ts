import type { Holding, PortfolioMetrics } from '@/types';

export function computeMetrics(holdings: Holding[]): PortfolioMetrics {
  let totalInvested = 0;
  let totalMarketValue = 0;
  let topPerformer: { ticker: string; returnPercent: number } | null = null;

  for (const h of holdings) {
    const invested = h.buyPrice * h.quantity;
    const marketValue = h.currentPrice * h.quantity;
    totalInvested += invested;
    totalMarketValue += marketValue;
    const ret = invested > 0 ? ((marketValue - invested) / invested) * 100 : 0;
    if (!topPerformer || ret > topPerformer.returnPercent) {
      topPerformer = { ticker: h.ticker, returnPercent: ret };
    }
  }

  const totalGainLoss = totalMarketValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalMarketValue,
    totalGainLoss,
    totalGainLossPercent,
    topPerformer: holdings.length > 0 ? topPerformer : null,
  };
}

export function generateCSV(holdings: Holding[], metrics: PortfolioMetrics): string {
  const header = 'Ticker,Quantity,Buy Price ($),Current Price ($),Total Value ($),Gain/Loss ($),Gain/Loss (%)';
  const rows = holdings.map((h) => {
    const totalValue = h.currentPrice * h.quantity;
    const gainLoss = (h.currentPrice - h.buyPrice) * h.quantity;
    const gainLossPercent = h.buyPrice > 0 ? ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;
    return [
      h.ticker,
      h.quantity,
      h.buyPrice.toFixed(2),
      h.currentPrice.toFixed(2),
      totalValue.toFixed(2),
      gainLoss.toFixed(2),
      gainLossPercent.toFixed(2),
    ].join(',');
  });

  const summary = [
    'TOTAL',
    holdings.reduce((s, h) => s + h.quantity, 0),
    '',
    '',
    metrics.totalMarketValue.toFixed(2),
    metrics.totalGainLoss.toFixed(2),
    metrics.totalGainLossPercent.toFixed(2),
  ].join(',');

  return [header, ...rows, summary].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
