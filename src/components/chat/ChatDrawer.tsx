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
    <div className="flex flex-col h-full bg-surface-container-low shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-surface-container-highest shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-on_surface">StockMind AI</span>
            {currentSymbol && (
              <span className="text-xs font-medium text-on_surface_variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                {currentSymbol} Active
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-highest text-on_surface_variant transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-on_surface">
                  Ask me about {currentSymbol || 'stocks'}
                </p>
                <p className="mt-1 text-xs text-on_surface_variant max-w-[200px] mx-auto">
                  I can analyze technical indicators, news, and market sentiment.
                </p>
              </div>
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
                className={`flex max-w-[85%] items-start gap-3 rounded-2xl p-3.5 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-surface rounded-br-sm'
                    : 'bg-surface-container-highest text-on_surface border border-outline-variant/10 rounded-bl-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="mt-0.5 bg-surface-container rounded-full p-1 border border-outline-variant/20 shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="mt-0.5 shrink-0 opacity-80">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm bg-surface-container-highest p-3.5 border border-outline-variant/10 shadow-sm">
              <div className="bg-surface-container rounded-full p-1 border border-outline-variant/20 shrink-0">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              </div>
              <span className="text-sm font-medium text-on_surface_variant">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface-container-low border-t border-surface-container-highest/50">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full p-1 pl-4 border border-outline-variant/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message StockMind AI...`}
            disabled={loading}
            className="flex-1 bg-transparent py-2 text-sm text-on_surface placeholder:text-on_surface_variant focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-primary text-surface transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-on_surface_variant/70">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
}