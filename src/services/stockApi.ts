const FINNHUB_BASE = 'https://finnhub.io/api/v1';

const getFinnhubKey = () => {
  return import.meta.env.VITE_FINNHUB_KEY || '';
};

export async function getQuote(symbol: string) {
  const key = getFinnhubKey();
  if (!key) {
    console.log('No Finnhub key, using mock quote');
    return getMockQuote(symbol);
  }
  
  try {
    const response = await fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${key}`);
    if (!response.ok) {
      console.warn(`Finnhub quote failed with ${response.status}, using mock data`);
      return getMockQuote(symbol);
    }
    const data = await response.json();
    if (!data.c) {
      console.warn('Finnhub returned empty quote, using mock data');
      return getMockQuote(symbol);
    }
    return data;
  } catch (error) {
    console.warn('Finnhub API error, using mock data', error);
    return getMockQuote(symbol);
  }
}

export async function getDailyPrices(symbol: string, from?: number, to?: number) {
  const key = getFinnhubKey();
  const fromTime = from || Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  const toTime = to || Math.floor(Date.now() / 1000);
  
  if (!key) {
    return getMockPrices(symbol);
  }
  
  try {
    const response = await fetch(
      `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=D&from=${fromTime}&to=${toTime}&token=${key}`
    );
    if (!response.ok) {
      console.warn(`Finnhub candle failed with ${response.status}, using mock data`);
      return getMockPrices(symbol);
    }
    const data = await response.json();
    if (!data.c || !data.c.length) {
      console.warn('Finnhub returned empty prices, using mock data');
      return getMockPrices(symbol);
    }
    return data;
  } catch (error) {
    console.warn('Finnhub candle error, using mock data', error);
    return getMockPrices(symbol);
  }
}

export async function getStockMetrics(symbol: string) {
  const key = getFinnhubKey();
  
  if (!key) {
    return getMockMetrics(symbol);
  }
  
  try {
    const response = await fetch(`${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${key}`);
    if (!response.ok) {
      console.warn('Finnhub metrics failed, using mock data');
      return getMockMetrics(symbol);
    }
    const data = await response.json();
    if (!data.metrics) {
      return getMockMetrics(symbol);
    }
    return data.metrics;
  } catch (error) {
    console.warn('Finnhub metrics error, using mock data', error);
    return getMockMetrics(symbol);
  }
}

export async function getCompanyProfile(symbol: string) {
  const key = getFinnhubKey();
  
  if (!key) {
    return getMockProfile(symbol);
  }
  
  try {
    const response = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${key}`);
    if (!response.ok) {
      console.warn('Finnhub profile failed, using mock data');
      return getMockProfile(symbol);
    }
    const data = await response.json();
    if (!data.name) {
      return getMockProfile(symbol);
    }
    return data;
  } catch (error) {
    console.warn('Finnhub profile error, using mock data', error);
    return getMockProfile(symbol);
  }
}

function getMockQuote(symbol: string) {
  const mockPrices: Record<string, number> = {
    AAPL: 182.63,
    TSLA: 248.50,
    GOOGL: 141.80,
    MSFT: 378.91,
    NVDA: 875.28,
  };
  
  const price = mockPrices[symbol] || 100;
  const change = price * (Math.random() * 0.04 - 0.02);
  const prevClose = price * (1 + Math.random() * 0.02 - 0.01);
  
  return {
    c: price,
    d: change,
    dp: (change / price) * 100,
    h: price * 1.02,
    l: price * 0.98,
    o: price * (1 + Math.random() * 0.02 - 0.01),
    v: Math.floor(Math.random() * 50000000) + 10000000,
    pc: prevClose,
  };
}

function getMockPrices(symbol: string) {
  const basePrice = getMockQuote(symbol).c;
  const prices: number[] = [];
  const dates: number[] = [];
  const volumes: number[] = [];
  
  let currentPrice = basePrice * 0.95;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 365; i >= 0; i--) {
    const dayTime = now - i * 24 * 60 * 60;
    const dailyChange = (Math.random() - 0.48) * 0.025;
    currentPrice = currentPrice * (1 + dailyChange);
    prices.push(currentPrice);
    dates.push(dayTime);
    volumes.push(Math.floor(Math.random() * 30000000) + 5000000);
  }
  
  return {
    c: prices,
    h: prices.map(p => p * 1.02),
    l: prices.map(p => p * 0.98),
    o: prices.map((p, i) => (i > 0 ? prices[i - 1] : p)),
    v: volumes,
    t: dates,
  };
}

function getMockProfile(symbol: string) {
  const profiles: Record<string, any> = {
    AAPL: { name: 'Apple Inc.', finnhubIndustry: 'Technology', industry: 'Consumer Electronics', marketCapitalization: 2870, logo: '' },
    TSLA: { name: 'Tesla, Inc.', finnhubIndustry: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCapitalization: 790, logo: '' },
    GOOGL: { name: 'Alphabet Inc.', finnhubIndustry: 'Technology', industry: 'Internet Services', marketCapitalization: 1780, logo: '' },
    MSFT: { name: 'Microsoft Corporation', finnhubIndustry: 'Technology', industry: 'Software', marketCapitalization: 2820, logo: '' },
    NVDA: { name: 'NVIDIA Corporation', finnhubIndustry: 'Technology', industry: 'Semiconductors', marketCapitalization: 2160, logo: '' },
  };
  
  return profiles[symbol] || { name: symbol, sector: 'Unknown', industry: 'Unknown', marketCapitalization: 0, logo: '' };
}

function getMockMetrics(symbol: string) {
  const mockPrices: Record<string, number> = {
    AAPL: 182.63,
    TSLA: 248.50,
    GOOGL: 141.80,
    MSFT: 378.91,
    NVDA: 875.28,
  };
  const price = mockPrices[symbol] || 100;
  
  return {
    '52WeekHigh': { historical: price * 1.25 },
    '52WeekLow': { historical: price * 0.75 },
    'peRatioTTM': { trailing: price / 25 },
  };
}