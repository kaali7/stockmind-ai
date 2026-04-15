import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'chat';
  onViewChange: (view: 'dashboard' | 'chat') => void;
  onNewChat: () => void;
  onSearch: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
  currentSymbol: string;
}

export function Layout({
  children,
  activeView,
  onViewChange,
  onNewChat,
  onSearch,
  onSelectStock,
  currentSymbol,
}: LayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onNewChat={onNewChat}
        onSelectStock={onSelectStock}
        currentSymbol={currentSymbol}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onSearch={onSearch} currentSymbol={currentSymbol} />
        <main className="flex-1 overflow-auto bg-surface p-6">{children}</main>
      </div>
    </div>
  );
}