import { TrendingUp, TrendingDown, Wallet, PieChart, Trophy, DollarSign } from 'lucide-react';
import type { PortfolioMetrics } from '@/types';

interface KpiCardsProps {
  metrics: PortfolioMetrics;
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

interface CardProps {
  label: string;
  value: string;
  sublabel?: string;
  subValue?: string;
  positive?: boolean;
  icon: React.ReactNode;
  accent: string;
}

function KpiCard({ label, value, sublabel, subValue, positive, icon, accent }: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur transition-all hover:border-slate-700">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-50">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
          {icon}
        </div>
      </div>
      {sublabel && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-xs text-slate-500">{sublabel}</span>
          <span className={`text-sm font-semibold ${positive === undefined ? 'text-slate-300' : positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}

export default function KpiCards({ metrics }: KpiCardsProps) {
  const isGain = metrics.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total Invested"
        value={formatCurrency(metrics.totalInvested)}
        icon={<DollarSign className="h-5 w-5" />}
        accent="#64748b"
      />
      <KpiCard
        label="Market Value"
        value={formatCurrency(metrics.totalMarketValue)}
        icon={<PieChart className="h-5 w-5" />}
        accent="#3b82f6"
      />
      <KpiCard
        label="Total Gain / Loss"
        value={formatCurrency(metrics.totalGainLoss)}
        sublabel="Return"
        subValue={formatPercent(metrics.totalGainLossPercent)}
        positive={isGain}
        icon={isGain ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        accent={isGain ? '#10b981' : '#f43f5e'}
      />
      <KpiCard
        label="Top Performer"
        value={metrics.topPerformer ? metrics.topPerformer.ticker : '—'}
        sublabel="Return"
        subValue={metrics.topPerformer ? formatPercent(metrics.topPerformer.returnPercent) : ''}
        positive={metrics.topPerformer ? metrics.topPerformer.returnPercent >= 0 : undefined}
        icon={<Trophy className="h-5 w-5" />}
        accent="#f59e0b"
      />
    </div>
  );
}
