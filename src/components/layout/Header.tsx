import { Search, LineChart, Menu } from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';

interface HeaderProps {
  onSearch: (symbol: string) => void;
  currentSymbol: string;
  onMenuClick?: () => void;
}

export function Header({ onSearch, currentSymbol, onMenuClick }: HeaderProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const symbol = formData.get('symbol')?.toString().toUpperCase().trim();
    if (symbol) {
      onSearch(symbol);
    }
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
            className="h-10 w-full rounded-lg bg-surface-container-highest pl-10 pr-4 text-sm text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-2 md:px-4 text-sm font-medium text-white dark:text-black transition-colors hover:opacity-90 min-w-max"
        >
          Search
        </button>
      </form>

      <ThemeToggle />
    </header>
  );
}