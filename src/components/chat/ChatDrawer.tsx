import { useState, useRef, useEffect } from 'react';
import { X, Send, Plus, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSend: (content: string) => void;
  onNewChat: () => void;
  loading: boolean;
  currentSymbol?: string;
}

export function ChatDrawer({ 
  isOpen, 
  onClose, 
  messages, 
  onSend, 
  onNewChat, 
  loading,
  currentSymbol 
}: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center justify-between p-4 border-b border-surface">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium text-on_surface">StockMind AI</span>
          {currentSymbol && (
            <span className="font-mono text-sm text-on_surface_variant">({currentSymbol})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-surface text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="h-5 w-5 text-on_surface_variant" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-10 w-10 text-on_surface_variant" />
              <p className="mt-4 text-on_surface">
                Ask me about {currentSymbol || 'stocks'}
              </p>
              <p className="mt-1 text-sm text-on_surface_variant">
                I have context about the current stock
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[85%] items-start gap-2 rounded-xl p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-surface'
                    : 'bg-surface-container text-on_surface'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="mt-1 h-4 w-4 shrink-0" />
                ) : (
                  <User className="mt-1 h-4 w-4 shrink-0" />
                )}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl bg-surface-container p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-on_surface_variant">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-surface p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${currentSymbol}...`}
          disabled={loading}
          className="flex-1 rounded-lg bg-surface-container-highest px-4 py-2 text-sm text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-primary px-3 py-2 text-surface transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}