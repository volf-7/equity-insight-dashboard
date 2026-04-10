import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Cell, ComposedChart, Line,
} from "recharts";
import { ComputedRow } from "@/lib/quant";

interface Props {
  data: ComputedRow[];
}

const GRID_COLOR = "hsl(220, 14%, 18%)";
const UP_COLOR = "hsl(160, 70%, 45%)";
const DOWN_COLOR = "hsl(0, 72%, 55%)";
const ACCENT_COLOR = "hsl(35, 90%, 55%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";

const ReturnHistogram = ({ data }: Props) => {
  const chartData = useMemo(() => {
    const returns = data.slice(1).map(d => d.logReturn!).filter(v => !isNaN(v));
    const bins = 30;
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const binWidth = (max - min) / bins;
    const mean = returns.reduce((s, v) => s + v, 0) / returns.length;
    const std = Math.sqrt(returns.reduce((s, v) => s + (v - mean) ** 2, 0) / (returns.length - 1));

    const histogram = Array.from({ length: bins }, (_, i) => {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const mid = (lo + hi) / 2;
      const count = returns.filter(r => r >= lo && (i === bins - 1 ? r <= hi : r < hi)).length;

      // Normal distribution overlay
      const normalY = (returns.length * binWidth) / (std * Math.sqrt(2 * Math.PI)) *
        Math.exp(-0.5 * ((mid - mean) / std) ** 2);

      return {
        bin: (mid * 100).toFixed(2) + "%",
        binLo: (lo * 100).toFixed(3),
        binHi: (hi * 100).toFixed(3),
        count,
        normal: Math.round(normalY * 100) / 100,
        mid,
        isNegative: mid < 0,
      };
    });

    return { histogram, mean, std };
  }, [data]);

  const { histogram, mean, std } = chartData;

  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Return Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="bin"
            tick={{ fill: MUTED_COLOR, fontSize: 9, fontFamily: "'JetBrains Mono'" }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            interval={Math.floor(histogram.length / 6)}
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
            formatter={(v: number, name: string) => [
              name === "count" ? `${v} days` : v.toFixed(2),
              name === "count" ? "Frequency" : "Normal Fit"
            ]}
            labelFormatter={(label) => `Return: ${label}`}
          />
          {/* ±1σ and ±2σ lines */}
          <ReferenceLine x={((-1 * std) * 100).toFixed(2) + "%"} stroke={MUTED_COLOR} strokeDasharray="5 5" />
          <ReferenceLine x={((1 * std) * 100).toFixed(2) + "%"} stroke={MUTED_COLOR} strokeDasharray="5 5" />
          <ReferenceLine x={((-2 * std) * 100).toFixed(2) + "%"} stroke={ACCENT_COLOR} strokeDasharray="3 3" />
          <ReferenceLine x={((2 * std) * 100).toFixed(2) + "%"} stroke={ACCENT_COLOR} strokeDasharray="3 3" />
          <Bar dataKey="count" opacity={0.8}>
            {histogram.map((entry, index) => (
              <Cell key={index} fill={entry.isNegative ? DOWN_COLOR : UP_COLOR} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="normal" stroke={ACCENT_COLOR} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReturnHistogram;
