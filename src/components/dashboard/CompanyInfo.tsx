import { Building2, TrendingUp, Info, BarChart2, Star, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface CompanyInfoProps {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  onAskAI: () => void;
}

function formatMarketCap(num: number): string {
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}T`;
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toString()}`;
}

function formatPrice(num: number): string {
  return `$${num.toFixed(2)}`;
}

export function CompanyInfo({ 
  symbol,
  name, 
  sector, 
  industry, 
  marketCap, 
  high52Week, 
  low52Week, 
  peRatio,
  onAskAI 
}: CompanyInfoProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAppStore();
  const isWatched = isInWatchlist(symbol);

  const toggleWatchlist = () => {
    if (isWatched) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <div className="rounded-xl bg-surface-container p-4 shadow-sm border border-outline-variant">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-on_surface">Company Info</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleWatchlist}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              isWatched
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-surface-container-highest text-on_surface_variant hover:text-yellow-500'
            }`}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isWatched ? <Trash2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onAskAI}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-surface transition-colors hover:bg-primary/90"
          >
            <Info className="h-3.5 w-3.5" />
            Ask AI
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-4 w-4 text-on_surface_variant" />
          <div>
            <p className="text-sm font-medium text-on_surface">{name}</p>
            <p className="text-xs text-on_surface_variant">{industry}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-4 w-4 text-on_surface_variant" />
          <div>
            <p className="text-xs text-on_surface_variant">Sector</p>
            <p className="text-sm font-medium text-on_surface">{sector}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-4 w-4 text-on_surface_variant" />
          <div>
            <p className="text-xs text-on_surface_variant">Market Cap</p>
            <p className="font-mono text-sm font-medium text-on_surface">
              {formatMarketCap(marketCap)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BarChart2 className="mt-0.5 h-4 w-4 text-on_surface_variant" />
          <div>
            <p className="text-xs text-on_surface_variant">52W Range</p>
            <p className="font-mono text-sm font-medium text-on_surface">
              {formatPrice(low52Week)} - {formatPrice(high52Week)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BarChart2 className="mt-0.5 h-4 w-4 text-on_surface_variant" />
          <div>
            <p className="text-xs text-on_surface_variant">P/E Ratio</p>
            <p className="font-mono text-sm font-medium text-on_surface">
              {peRatio > 0 ? peRatio.toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}