import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Brush,
} from "recharts";
import { ComputedRow } from "@/lib/quant";
import { useMemo } from "react";

interface ChartSectionProps {
  data: ComputedRow[];
}

const GRID_COLOR = "hsl(220, 14%, 18%)";
const PRIMARY_COLOR = "hsl(175, 70%, 45%)";
const ACCENT_COLOR = "hsl(35, 90%, 55%)";
const DOWN_COLOR = "hsl(0, 72%, 55%)";
const UP_COLOR = "hsl(160, 70%, 45%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";

const tooltipStyle = {
  contentStyle: {
    background: "hsl(220, 18%, 10%)",
    border: "1px solid hsl(220, 14%, 18%)",
    borderRadius: "8px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "hsl(210, 20%, 92%)",
  },
};

const xAxisProps = {
  dataKey: "dateStr",
  tick: { fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" },
  tickLine: false,
  axisLine: { stroke: GRID_COLOR },
  interval: "preserveStartEnd" as const,
};

const yAxisProps = {
  tick: { fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" },
  tickLine: false,
  axisLine: false,
};

const ChartSection = ({ data }: ChartSectionProps) => {
  const chartData = useMemo(() => {
    // Downsample if >1000 points for performance
    if (data.length <= 1000) return data;
    const step = Math.ceil(data.length / 1000);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1);
  }, [data]);

  const volMedian = useMemo(() => {
    const vols = chartData.filter(d => d.rollingVol !== null).map(d => d.rollingVol!);
    vols.sort((a, b) => a - b);
    return vols[Math.floor(vols.length / 2)] || 0;
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* 1. Closing Price */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Closing Price</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="closeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} domain={["auto", "auto"]} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="close" stroke={PRIMARY_COLOR} fill="url(#closeFill)" strokeWidth={1.5} dot={false} />
            <Brush dataKey="dateStr" height={25} stroke={PRIMARY_COLOR} fill="hsl(220, 18%, 10%)" tickFormatter={() => ""} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Daily Log Returns */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Daily Log Returns</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => (v * 100).toFixed(1) + "%"} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [(v * 100).toFixed(3) + "%", "Log Return"]} />
            <ReferenceLine y={0} stroke={MUTED_COLOR} />
            <Bar dataKey="logReturn" fill={PRIMARY_COLOR} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Rolling Volatility */}
      <div className="chart-container">
        <h3 className="section-title mb-4">30-Day Rolling Volatility (Annualized)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.4} />
                <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => (v * 100).toFixed(0) + "%"} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [(v * 100).toFixed(2) + "%", "Volatility"]} />
            <ReferenceLine y={volMedian} stroke={MUTED_COLOR} strokeDasharray="5 5" label={{ value: "Median", fill: MUTED_COLOR, fontSize: 10 }} />
            <Area type="monotone" dataKey="rollingVol" stroke={ACCENT_COLOR} fill="url(#volFill)" strokeWidth={1.5} dot={false} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Equity Curve */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Equity Curve (Cumulative Returns)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={UP_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={UP_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} domain={["auto", "auto"]} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toFixed(4), "Cumulative Return"]} />
            <ReferenceLine y={1} stroke={MUTED_COLOR} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="cumulativeReturn" stroke={UP_COLOR} fill="url(#eqFill)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Drawdown */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Drawdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={DOWN_COLOR} stopOpacity={0.5} />
                <stop offset="95%" stopColor={DOWN_COLOR} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => (v * 100).toFixed(0) + "%"} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [(v * 100).toFixed(2) + "%", "Drawdown"]} />
            <ReferenceLine y={0} stroke={MUTED_COLOR} />
            <Area type="monotone" dataKey="drawdown" stroke={DOWN_COLOR} fill="url(#ddFill)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
