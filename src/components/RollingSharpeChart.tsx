import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { ComputedRow } from "@/lib/quant";

interface Props {
  data: ComputedRow[];
}

const GRID_COLOR = "hsl(220, 14%, 18%)";
const UP_COLOR = "hsl(160, 70%, 45%)";
const DOWN_COLOR = "hsl(0, 72%, 55%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";
const TRADING_DAYS = 252;

const RollingSharpeChart = ({ data }: Props) => {
  const chartData = useMemo(() => {
    const WINDOW = 90;
    const result: { dateStr: string; sharpe: number | null }[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < WINDOW) {
        result.push({ dateStr: data[i].dateStr, sharpe: null });
        continue;
      }

      const window = data.slice(i - WINDOW + 1, i + 1)
        .map(d => d.logReturn)
        .filter((v): v is number => v !== null);

      if (window.length < WINDOW - 1) {
        result.push({ dateStr: data[i].dateStr, sharpe: null });
        continue;
      }

      const mean = window.reduce((s, v) => s + v, 0) / window.length;
      const std = Math.sqrt(window.reduce((s, v) => s + (v - mean) ** 2, 0) / (window.length - 1));
      const sharpe = std !== 0 ? (mean * TRADING_DAYS) / (std * Math.sqrt(TRADING_DAYS)) : 0;

      result.push({ dateStr: data[i].dateStr, sharpe: Math.round(sharpe * 1000) / 1000 });
    }

    // Downsample
    if (result.length > 1000) {
      const step = Math.ceil(result.length / 1000);
      return result.filter((_, i) => i % step === 0 || i === result.length - 1);
    }
    return result;
  }, [data]);

  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Rolling Sharpe Ratio (90-Day)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sharpeFillPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={UP_COLOR} stopOpacity={0.3} />
              <stop offset="95%" stopColor={UP_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="dateStr"
            tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "hsl(210, 20%, 92%)",
            }}
            formatter={(v: number) => [v?.toFixed(3), "Sharpe Ratio"]}
          />
          <ReferenceLine y={1} stroke={MUTED_COLOR} strokeDasharray="5 5" label={{ value: "Target", fill: MUTED_COLOR, fontSize: 10 }} />
          <ReferenceLine y={0} stroke={MUTED_COLOR} />
          <Area
            type="monotone"
            dataKey="sharpe"
            stroke={UP_COLOR}
            fill="url(#sharpeFillPos)"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RollingSharpeChart;
