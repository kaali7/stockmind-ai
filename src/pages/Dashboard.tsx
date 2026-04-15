import { useState } from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { PriceChart } from '../components/dashboard/PriceChart';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { RSIChart } from '../components/dashboard/RSIChart';
import { CompanyInfo } from '../components/dashboard/CompanyInfo';
import { KPICardsSkeleton, ChartSkeleton, CompanyInfoSkeleton } from '../components/shared/SkeletonLoader';

interface DashboardProps {
  data: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    marketCap: number;
    sector: string;
    industry: string;
    prices: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
    high52Week: number;
    low52Week: number;
    peRatio: number;
  } | null;
  loading: boolean;
  onAskAI: () => void;
}

export function Dashboard({ data, loading, onAskAI }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  if (loading) {
    return (
      <div className="space-y-6">
        <KPICardsSkeleton />
        <ChartSkeleton />
        <CompanyInfoSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-on_surface">No stock data available</p>
          <p className="mt-2 text-sm text-on_surface_variant">
            Search for a stock to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPICards
        price={data.price}
        change={data.change}
        changePercent={data.changePercent}
        volume={data.volume}
        marketCap={data.marketCap}
        dayHigh={data.high}
        dayLow={data.low}
        stockName={data.name}
        openPrice={data.prices?.[data.prices.length - 1]?.open}
        prevClose={data.prices?.[data.prices.length - 2]?.close}
        high52Week={data.high52Week}
        low52Week={data.low52Week}
        peRatio={data.peRatio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart
            data={data.prices}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            isPositive={data.changePercent >= 0}
          />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <VolumeChart data={data.prices} timeRange={timeRange} />
            </div>
            <div>
              <RSIChart data={data.prices} timeRange={timeRange} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <CompanyInfo
            name={data.name}
            sector={data.sector}
            industry={data.industry}
            marketCap={data.marketCap}
            high52Week={data.high52Week}
            low52Week={data.low52Week}
            peRatio={data.peRatio}
            onAskAI={onAskAI}
          />
        </div>
      </div>
    </div>
  );
}