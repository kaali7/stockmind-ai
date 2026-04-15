import { useState } from 'react';
import { Search, LineChart, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';

interface HeaderProps {
  onSearch: (symbol: string) => void;
  currentSymbol: string;
  onMenuClick?: () => void;
}

export function Header({ onSearch, currentSymbol, onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const symbol = query.toUpperCase().trim();
    if (symbol) {
      onSearch(symbol);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-surface-container_low px-4 md:px-6 border-b border-surface">
      <div className="flex items-center lg:hidden mr-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <Menu className="h-5 w-5 text-on_surface" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 mr-3 md:mr-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on_surface_variant" />
          <input
            type="text"
            name="symbol"
            placeholder="Search ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg bg-surface-container-highest pl-10 pr-10 text-sm text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-container transition-colors"
            >
              <X className="h-4 w-4 text-on_surface_variant" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-2 md:px-4 text-sm font-medium text-[var(--search-btn-text)] transition-colors hover:opacity-90 min-w-max flex items-center gap-2"
        >
          <Search className="h-4 w-4 md:hidden" />
          <span className="hidden md:inline">Search</span>
          <span className="md:hidden">Go</span>
        </button>
      </form>

      <ThemeToggle />
    </header>
  );
}