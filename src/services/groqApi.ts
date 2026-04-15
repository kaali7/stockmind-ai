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
    return `You are StockMind AI, a helpful financial analysis assistant. Be concise, data-driven, and always mention relevant risks. Never give direct buy or sell recommendations.`;
  }

  return `You are StockMind AI, a financial analysis assistant.
Current context:
- Stock: ${ctx.symbol} (${ctx.name})
- Price: $${ctx.price.toFixed(2)}
- Day Change: ${ctx.changePercent >= 0 ? '+' : ''}${ctx.changePercent.toFixed(2)}%
- Sector: ${ctx.sector}
- Market Cap: $${(ctx.marketCap / 1e9).toFixed(0)}B

Provide concise, data-driven answers. Always mention relevant risks. Never give direct buy/sell recommendations.`;
}

export async function sendMessageStream(
  messages: Message[],
  stockContext: StockContext | null,
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = getGroqKey();
  
  if (!apiKey) {
    const mockResponse = getMockResponse(messages, stockContext);
    for (let i = 0; i < mockResponse.length; i++) {
      await new Promise(r => setTimeout(r, 20));
      onChunk(mockResponse[i]);
    }
    return mockResponse;
  }

  const systemPrompt = buildSystemPrompt(stockContext);
  const userMessage = messages[messages.length - 1]?.content || '';

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        stream: true,
        input: [
          { type: 'message', role: 'system', content: systemPrompt },
          ...messages.slice(-8).map(msg => ({
            type: 'message',
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { type: 'message', role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Groq API error:', response.status, errorText);
      const mockResponse = getMockResponse(messages, stockContext);
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(r => setTimeout(r, 20));
        onChunk(mockResponse[i]);
      }
      return mockResponse;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data:')) continue;
        
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.output?.[0]?.response?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onChunk(content);
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    }

    return fullResponse || getMockResponse(messages, stockContext);
  } catch (error) {
    console.warn('Groq API error:', error);
    const mockResponse = getMockResponse(messages, stockContext);
    for (let i = 0; i < mockResponse.length; i++) {
      await new Promise(r => setTimeout(r, 20));
      onChunk(mockResponse[i]);
    }
    return mockResponse;
  }
}

export async function sendMessage(
  messages: Message[],
  stockContext: StockContext
): Promise<string> {
  const apiKey = getGroqKey();
  
  if (!apiKey) {
    return getMockResponse(messages, stockContext);
  }

  const systemPrompt = buildSystemPrompt(stockContext);
  const userMessage = messages[messages.length - 1]?.content || '';

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        input: [
          { type: 'message', role: 'system', content: systemPrompt },
          ...messages.slice(-8).map(msg => ({
            type: 'message',
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { type: 'message', role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Groq API error:', response.status, errorText);
      return getMockResponse(messages, stockContext);
    }

    const data = await response.json();
    return data.output?.[0]?.response?.text || data.output_text || getMockResponse(messages, stockContext);
  } catch (error) {
    console.warn('Groq API error:', error);
    return getMockResponse(messages, stockContext);
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