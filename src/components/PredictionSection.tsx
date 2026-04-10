import { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { PredictionResult } from "@/lib/prediction";
import { TrendingUp, TrendingDown, Minus, Target, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  prediction: PredictionResult;
}

const GRID_COLOR = "hsl(220, 14%, 18%)";
const PRIMARY_COLOR = "hsl(175, 70%, 45%)";
const ACCENT_COLOR = "hsl(35, 90%, 55%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";

const PredictionSection = ({ prediction }: Props) => {
  const chartData = useMemo(() => {
    const historical = prediction.historicalTail.map(d => ({
      dateStr: d.dateStr,
      actual: d.close,
      predicted: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));

    const forecast = prediction.forecastDays.map(d => ({
      dateStr: d.dateStr,
      actual: null as number | null,
      predicted: d.predicted,
      upper: d.upper,
      lower: d.lower,
    }));

    // Bridge: last historical point connects to first forecast
    const lastHist = historical[historical.length - 1];
    if (lastHist) {
      lastHist.predicted = lastHist.actual;
      lastHist.upper = lastHist.actual;
      lastHist.lower = lastHist.actual;
    }

    return [...historical, ...forecast];
  }, [prediction]);

  const todayDate = prediction.historicalTail[prediction.historicalTail.length - 1]?.dateStr;

  const directionConfig = {
    BULLISH: { color: "text-chart-up", bg: "bg-chart-up/10 border-chart-up/30", icon: TrendingUp, label: "BULLISH" },
    BEARISH: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: TrendingDown, label: "BEARISH" },
    NEUTRAL: { color: "text-muted-foreground", bg: "bg-muted border-border", icon: Minus, label: "NEUTRAL" },
  };

  const dir = directionConfig[prediction.forecastDirection];

  const metricCards = [
    { label: "Predicted Price (Day 30)", value: prediction.predictedDay30.toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: Target, positive: prediction.forecastDirection === "BULLISH" },
    { label: "Forecast Direction", value: dir.label, icon: dir.icon, custom: true },
    { label: "Confidence Range", value: `${prediction.confidenceLow.toLocaleString(undefined, { maximumFractionDigits: 0 })} – ${prediction.confidenceHigh.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Activity, positive: null },
    { label: "EMA-20 Current", value: prediction.ema20.toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: BarChart3, positive: null },
    { label: "Trend Slope", value: `${prediction.slope > 0 ? "+" : ""}${prediction.slope} pts/day`, icon: TrendingUp, positive: prediction.slope > 0 },
    { label: "R² Score", value: prediction.rSquared.toFixed(4), icon: Target, positive: prediction.rSquared > 0.7 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="chart-container">
        <h3 className="section-title mb-4">30-Day Price Forecast — NIFTY 50</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
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
              domain={["auto", "auto"]}
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
            />
            {todayDate && (
              <ReferenceLine
                x={todayDate}
                stroke="hsl(0, 0%, 70%)"
                strokeDasharray="5 5"
                label={{ value: "TODAY", fill: "hsl(0, 0%, 70%)", fontSize: 10, fontFamily: "'JetBrains Mono'" }}
              />
            )}
            <Area
              dataKey="upper"
              stroke="none"
              fill={ACCENT_COLOR}
              fillOpacity={0.1}
              connectNulls={false}
            />
            <Area
              dataKey="lower"
              stroke="none"
              fill="hsl(220, 18%, 10%)"
              fillOpacity={1}
              connectNulls={false}
            />
            <Line type="monotone" dataKey="actual" stroke={PRIMARY_COLOR} strokeWidth={2} dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke={ACCENT_COLOR} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`group relative rounded-xl bg-card border p-5 transition-all overflow-hidden ${
              card.custom ? dir.bg : "border-border/60 hover:border-primary/30"
            }`}
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  card.custom ? dir.bg :
                  card.positive === true ? "bg-chart-up/10" :
                  card.positive === false ? "bg-destructive/10" :
                  "bg-primary/10"
                }`}>
                  <card.icon className={`w-3.5 h-3.5 ${
                    card.custom ? dir.color :
                    card.positive === true ? "text-chart-up" :
                    card.positive === false ? "text-destructive" :
                    "text-primary"
                  }`} />
                </div>
              </div>
              <p className="data-label mb-1.5">{card.label}</p>
              <p className={`data-value text-lg ${
                card.custom ? dir.color :
                card.positive === true ? "text-chart-up" :
                card.positive === false ? "text-destructive" :
                "text-foreground"
              }`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-muted-foreground text-[11px] font-mono text-center tracking-wider">
        FORECAST IS BASED ON STATISTICAL TREND EXTRAPOLATION ONLY — NOT FINANCIAL ADVICE
      </p>
    </motion.div>
  );
};

export default PredictionSection;
