import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Building2, ArrowUpDown } from 'lucide-react';

interface KPICardsProps {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh?: number;
  dayLow?: number;
  stockName?: string;
  openPrice?: number;
  prevClose?: number;
  high52Week?: number;
  low52Week?: number;
  peRatio?: number;
}

function formatNumber(num: number): string {
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}T`;
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

export function KPICards({ 
  price, 
  change, 
  changePercent, 
  volume, 
  marketCap, 
  dayHigh, 
  dayLow, 
  stockName,
  openPrice,
  prevClose,
  high52Week,
  low52Week,
  peRatio 
}: KPICardsProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="grid grid-cols-6 gap-3">
      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <Building2 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">Stock</span>
        </div>
        <div className="mt-1 font-mono text-sm font-semibold text-primary truncate">
          {stockName?.split(' ')[0] || 'N/A'}
        </div>
        <div className="mt-0.5 text-[9px] text-on_surface_variant truncate">{stockName || 'Company'}</div>
      </div>

      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">Price</span>
        </div>
        <div className="mt-1 font-mono text-lg font-semibold text-on_surface">
          ${price.toFixed(2)}
        </div>
        <div className={`mt-0.5 flex items-center gap-1 text-[10px] ${isPositive ? 'text-secondary' : 'text-tertiary'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="font-mono">
            {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">Open</span>
        </div>
        <div className="mt-1 font-mono text-lg font-semibold text-on_surface">
          ${(openPrice || price * 0.99).toFixed(2)}
        </div>
        <div className="mt-0.5 text-[10px] text-on_surface_variant">Prev: ${(prevClose || price).toFixed(2)}</div>
      </div>

      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">Volume</span>
        </div>
        <div className="mt-1 font-mono text-lg font-semibold text-on_surface">
          {formatNumber(volume)}
        </div>
        <div className="mt-0.5 text-[10px] text-on_surface_variant">Trading vol</div>
      </div>

      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <Activity className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">M.Cap</span>
        </div>
        <div className="mt-1 font-mono text-lg font-semibold text-on_surface">
          {formatNumber(marketCap)}
        </div>
        <div className="mt-0.5 text-[10px] text-on_surface_variant">Market value</div>
      </div>

      <div className="rounded-xl bg-surface-container p-3">
        <div className="flex items-center gap-2 text-on_surface_variant">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase">Day Range</span>
        </div>
        <div className="mt-1 font-mono text-sm font-semibold text-on_surface">
          ${(dayLow || price * 0.98).toFixed(2)} - ${(dayHigh || price * 1.02).toFixed(2)}
        </div>
        <div className="mt-0.5 text-[10px] text-on_surface_variant">52W: ${(low52Week || price * 0.75).toFixed(0)} - ${(high52Week || price * 1.25).toFixed(0)}</div>
      </div>
    </div>
  );
}