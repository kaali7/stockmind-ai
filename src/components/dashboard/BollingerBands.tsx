import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface BollingerBandsProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  timeRange: '1W' | '1M' | '3M' | '1Y';
}

function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

function calculateStdDev(data: number[], sma: number[], period: number): number[] {
  const stdDev: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      stdDev.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      stdDev.push(Math.sqrt(variance));
    }
  }
  return stdDev;
}

function calculateBollingerBands(
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>,
  period: number = 20,
  stdDevMult: number = 2
): Array<{ date: string; close: number; middle: number; upper: number; lower: number }> {
  if (!data || data.length < period) {
    return data.map(item => ({
      date: item.date,
      close: item.close,
      middle: item.close,
      upper: item.close,
      lower: item.close,
    }));
  }

  const closes = data.map(d => d.close);
  const middle = calculateSMA(closes, period);
  const stdDev = calculateStdDev(closes, middle, period);

  return data.map((item, i) => ({
    date: item.date,
    close: item.close,
    middle: middle[i],
    upper: middle[i] + (stdDev[i] || 0) * stdDevMult,
    lower: middle[i] - (stdDev[i] || 0) * stdDevMult,
  }));
}

function filterDataByRange(
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>,
  range: '1W' | '1M' | '3M' | '1Y'
) {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  let cutoffDays: number;
  
  switch (range) {
    case '1W': cutoffDays = 7; break;
    case '1M': cutoffDays = 30; break;
    case '3M': cutoffDays = 90; break;
    case '1Y': cutoffDays = 365; break;
    default: cutoffDays = 365;
  }
  
  const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length && payload[0]?.value !== undefined) {
    const d = payload[0]?.payload;
    if (!d || d.middle === undefined || isNaN(d.middle)) return null;
    
    return (
      <div className="rounded-lg border border-surface bg-surface-container p-3 shadow-lg">
        <p className="font-mono text-xs text-on_surface_variant">{label}</p>
        <p className="font-mono text-sm text-primary">Close: ${d.close?.toFixed(2)}</p>
        <p className="font-mono text-xs text-[#fbbf24]">Upper: ${d.upper?.toFixed(2)}</p>
        <p className="font-mono text-xs text-on_surface">Middle: ${d.middle?.toFixed(2)}</p>
        <p className="font-mono text-xs text-[#f472b6]">Lower: ${d.lower?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
}

export function BollingerBands({ data, timeRange }: BollingerBandsProps) {
  const filteredData = filterDataByRange(data, timeRange);
  const bollingerData = calculateBollingerBands(filteredData, 20, 2);
  
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <h3 className="mb-4 text-sm font-medium text-on_surface">Bollinger Bands (20, 2)</h3>
      
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bollingerData}>
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
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['auto', 'auto']}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name="Upper"
            />
            <Line
              type="monotone"
              dataKey="middle"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={false}
              name="Middle"
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#f472b6"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name="Lower"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex gap-3 text-[10px] text-on_surface_variant">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#fbbf24]"></span>
          Upper
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#60a5fa]"></span>
          Middle
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#f472b6]"></span>
          Lower
        </span>
      </div>
    </div>
  );
}