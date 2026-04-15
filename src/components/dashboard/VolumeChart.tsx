import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface VolumeChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  timeRange: '1W' | '1M' | '3M' | '1Y';
}

function filterDataByRange(
  data: VolumeChartProps['data'],
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

function formatVolume(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-surface bg-surface-container p-3 shadow-lg">
        <p className="font-mono text-xs text-on_surface_variant">{label}</p>
        <p className="font-mono text-sm font-semibold text-primary">
          Vol: {formatVolume(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function VolumeChart({ data, timeRange }: VolumeChartProps) {
  const chartData = filterDataByRange(data, timeRange);
  
  return (
    <div className="rounded-xl bg-surface-container p-4 shadow-sm border border-outline-variant">
      <h3 className="mb-4 text-sm font-medium text-on_surface">Volume</h3>
      
      <div className="h-32 min-h-[128px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={1}>
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
              tickFormatter={(value) => formatVolume(value)}
              domain={['auto', 'auto']}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="volume"
              fill="#60a5fa"
              radius={[2, 2, 0, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}