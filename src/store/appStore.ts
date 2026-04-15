import { create } from 'zustand';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry: string;
  prices: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
}

interface AppState {
  currentSymbol: string;
  setCurrentSymbol: (symbol: string) => void;
  
  stockData: StockData | null;
  setStockData: (data: StockData | null) => void;
  
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  activeView: 'dashboard' | 'chat';
  setActiveView: (view: 'dashboard' | 'chat') => void;
  
  chatInitialMessage: string | null;
  setChatInitialMessage: (message: string | null) => void;
  
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; symbol?: string }>;
  addMessage: (message: { role: 'user' | 'assistant'; content: string; symbol?: string }) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSymbol: 'AAPL',
  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
  
  stockData: null,
  setStockData: (data) => set({ stockData: data }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  error: null,
  setError: (error) => set({ error }),
  
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  
  chatInitialMessage: null,
  setChatInitialMessage: (message) => set({ chatInitialMessage: message }),
  
  conversationHistory: [],
  addMessage: (message) =>
    set((state) => ({ conversationHistory: [...state.conversationHistory, message] })),
  clearHistory: () => set({ conversationHistory: [], chatInitialMessage: null }),
}));