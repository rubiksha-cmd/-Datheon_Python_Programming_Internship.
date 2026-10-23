import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, RefreshCw, Activity, TrendingUp } from 'lucide-react';
import type { Holding } from '@/types';
import { loadHoldings, saveHoldings } from '@/lib/storage';
import { getBasePrice, fluctuatePrice } from '@/lib/mockPrices';
import { computeMetrics, generateCSV, downloadCSV } from '@/lib/portfolio';
import PortfolioForm from '@/components/PortfolioForm';
import KpiCards from '@/components/KpiCards';
import HoldingsTable from '@/components/HoldingsTable';

export default function App() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [volatilityOn, setVolatilityOn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setHoldings(loadHoldings());
  }, []);

  // Persist to localStorage
  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  // Volatility simulation
  useEffect(() => {
    if (volatilityOn) {
      intervalRef.current = setInterval(() => {
        setHoldings((prev) =>
          prev.map((h) => ({ ...h, currentPrice: fluctuatePrice(h.currentPrice, 1.5) }))
        );
      }, 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [volatilityOn]);

  const metrics = computeMetrics(holdings);

  const handleAdd = useCallback((ticker: string, buyPrice: number, quantity: number) => {
    const newHolding: Holding = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ticker,
      buyPrice,
      quantity,
      currentPrice: getBasePrice(ticker),
    };
    setHoldings((prev) => [...prev, newHolding]);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Holding>) => {
    setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleRefreshPrices = useCallback(() => {
    setRefreshing(true);
    setHoldings((prev) =>
      prev.map((h) => ({ ...h, currentPrice: fluctuatePrice(h.currentPrice, 3) }))
    );
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (holdings.length === 0) return;
    const csv = generateCSV(holdings, metrics);
    downloadCSV(csv, 'portfolio_summary.csv');
  }, [holdings, metrics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-50">Portfolio Tracker</h1>
                <p className="text-sm text-slate-400">Track investments with live price simulation</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setVolatilityOn((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                volatilityOn
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Activity className={`h-4 w-4 ${volatilityOn ? 'animate-pulse' : ''}`} />
              {volatilityOn ? 'Volatility: On' : 'Volatility: Off'}
            </button>

            <button
              onClick={handleRefreshPrices}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleExportCSV}
              disabled={holdings.length === 0}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <KpiCards metrics={metrics} />

        {/* Main content grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form - left sidebar on desktop */}
          <div className="lg:col-span-1">
            <PortfolioForm onAdd={handleAdd} />
          </div>

          {/* Table - main area */}
          <div className="lg:col-span-2">
            <HoldingsTable holdings={holdings} onUpdate={handleUpdate} onDelete={handleDelete} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-slate-600">
          Prices are simulated for demonstration. Not financial advice.
        </footer>
      </div>
    </div>
  );
}
