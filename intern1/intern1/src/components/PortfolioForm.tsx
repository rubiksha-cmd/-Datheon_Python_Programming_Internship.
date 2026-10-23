import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { PRESET_STOCKS } from '@/lib/mockPrices';

interface PortfolioFormProps {
  onAdd: (ticker: string, buyPrice: number, quantity: number) => void;
}

interface FormErrors {
  ticker?: string;
  buyPrice?: string;
  quantity?: string;
}

export default function PortfolioForm({ onAdd }: PortfolioFormProps) {
  const [ticker, setTicker] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // force ticker to uppercase live
  useEffect(() => {
    setTicker((t) => (t === t.toUpperCase() ? t : t.toUpperCase()));
  }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!ticker.trim()) e.ticker = 'Ticker is required';
    else if (!/^[A-Z]{1,6}$/.test(ticker.trim())) e.ticker = '1–6 uppercase letters only';

    const bp = parseFloat(buyPrice);
    if (!buyPrice || isNaN(bp)) e.buyPrice = 'Enter a valid price';
    else if (bp <= 0) e.buyPrice = 'Must be positive';

    const q = parseFloat(quantity);
    if (!quantity || isNaN(q)) e.quantity = 'Enter a quantity';
    else if (q <= 0) e.quantity = 'Must be positive';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onAdd(ticker.trim().toUpperCase(), parseFloat(buyPrice), parseFloat(quantity));
    setTicker('');
    setBuyPrice('');
    setQuantity('');
    setErrors({});
  }

  function applyPreset(symbol: string) {
    setTicker(symbol);
    if (!buyPrice) setBuyPrice((Math.random() * 300 + 50).toFixed(2));
    if (!quantity) setQuantity('10');
    setErrors({});
  }

  const inputCls = 'w-full rounded-xl bg-slate-800/60 border px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2';

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <Plus className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">Add Position</h2>
      </div>

      {/* Preset quick-add */}
      <div className="mb-5">
        <p className="text-xs font-medium text-slate-400 mb-2">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_STOCKS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applyPreset(s)}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Ticker Symbol</label>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            maxLength={6}
            className={`${inputCls} ${errors.ticker ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50'}`}
          />
          {errors.ticker && <p className="mt-1 text-xs text-rose-400">{errors.ticker}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Buy Price ($)</label>
            <input
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="150.00"
              type="number"
              step="0.01"
              min="0"
              className={`${inputCls} ${errors.buyPrice ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50'}`}
            />
            {errors.buyPrice && <p className="mt-1 text-xs text-rose-400">{errors.buyPrice}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Quantity (shares)</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              type="number"
              step="1"
              min="0"
              className={`${inputCls} ${errors.quantity ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50'}`}
            />
            {errors.quantity && <p className="mt-1 text-xs text-rose-400">{errors.quantity}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Add to Portfolio
        </button>

        {(ticker || buyPrice || quantity) && (
          <button
            type="button"
            onClick={() => { setTicker(''); setBuyPrice(''); setQuantity(''); setErrors({}); }}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            <X className="h-4 w-4" /> Clear form
          </button>
        )}
      </form>
    </div>
  );
}
