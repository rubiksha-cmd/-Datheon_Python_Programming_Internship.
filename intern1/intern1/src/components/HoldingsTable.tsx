import { useState, useMemo } from 'react';
import { Search, Trash2, Pencil, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import type { Holding } from '@/types';

interface HoldingsTableProps {
  holdings: Holding[];
  onUpdate: (id: string, updates: Partial<Holding>) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HoldingsTable({ holdings, onUpdate, onDelete }: HoldingsTableProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTicker, setEditTicker] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return holdings;
    return holdings.filter((h) => h.ticker.includes(q));
  }, [holdings, search]);

  function startEdit(h: Holding) {
    setEditingId(h.id);
    setEditTicker(h.ticker);
    setEditBuyPrice(h.buyPrice.toString());
    setEditQuantity(h.quantity.toString());
  }

  function saveEdit(id: string) {
    const bp = parseFloat(editBuyPrice);
    const q = parseFloat(editQuantity);
    if (isNaN(bp) || bp <= 0 || isNaN(q) || q <= 0) return;
    onUpdate(id, { ticker: editTicker.toUpperCase(), buyPrice: bp, quantity: q });
    setEditingId(null);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      {/* Search */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-100">Holdings</h2>
        <div className="relative w-40 sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticker..."
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Ticker</th>
              <th className="px-4 py-3 font-medium text-right">Shares</th>
              <th className="px-4 py-3 font-medium text-right">Avg Buy</th>
              <th className="px-4 py-3 font-medium text-right">Current</th>
              <th className="px-4 py-3 font-medium text-right">Total Value</th>
              <th className="px-4 py-3 font-medium text-right">Gain / Loss</th>
              <th className="px-4 py-3 font-medium text-right">Return</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  {search ? 'No holdings match your search.' : 'No positions yet. Add your first stock to get started.'}
                </td>
              </tr>
            )}
            {filtered.map((h) => {
              const totalValue = h.currentPrice * h.quantity;
              const gainLoss = (h.currentPrice - h.buyPrice) * h.quantity;
              const returnPct = h.buyPrice > 0 ? ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;
              const positive = gainLoss >= 0;
              const isEditing = editingId === h.id;

              return (
                <tr key={h.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                  {/* Ticker */}
                  <td className="px-4 py-3.5">
                    {isEditing ? (
                      <input
                        value={editTicker}
                        onChange={(e) => setEditTicker(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="w-20 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    ) : (
                      <span className="font-bold text-slate-100">{h.ticker}</span>
                    )}
                  </td>
                  {/* Shares */}
                  <td className="px-4 py-3.5 text-right text-slate-300">
                    {isEditing ? (
                      <input
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        type="number"
                        className="w-20 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-right text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    ) : (
                      h.quantity
                    )}
                  </td>
                  {/* Avg Buy */}
                  <td className="px-4 py-3.5 text-right text-slate-300">
                    {isEditing ? (
                      <input
                        value={editBuyPrice}
                        onChange={(e) => setEditBuyPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        className="w-24 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-right text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    ) : (
                      formatCurrency(h.buyPrice)
                    )}
                  </td>
                  {/* Current Price */}
                  <td className="px-4 py-3.5 text-right text-slate-200 tabular-nums">{formatCurrency(h.currentPrice)}</td>
                  {/* Total Value */}
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-100 tabular-nums">{formatCurrency(totalValue)}</td>
                  {/* Gain/Loss */}
                  <td className={`px-4 py-3.5 text-right font-semibold tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className="inline-flex items-center gap-1">
                      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {positive ? '+' : ''}{formatCurrency(gainLoss)}
                    </span>
                  </td>
                  {/* Return % */}
                  <td className={`px-4 py-3.5 text-right font-semibold tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {positive ? '+' : ''}{returnPct.toFixed(2)}%
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(h.id)} className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/25" title="Save">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="rounded-lg bg-slate-700/50 p-1.5 text-slate-400 transition-colors hover:bg-slate-700" title="Cancel">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(h)} className="rounded-lg bg-slate-800 p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDelete(h.id)} className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400 transition-colors hover:bg-rose-500/20" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
