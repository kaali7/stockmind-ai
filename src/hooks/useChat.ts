import { useState, useCallback } from 'react';
import { sendMessageStream } from '../services/groqApi';

interface StockContext {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  industry: string;
  marketCap: number;
  high: number;
  low: number;
  volume: number;
  openPrice: number;
  prevClose: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  webUrl: string;
  ipo: string;
  peers: string[];
  news: Array<{ headline: string; summary: string; source: string; datetime: number }>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(stockContext: StockContext | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages([...updated, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      await sendMessageStream(updated, stockContext, (fullResponse) => {
        // Instant output - no streaming effect
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: fullResponse };
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, stockContext]);

  const newChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, send, newChat };
}