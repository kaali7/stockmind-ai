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

const GROQ_API_URL = 'https://api.groq.com/openai/v1/responses';

const getGroqKey = () => {
  return import.meta.env.VITE_GROQ_KEY || '';
};

function buildSystemPrompt(ctx: StockContext | null): string {
  if (!ctx) {
    return `You are StockMind AI, a helpful financial analysis assistant.
IMPORTANT: 
- Be concise and direct in your answers
- Never repeat information from previous messages
- Never repeat the user's question back to them
- Don't give direct buy or sell recommendations
- Always mention relevant risks`;
  }

  return `You are StockMind AI, a financial analysis assistant.
Current context:
- Stock: ${ctx.symbol} (${ctx.name})
- Price: $${ctx.price.toFixed(2)}
- Day Change: ${ctx.changePercent >= 0 ? '+' : ''}${ctx.changePercent.toFixed(2)}%
- Sector: ${ctx.sector}
- Market Cap: $${(ctx.marketCap / 1e9).toFixed(0)}B

IMPORTANT:
- Be concise and direct in your answers
- Never repeat information from previous messages
- Never repeat the user's question back to them
- Don't give direct buy or sell recommendations
- Always mention relevant risks`;
}

export async function sendMessageStream(
  messages: Message[],
  stockContext: StockContext | null,
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = getGroqKey();
  
  if (!apiKey) {
    const mockResponse = getMockResponse(messages, stockContext);
    onChunk(mockResponse);
    return mockResponse;
  }

  const systemPrompt = buildSystemPrompt(stockContext);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 500,
        input: [
          { type: 'message', role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            type: 'message',
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Groq API error:', response.status, errorText);
      const mockResponse = getMockResponse(messages, stockContext);
      onChunk(mockResponse);
      return mockResponse;
    }

    const data = await response.json();
    const fullResponse = data.output?.[0]?.response?.text || data.output_text || getMockResponse(messages, stockContext);
    
    // Instant output
    onChunk(fullResponse);
    
    return fullResponse;
  } catch (error) {
    console.warn('Groq API error:', error);
    const mockResponse = getMockResponse(messages, stockContext);
    onChunk(mockResponse);
    return mockResponse;
  }
}

function getMockResponse(messages: Message[], ctx: StockContext | null): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  if (lastMessage.includes('price') || lastMessage.includes('analysis') || lastMessage.includes('how')) {
    if (!ctx) {
      return "I don't have stock context data available. Please search for a stock first.";
    }
    
    const direction = ctx.changePercent >= 0 ? 'up' : 'down';
    return `Here's the current data for ${ctx.symbol}:\n\n` +
      `• Price: $${ctx.price.toFixed(2)} (${direction} ${Math.abs(ctx.changePercent).toFixed(2)}% today)\n` +
      `• Market Cap: $${(ctx.marketCap / 1e9).toFixed(0)}B\n` +
      `• Sector: ${ctx.sector}\n\n` +
      `Note: This is for educational purposes only. Always do your own research.`;
  }
  
  if (lastMessage.includes('recommend') || lastMessage.includes('buy') || lastMessage.includes('sell')) {
    return "I can't provide buy or sell recommendations. I can help analyze the data - always consult a financial advisor for investments.";
  }
  
  if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
    return `Hello! I'm StockMind AI. Ask me about ${ctx?.symbol || 'any stock'}!`;
  }
  
  return `I can help you analyze ${ctx?.symbol || 'stocks'}. Ask about prices, performance, or metrics.`;
}