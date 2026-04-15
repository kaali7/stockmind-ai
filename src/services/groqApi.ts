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

const GROQ_API_URL = 'https://api.groq.com/openai/v1/responses';

const getGroqKey = () => {
  return import.meta.env.VITE_GROQ_KEY || '';
};

function formatMarketCap(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toString()}`;
}

function buildAdvancedSystemPrompt(ctx: StockContext | null): string {
  if (!ctx) {
    return `You are an expert financial analyst AI assistant named StockMind.
    
IMPORTANT INSTRUCTIONS:
- You have knowledge about publicly traded companies from Finnhub API
- Answer questions about company products, services, business model, and operations
- If you don't know specific details, provide based on general knowledge
- Provide deep, actionable insights with proper financial terminology
- Never provide buy/sell recommendations
- Always cite sources when available`;
  }

  const dayChange = ctx.changePercent >= 0 ? '+' : '';
  const priceInRange = ctx.high52Week && ctx.low52Week ? 
    ((ctx.price - ctx.low52Week) / (ctx.high52Week - ctx.low52Week) * 100).toFixed(0) : '50';

  const peerList = ctx.peers && ctx.peers.length > 0 ? ctx.peers.slice(0, 5).join(', ') : 'N/A';
  const recentNews = ctx.news && ctx.news.length > 0 ? 
    ctx.news.slice(0, 3).map((n, i) => `${i + 1}. ${n.headline}`).join('\n') : 'No recent news available';

  return `You are an expert financial analyst AI assistant named StockMind.

 COMPANY PROFILE for ${ctx.symbol} (${ctx.name}):


🏢 BUSINESS OVERVIEW:
- Sector: ${ctx.sector}
- Industry: ${ctx.industry}
${ctx.webUrl ? `- Website: ${ctx.webUrl}` : ''}
${ctx.ipo ? `- IPO Date: ${ctx.ipo}` : ''}

📊 PRICE & PERFORMANCE:
- Current Price: $${ctx.price.toFixed(2)} (${dayChange}${ctx.changePercent.toFixed(2)}% today)
- Day Range: $${ctx.low.toFixed(2)} - $${ctx.high.toFixed(2)}
- Open: $${ctx.openPrice.toFixed(2)} | Previous Close: $${ctx.prevClose.toFixed(2)}

📈 52-WEEK METRICS:
- 52W High: $${ctx.high52Week.toFixed(2)}
- 52W Low: $${ctx.low52Week.toFixed(2)}
- Trading at ${priceInRange}% of 52W range

💰 VALUATION:
- Market Cap: ${formatMarketCap(ctx.marketCap)}
- P/E Ratio: ${ctx.peRatio > 0 ? ctx.peRatio.toFixed(2) : 'N/A'}

🏭 PEER COMPANIES: ${peerList}

📰 RECENT NEWS:
${recentNews}

ANALYSIS REQUIREMENTS:
- Answer questions about company's products, services, and business
- Use the data above for financial insights
- Cite specific numbers from the provided data
- Never provide buy/sell recommendations
- Include risk factors in analysis`;
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

  const systemPrompt = buildAdvancedSystemPrompt(stockContext);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 800,
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
  
  if (!ctx) {
    return `I'd be happy to help! Search for a stock symbol first to get detailed analysis.`;
  }
  
  if (lastMessage.includes('product') || lastMessage.includes('service') || lastMessage.includes('sell')) {
    return `${ctx.name} operates in the ${ctx.sector} sector, specifically in the ${ctx.industry} industry. For specific product details, I'd recommend visiting their website at ${ctx.webUrl || 'their investor relations page'}.`;
  }
  
  if (lastMessage.includes('price') || lastMessage.includes('analysis') || lastMessage.includes('how')) {
    const change = ctx.changePercent >= 0 ? 'up' : 'down';
    return `Here's a detailed analysis of ${ctx.symbol} (${ctx.name}):

**Current Price:** $${ctx.price.toFixed(2)}
**Today's Change:** ${change} ${Math.abs(ctx.changePercent).toFixed(2)}%
**Market Cap:** ${formatMarketCap(ctx.marketCap)}
**P/E Ratio:** ${ctx.peRatio > 0 ? ctx.peRatio.toFixed(2) : 'N/A'}
**Sector:** ${ctx.sector}

*Note: Connect your Groq API key for full AI analysis.*`;
  }
  
  if (lastMessage.includes('sector') || lastMessage.includes('industry')) {
    return `${ctx.name} operates in the ${ctx.sector} sector, specifically within the ${ctx.industry} industry.`;
  }
  
  if (lastMessage.includes('news')) {
    const news = ctx.news && ctx.news.length > 0 ? 
      ctx.news.slice(0, 3).map(n => `- ${n.headline}`).join('\n') : 'No recent news available';
    return `Here are recent news for ${ctx.symbol}:\n${news}`;
  }
  
  if (lastMessage.includes('peer') || lastMessage.includes('competitor')) {
    const peers = ctx.peers && ctx.peers.length > 0 ? ctx.peers.slice(0, 5).join(', ') : 'N/A';
    return `Peer companies for ${ctx.name} include: ${peers}`;
  }
  
  if (lastMessage.includes('recommend') || lastMessage.includes('buy') || lastMessage.includes('sell')) {
    return "I cannot provide buy or sell recommendations. I'm an AI assistant focused on data-driven analysis. Please consult with a qualified financial advisor. All investments carry risk.";
  }
  
  if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
    return `Hello! I'm StockMind, your AI-powered financial analyst. I can provide deep analysis including company overview, products/services, financial metrics, and recent news. What would you like to know about ${ctx.symbol}?`;
  }
  
  return `I can provide comprehensive analysis of ${ctx.symbol} (${ctx.name}). Ask me about:
• Company products and services
• Price performance and trends
• Valuation metrics (P/E, market cap)
• Recent news
• Competitors/peer companies
• Risk factors

What would you like to know?`;
}