import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PriceChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  timeRange: '1W' | '1M' | '3M' | '1Y';
  onTimeRangeChange: (range: '1W' | '1M' | '3M' | '1Y') => void;
  isPositive: boolean;
}

const TIME_RANGES = ['1W', '1M', '3M', '1Y'] as const;

function calculateSMA(data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>, period: number): (number | null)[] {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

function filterDataByRange(
  data: PriceChartProps['data'],
  range: '1W' | '1M' | '3M' | '1Y'
) {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  let cutoffDays: number;
  
  switch (range) {
    case '1W':
      cutoffDays = 7;
      break;
    case '1M':
      cutoffDays = 30;
      break;
    case '3M':
      cutoffDays = 90;
      break;
    case '1Y':
      cutoffDays = 365;
      break;
    default:
      cutoffDays = 365;
  }
  
  const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
  const filtered = data.filter((item) => new Date(item.date) >= cutoffDate);
  
  const sma50 = calculateSMA(filtered, 50);
  const sma200 = calculateSMA(filtered, 200);
  
  return filtered.map((item, index) => ({
    ...item,
    sma50: sma50[index],
    sma200: sma200[index],
  }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload.reduce((acc: Record<string, number>, p: any) => {
      acc[p.dataKey] = p.value;
      return acc;
    }, {});
    
    return (
      <div className="rounded-lg border border-surface bg-surface-container p-3 shadow-lg">
        <p className="font-mono text-xs text-on_surface_variant">{label}</p>
        <div className="mt-1 space-y-1">
          <p className="font-mono text-sm text-primary">
            Close: ${data.close?.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-on_surface_variant">
            O: ${data.open?.toFixed(2)} H: ${data.high?.toFixed(2)} L: ${data.low?.toFixed(2)}
          </p>
          {data.sma50 && (
            <p className="font-mono text-xs text-[#fbbf24]">SMA 50: ${data.sma50.toFixed(2)}</p>
          )}
          {data.sma200 && (
            <p className="font-mono text-xs text-[#f472b6]">SMA 200: ${data.sma200.toFixed(2)}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function PriceChart({
  data,
  timeRange,
  onTimeRangeChange,
  isPositive,
}: PriceChartProps) {
  const chartData = filterDataByRange(data, timeRange);
  const color = isPositive ? '#4ae176' : '#ffb3ad';

  return (
    <div className="rounded-xl bg-surface-container p-4 shadow-sm border border-outline-variant">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-on_surface">Price Chart (OHLC + SMA)</h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-surface'
                  : 'text-on_surface_variant hover:bg-surface-container-high hover:text-on_surface'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#464554"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#c7c4d7', fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#c7c4d7', fontSize: 10 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['auto', 'auto']}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGradient)"
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#fbbf24"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 5"
              name="SMA 50"
            />
            <Line
              type="monotone"
              dataKey="sma200"
              stroke="#f472b6"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 5"
              name="SMA 200"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-3 flex gap-4 text-xs text-on_surface_variant">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#fbbf24]"></span>
          SMA 50
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#f472b6]"></span>
          SMA 200
        </span>
      </div>
    </div>
  );
}