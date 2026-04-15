import { useState, useRef, useEffect } from 'react';
import { X, Send, Plus, User, MoreHorizontal, Zap } from 'lucide-react';

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

const BotAvatar = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-lg bg-[var(--chat-header-bg)] text-white p-1.5 shadow-sm transition-colors ${className}`}>
    <Bot className="w-full h-full" />
  </div>
);

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
  }, [messages, loading]); // Added loading to scroll to thinking indicator

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-surface-container-low shadow-2xl border-l border-outline-variant/10 overflow-hidden lg:rounded-l-[1.0rem]">
      {/* LeadBot Header */}
      <div className="bg-[var(--chat-header-bg)] p-4 text-white shadow-lg relative z-20 md:p-5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BotAvatar className="h-10 w-10 border-2 border-white/20 dark:border-outline-variant/30" />
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">StockMind AI</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-online absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">Online Now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-auto p-4 space-y-6 bg-surface/50">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-10">
            <div className="relative">
              <BotAvatar className="h-20 w-20 scale-110" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full border-4 border-surface flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-bold text-on-surface tracking-tight">How can I help you today?</h3>
              <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                I'm your AI financial assistant. Ask me to analyze stocks or explain market trends.
              </p>
            </div>

            <div className="w-full px-6 space-y-2 max-w-[320px]">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest text-left mb-3 ml-1">
                Suggested Questions
              </p>
              {[
                `Analyze ${currentSymbol || 'AAPL'} performance`,
                "What is the market sentiment today?",
                "Find high-volume stock movers"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSend(suggestion)}
                  className="w-full text-left p-4 rounded-2xl bg-surface-container-high border border-outline-variant/10 text-xs font-medium text-on-surface hover:bg-primary/10 hover:border-primary/30 hover:-translate-y-0.5 transition-all animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant';
              const isPrevSame = index > 0 && messages[index - 1].role === message.role;
              
              return (
                <div key={index} className={`space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isPrevSame ? '-mt-4' : ''}`}>
                  {isAssistant ? (
                    <div className="flex flex-col items-start gap-1">
                      {!isPrevSame && (
                        <span className="ml-11 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                          StockMind AI
                        </span>
                      )}
                      <div className="flex items-start gap-2 max-w-[90%] w-full">
                        <div className="w-8 shrink-0">
                          {!isPrevSame && <BotAvatar className="h-8 w-8 mt-1 border border-outline-variant/10" />}
                        </div>
                        <div className="bg-surface-container-high text-on-surface p-4 rounded-3xl rounded-tl-sm shadow-sm border border-outline-variant/5 text-[13px] leading-relaxed w-full">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-[var(--chat-user-bg)] text-white p-4 rounded-3xl rounded-tr-sm shadow-md max-w-[85%] text-[13px] leading-relaxed transition-colors">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start gap-1 -mt-4 animate-in fade-in duration-300">
                 {/* Only show header if the last message wasn't also assistant */}
                 {(messages.length === 0 || messages[messages.length-1].role !== 'assistant') && (
                   <span className="ml-11 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                     StockMind AI
                   </span>
                 )}
                 <div className="flex items-start gap-2 max-w-[90%]">
                   <div className="w-8 shrink-0">
                    {(messages.length === 0 || messages[messages.length-1].role !== 'assistant') && (
                      <BotAvatar className="h-8 w-8 mt-1 border border-outline-variant/10" />
                    )}
                   </div>
                   <div className="bg-surface-container-high text-on-surface p-4 rounded-3xl rounded-tl-sm shadow-sm border border-outline-variant/5 flex items-center gap-3">
                     <div className="flex gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-on-surface/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-on-surface/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-on-surface/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                     <span className="text-xs font-semibold text-on-surface/50">Thinking...</span>
                   </div>
                 </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 lg:pb-6">
        <form
          onSubmit={handleSubmit}
          className="relative transition-all group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Reply to StockMind AI...`}
            disabled={loading}
            className="w-full bg-surface-container-highest border border-outline-variant/50 rounded-2xl py-4 pl-5 pr-14 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--chat-header-bg)] text-white shadow-sm hover:scale-105 active:scale-95 disabled:opacity-0 disabled:scale-90 transition-all font-bold"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        <div className="mt-4 flex items-center justify-center gap-2 py-1">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider flex items-center gap-1">
            We're <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400" /> by StockMind
          </span>
        </div>
      </div>
    </div>
  );
}