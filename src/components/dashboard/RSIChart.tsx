import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface RSIChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  timeRange: '1W' | '1M' | '3M' | '1Y';
}

function calculateRSI(
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>,
  period: number = 14
): Array<{ date: string; rsi: number | null }> {
  if (!data || data.length < period + 1) {
    return data.map(item => ({ date: item.date, rsi: null }));
  }

  const rsiData: Array<{ date: string; rsi: number | null }> = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsiData.push({ date: data[i].date, rsi: null });
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsiData.push({ date: data[i].date, rsi: 100 });
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push({ date: data[i].date, rsi });
      }
    }
  }

  return rsiData;
}

function filterDataByRange(
  data: RSIChartProps['data'],
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
  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length && payload[0].value !== null) {
    const rsi = payload[0].value;
    const zone = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
    const zoneColor = rsi > 70 ? '#ffb3ad' : rsi < 30 ? '#4ae176' : '#c7c4d7';
    
    return (
      <div className="rounded-lg border border-surface bg-surface-container p-3 shadow-lg">
        <p className="font-mono text-xs text-on_surface_variant">{label}</p>
        <p className="font-mono text-sm font-semibold text-primary">
          RSI: {rsi.toFixed(1)}
        </p>
        <p className="font-mono text-xs" style={{ color: zoneColor }}>
          {zone}
        </p>
      </div>
    );
  }
  return null;
}

export function RSIChart({ data, timeRange }: RSIChartProps) {
  const filteredData = filterDataByRange(data, timeRange);
  const rsiData = calculateRSI(filteredData);
  
  const chartData = filteredData.map((item, index) => ({
    date: item.date,
    rsi: rsiData[index]?.rsi,
  }));
  
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <h3 className="mb-4 text-sm font-medium text-on_surface">RSI (14)</h3>
      
      <div className="h-32 min-h-[128px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              tick={{ fill: '#c7c4d7', fontSize: 9 }}
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
              tick={{ fill: '#c7c4d7', fontSize: 9 }}
              domain={[0, 100]}
              ticks={[30, 50, 70]}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#ffb3ad" strokeDasharray="4 4" />
            <ReferenceLine y={30} stroke="#4ae176" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex gap-3 text-[10px] text-on_surface_variant">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#ffb3ad]"></span>
          Overbought (70+)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#a78bfa]"></span>
          RSI
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#4ae176]"></span>
          Oversold (30-)
        </span>
      </div>
    </div>
  );
}