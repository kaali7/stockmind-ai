import { useState, useCallback } from 'react';
import { sendMessage } from '../services/groqApi';

interface StockContext {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: number;
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
    setMessages(updated);
    setLoading(true);

    try {
      const reply = await sendMessage(updated, stockContext);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...updated,
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