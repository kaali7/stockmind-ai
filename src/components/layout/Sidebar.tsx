import { useState } from 'react';
import { LineChart, Clock, Plus, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface SidebarProps {
  activeView: 'dashboard' | 'chat';
  onViewChange: (view: 'dashboard' | 'chat') => void;
  onNewChat: () => void;
  onSelectStock: (symbol: string) => void;
  currentSymbol: string;
}

const DEFAULT_STOCKS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA'];

export function Sidebar({ activeView, onViewChange, onNewChat, onSelectStock, currentSymbol }: SidebarProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const allStocks = [...DEFAULT_STOCKS, ...watchlist];

  const handleAddStock = () => {
    const symbol = newSymbol.toUpperCase().trim();
    if (symbol && !allStocks.includes(symbol)) {
      addToWatchlist(symbol);
      setNewSymbol('');
      setIsAdding(false);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    if (!DEFAULT_STOCKS.includes(symbol)) {
      removeFromWatchlist(symbol);
    }
  };

  return (
    <aside className="flex w-56 flex-col bg-surface-container_low">
      <nav className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2 px-3 py-2">
          <LineChart className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary">StockMind AI</span>
        </div>
      </nav>

      <div className="border-t border-surface" />

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-on_surface_variant uppercase tracking-wider">
            Watchlist
          </span>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-surface-container-high rounded transition-colors"
          >
            <Plus className="h-4 w-4 text-on_surface_variant" />
          </button>
        </div>

        {isAdding && (
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Symbol..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
              className="flex-1 bg-surface-container-highest px-2 py-1 text-sm text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-1 focus:ring-primary rounded"
              autoFocus
            />
            <button
              onClick={handleAddStock}
              className="p-1 text-primary hover:bg-surface-container-high rounded"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewSymbol(''); }}
              className="p-1 text-on_surface_variant hover:bg-surface-container-high rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {allStocks.map((symbol) => (
          <div
            key={symbol}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors group ${
              currentSymbol === symbol
                ? 'bg-surface-container-high text-primary'
                : 'text-on_surface_variant hover:bg-surface-container-high hover:text-on_surface'
            }`}
          >
            <button
              onClick={() => onSelectStock(symbol)}
              className="flex items-center flex-1"
            >
              <span className="font-mono">{symbol}</span>
            </button>
            {!DEFAULT_STOCKS.includes(symbol) && (
              <button
                onClick={() => handleRemoveStock(symbol)}
                className="p-1 hover:bg-surface-container-high rounded transition-all"
              >
                <X className="h-3 w-3 text-tertiary" />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}