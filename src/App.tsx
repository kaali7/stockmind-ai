import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { ChatTrigger } from './components/chat/ChatTrigger';
import { ErrorToast } from './components/shared/ErrorToast';
import { useStockData } from './hooks/useStockData';
import { useChat } from './hooks/useChat';

function App() {
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [prevValidSymbol, setPrevValidSymbol] = useState('AAPL');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { data, loading, notFound, clearNotFound } = useStockData(currentSymbol);
  
  const stockContext = data
    ? {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        sector: data.sector,
        industry: data.industry,
        marketCap: data.marketCap,
        high: data.high,
        low: data.low,
        volume: data.volume,
        openPrice: data.prices?.[data.prices.length - 1]?.open || 0,
        prevClose: data.prices?.[data.prices.length - 2]?.close || data.price,
        high52Week: data.high52Week,
        low52Week: data.low52Week,
        peRatio: data.peRatio,
        webUrl: data.webUrl,
        ipo: data.ipo,
        peers: data.peers,
        news: data.news,
      }
    : null;
  
  const { messages, loading: chatLoading, send, newChat } = useChat(stockContext);

  const handleSearch = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
  }, []);

  const handleDismissError = useCallback(() => {
    setCurrentSymbol(prevValidSymbol);
    clearNotFound();
  }, [prevValidSymbol, clearNotFound]);

  useEffect(() => {
    if (data && data.price > 0 && !notFound) {
      setPrevValidSymbol(currentSymbol);
    }
  }, [data, notFound, currentSymbol]);

  const handleSelectStock = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
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
    setIsSidebarOpen(false); // Close sidebar if starting new chat from sidebar
  }, [newChat]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0 h-full shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          activeView="dashboard"
          onViewChange={() => {}}
          onNewChat={handleNewChat}
          onSelectStock={handleSelectStock}
          currentSymbol={currentSymbol}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          {!isSidebarOpen && (
            <Header 
              onSearch={handleSearch} 
              currentSymbol={currentSymbol} 
              onMenuClick={() => setIsSidebarOpen(true)} 
            />
          )}
          
          <main className="flex-1 overflow-auto bg-surface px-3 py-4 md:p-6 pb-24 md:pb-6">
            <Dashboard
              data={data}
              loading={loading}
              onAskAI={handleAskAI}
            />
          </main>
        </div>
        
        {isChatOpen && (
          <div className="absolute inset-0 lg:static z-50 lg:z-auto w-full lg:w-[400px] border-l border-surface flex-shrink-0 bg-surface overflow-hidden h-full">
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
        <div className="fixed bottom-6 right-6 z-40 lg:absolute">
          <ChatTrigger onClick={() => setIsChatOpen(true)} />
        </div>
      )}

      {notFound && (
        <ErrorToast
          error={notFound}
          onDismiss={handleDismissError}
        />
      )}
    </div>
  );
}

export default App;