import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { ComputedRow } from "@/lib/quant";
import { useMemo } from "react";
import CandlestickChart from "./CandlestickChart";
import VolatilityRegime from "./VolatilityRegime";
import ReturnHistogram from "./ReturnHistogram";
import RollingSharpeChart from "./RollingSharpeChart";
import PatternDetection from "./PatternDetection";
import ChartDescription from "./ChartDescription";

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

const SYNC_ID = "main-chart";

const descriptions = {
  candlestick: "Candlestick charts display the Open, High, Low, and Close price for each trading day. Green candles indicate bullish days (Close > Open); red candles indicate bearish days. The wicks show the intraday high and low range. Candlestick patterns — formed by one or more candles — are used by traders to anticipate short-term price movements and potential reversals.",
  logReturns: "Log returns (ln(Pₜ/Pₜ₋₁)) are preferred over simple returns in quantitative finance because they are time-additive and approximately normally distributed. Each bar represents one trading day's return. Tall positive bars indicate strong rally days; tall negative bars indicate sharp sell-offs. Clustering of large bars (high volatility regimes) is visible as dense regions in the chart.",
  rollingVol: "Rolling volatility measures the annualized standard deviation of log returns over a 30-day trailing window, scaled by √252 (trading days per year). It captures how 'risky' or 'unstable' the index has been over time. High peaks correspond to market stress events (crashes, geopolitical shocks). The dashed median line helps contextualize whether current volatility is historically elevated or subdued.",
  equityCurve: "The equity curve shows how ₹1 invested at the start of the period would have grown over time, calculated as exp(Σ log returns). It is the definitive visual for evaluating long-term performance. A steadily rising equity curve with shallow drawdowns indicates a strong risk-adjusted return profile. Flat or declining periods correspond to market consolidation or downtrends.",
  drawdown: "Drawdown measures the percentage decline from a portfolio's rolling all-time peak. It is calculated as (current value / rolling maximum) − 1. The Maximum Drawdown (worst point on this chart) is one of the most important risk metrics — it represents the worst loss an investor would have experienced if they bought at the peak and held through the trough. Recovery from deep drawdowns requires disproportionately large gains.",
  returnDist: "This histogram shows the frequency distribution of daily log returns. In an efficient market, returns are expected to approximate a normal distribution (bell curve, shown in amber). Deviations from normality — such as fat tails (leptokurtosis) or skewness — indicate higher real-world risk than standard models assume. The ±1σ and ±2σ lines mark where 68% and 95% of returns fall under a normal distribution.",
  rollingSharpe: "The Sharpe Ratio measures risk-adjusted return: Sharpe = Annualized Return / Annualized Volatility (assuming risk-free rate = 0). A rolling 90-day Sharpe shows how the risk-return profile has evolved over time. Values above 1.0 (reference line) are generally considered good. Periods below 0 indicate the index was generating negative returns. Sustained positive Sharpe periods reflect favorable market conditions.",
};

const ChartSection = ({ data }: ChartSectionProps) => {
  const chartData = useMemo(() => {
    if (data.length <= 1000) return data;
    const step = Math.ceil(data.length / 1000);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1);
  }, [data]);

  const volMedian = useMemo(() => {
    const vols = chartData.filter(d => d.rollingVol !== null).map(d => d.rollingVol!);
    vols.sort((a, b) => a - b);
    return vols[Math.floor(vols.length / 2)] || 0;
  }, [chartData]);

  // Current volatility regime for badge
  const currentVolRegime = useMemo(() => {
    const vols = data.filter(d => d.rollingVol !== null).map(d => d.rollingVol!);
    if (vols.length === 0) return null;
    const sorted = [...vols].sort((a, b) => a - b);
    const p33 = sorted[Math.floor(sorted.length * 0.33)] || 0;
    const p66 = sorted[Math.floor(sorted.length * 0.66)] || 0;
    const last = vols[vols.length - 1];
    if (last <= p33) return { label: "LOW VOL", cls: "bg-chart-up/10 text-chart-up border-chart-up/30" };
    if (last <= p66) return { label: "MEDIUM VOL", cls: "bg-accent/10 text-accent border-accent/30" };
    return { label: "HIGH VOL", cls: "bg-destructive/10 text-destructive border-destructive/30" };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 1. Candlestick */}
      <CandlestickChart data={data} syncId={SYNC_ID} />
      <ChartDescription text={descriptions.candlestick} />

      {/* Pattern Detection */}
      <PatternDetection data={data} />

      {/* 2. Daily Log Returns */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Daily Log Returns</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} syncId={SYNC_ID}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => (v * 100).toFixed(1) + "%"} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [(v * 100).toFixed(3) + "%", "Log Return"]} />
            <ReferenceLine y={0} stroke={MUTED_COLOR} />
            <Bar dataKey="logReturn" fill={PRIMARY_COLOR} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
        <ChartDescription text={descriptions.logReturns} />
      </div>

      {/* 3. Rolling Volatility */}
      <div className="chart-container">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="section-title">30-Day Rolling Volatility (Annualized)</h3>
          {currentVolRegime && (
            <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${currentVolRegime.cls}`}>
              {currentVolRegime.label}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} syncId={SYNC_ID}>
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
        <ChartDescription text={descriptions.rollingVol} />
      </div>

      {/* Volatility Regime Bar */}
      <VolatilityRegime data={data} />

      {/* 4. Equity Curve */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Equity Curve (Cumulative Returns)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} syncId={SYNC_ID}>
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
        <ChartDescription text={descriptions.equityCurve} />
      </div>

      {/* 5. Drawdown */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Drawdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} syncId={SYNC_ID}>
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
        <ChartDescription text={descriptions.drawdown} />
      </div>

      {/* 6. Return Distribution */}
      <ReturnHistogram data={data} syncId={SYNC_ID} />
      <ChartDescription text={descriptions.returnDist} />

      {/* 7. Rolling Sharpe */}
      <RollingSharpeChart data={data} syncId={SYNC_ID} />
      <ChartDescription text={descriptions.rollingSharpe} />
    </div>
  );
};

export default ChartSection;
