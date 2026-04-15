import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { ChatTrigger } from './components/chat/ChatTrigger';
import { useStockData } from './hooks/useStockData';
import { useChat } from './hooks/useChat';

function App() {
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { data, loading } = useStockData(currentSymbol);
  
  const stockContext = data
    ? {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        sector: data.sector,
        marketCap: data.marketCap,
      }
    : null;
  
  const { messages, loading: chatLoading, send, newChat } = useChat(stockContext);

  const handleSearch = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
  }, []);

  const handleSelectStock = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
  }, []);

  const handleAskAI = useCallback(() => {
    if (data) {
      const prompt = `Give me an analysis of ${data.symbol} based on its current price of $${data.price.toFixed(2)} and recent performance.`;
      send(prompt);
    }
    setIsChatOpen(true);
  }, [data, send]);

  const handleNewChat = useCallback(() => {
    newChat();
    setIsChatOpen(true);
  }, [newChat]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar
        activeView="dashboard"
        onViewChange={() => {}}
        onNewChat={handleNewChat}
        onSelectStock={handleSelectStock}
        currentSymbol={currentSymbol}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onSearch={handleSearch} currentSymbol={currentSymbol} />
          
          <main className="flex-1 overflow-auto bg-surface p-6">
            <Dashboard
              data={data}
              loading={loading}
              onAskAI={handleAskAI}
            />
          </main>
        </div>
        
        {isChatOpen && (
          <div className="w-[400px] border-l border-surface flex-shrink-0">
            <ChatDrawer
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              messages={messages}
              onSend={send}
              onNewChat={handleNewChat}
              loading={chatLoading}
              currentSymbol={currentSymbol}
            />
          </div>
        )}
      </div>

      {!isChatOpen && (
        <ChatTrigger onClick={() => setIsChatOpen(true)} />
      )}
    </div>
  );
}

export default App;