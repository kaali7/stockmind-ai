import { useEffect, useState, useCallback } from 'react';
import { getQuote, getDailyPrices, getCompanyProfile, getCompanyPeers, getCompanyNews, getStockMetrics, searchSymbols } from '../services/stockApi';

export interface NotFoundError {
  symbol: string;
  suggestions: string[];
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  openPrice: number;
  prevClose: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry: string;
  prices: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  webUrl: string;
 ipo: string;
  peers: string[];
  news: Array<{ headline: string; summary: string; source: string; datetime: number }>;
}

export function useStockData(symbol: string | null) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<NotFoundError | null>(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = `stock_${symbol}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const cacheAge = Date.now() - parsed.timestamp;
          if (cacheAge < 5 * 60 * 1000) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      try {
        const [quote, prices, profile, metrics, peers, news] = await Promise.all([
          getQuote(symbol),
          getDailyPrices(symbol),
          getCompanyProfile(symbol),
          getStockMetrics(symbol),
          getCompanyPeers(symbol),
          getCompanyNews(symbol),
        ]);

        if (!quote.c && !profile.name) {
          const searchResults = await searchSymbols(symbol);
          const suggestions = searchResults.slice(0, 3).map(r => r.symbol);
          setNotFound({ symbol, suggestions });
          setLoading(false);
          return;
        }

        const formattedPrices =
          prices.t && prices.c
            ? prices.t.map((timestamp: number, index: number) => ({
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                open: prices.o[index],
                high: prices.h[index],
                low: prices.l[index],
                close: prices.c[index],
                volume: prices.v[index],
              }))
            : [];

        const stockData: StockData = {
          symbol,
          name: profile.name || symbol,
          price: quote.c || 0,
          change: quote.d || 0,
          changePercent: quote.dp || 0,
          high: quote.h || 0,
          low: quote.l || 0,
          openPrice: quote.o || 0,
          prevClose: quote.pc || quote.c || 0,
          volume: quote.v || 0,
          marketCap: profile.marketCapitalization || 0,
          sector: profile.finnhubIndustry || profile.sector || 'Unknown',
          industry: profile.finnhubIndustry || 'Unknown',
          prices: formattedPrices,
          high52Week: metrics?.['52WeekHigh']?.historical || quote.c * 1.25 || 0,
          low52Week: metrics?.['52WeekLow']?.historical || quote.c * 0.75 || 0,
          peRatio: metrics?.['peRatioTTM']?.trailing || 0,
          webUrl: profile.weburl || '',
          ipo: profile.ipo || '',
          peers: peers || [],
          news: news.map((n: any) => ({
            headline: n.headline || '',
            summary: n.summary || '',
            source: n.source || '',
            datetime: n.datetime || 0,
          })) || [],
        };

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ data: stockData, timestamp: Date.now() })
        );

        setData(stockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const clearNotFound = useCallback(() => {
    setNotFound(null);
  }, []);

  return { data, loading, error, notFound, clearNotFound };
}