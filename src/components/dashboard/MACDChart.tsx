import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface MACDChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  timeRange: '1W' | '1M' | '3M' | '1Y';
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      ema.push(sum / period);
    } else {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
  }
  
  return ema;
}

function calculateMACD(
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
): Array<{ date: string; macd: number; signal: number; histogram: number }> {
  if (!data || data.length < 26) {
    return data.map(item => ({ date: item.date, macd: 0, signal: 0, histogram: 0 }));
  }

  const closes = data.map(d => d.close);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  const macd: number[] = ema12.map((e12, i) => e12 - (ema26[i] || 0));
  const signal = calculateEMA(macd.filter(m => !isNaN(m)), 9);
  
  const macdFiltered = macd.map(m => isNaN(m) ? NaN : m);
  const result: Array<{ date: string; macd: number; signal: number; histogram: number }> = [];
  
  let signalIndex = 0;
  for (let i = 0; i < macdFiltered.length; i++) {
    if (isNaN(macdFiltered[i])) {
      result.push({ date: data[i].date, macd: NaN, signal: NaN, histogram: 0 });
    } else {
      const sigValue = signal[signalIndex] || 0;
      result.push({
        date: data[i].date,
        macd: macdFiltered[i],
        signal: sigValue,
        histogram: macdFiltered[i] - sigValue
      });
      if (!isNaN(macdFiltered[i]) && signal[signalIndex] !== undefined) {
        signalIndex++;
      }
    }
  }
  
  return result;
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
  if (active && payload && payload.length) {
    const m = payload.find(p => p.dataKey === 'macd')?.value;
    const s = payload.find(p => p.dataKey === 'signal')?.value;
    const h = payload.find(p => p.dataKey === 'histogram')?.value;
    
    if (m === undefined || isNaN(m)) return null;
    
    const histogramColor = h !== undefined && h >= 0 ? '#4ae176' : '#ffb3ad';
    
    return (
      <div className="rounded-lg border border-surface bg-surface-container p-3 shadow-lg">
        <p className="font-mono text-xs text-on_surface_variant">{label}</p>
        <p className="font-mono text-sm text-primary">MACD: {m?.toFixed(4)}</p>
        <p className="font-mono text-xs text-on_surface">Signal: {s?.toFixed(4)}</p>
        <p className="font-mono text-xs" style={{ color: histogramColor }}>
          Hist: {h?.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
}

export function MACDChart({ data, timeRange }: MACDChartProps) {
  const filteredData = filterDataByRange(data, timeRange);
  const macdData = calculateMACD(filteredData);
  
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <h3 className="mb-4 text-sm font-medium text-on_surface">MACD (12, 26, 9)</h3>
      
      <div className="h-40 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={macdData}>
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
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#c7c4d7" strokeDasharray="4 4" />
            <Bar
              dataKey="histogram"
              fill="#60a5fa"
              radius={[2, 2, 0, 0]}
              opacity={0.6}
            />
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              name="MACD"
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#f472b6"
              strokeWidth={2}
              dot={false}
              name="Signal"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex gap-3 text-[10px] text-on_surface_variant">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#fbbf24]"></span>
          MACD
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#f472b6]"></span>
          Signal
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 bg-[#60a5fa]"></span>
          Histogram
        </span>
      </div>
    </div>
  );
}