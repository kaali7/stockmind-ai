import { useState, useEffect, useRef } from 'react';
import { Search, LineChart, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';
import { searchSymbols } from '../../services/stockApi';
import type { SymbolSearchResult } from '../../services/stockApi';

interface HeaderProps {
  onSearch: (symbol: string) => void;
  currentSymbol: string;
  onMenuClick?: () => void;
}

export function Header({ onSearch, currentSymbol, onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SymbolSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 1) {
        setLoadingSuggestions(true);
        const results = await searchSymbols(query);
        setSuggestions(results.slice(0, 3));
        setLoadingSuggestions(false);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

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
        <div className="relative flex-1" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on_surface_variant" />
          <input
            type="text"
            name="symbol"
            placeholder="Search ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 1 && setShowDropdown(true)}
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
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-surface bg-surface-container bg-surface-container-highest shadow-lg overflow-hidden z-50">
              {suggestions.map((result) => (
                <button
                  key={result.symbol}
                  type="button"
                  onClick={() => {
                    onSearch(result.symbol);
                    setQuery('');
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-surface-container transition-colors"
                >
                  <span className="font-medium text-on_surface">{result.symbol}</span>
                  <span className="text-sm text-on_surface_variant truncate ml-2">{result.name}</span>
                </button>
              ))}
            </div>
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