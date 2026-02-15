import { RiskMetrics } from "@/lib/quant";
import { TrendingUp, TrendingDown, Activity, BarChart3, Calendar, Percent } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardsProps {
  metrics: RiskMetrics;
}

const MetricCards = ({ metrics }: MetricCardsProps) => {
  const cards = [
    {
      label: "Annualized Return",
      value: (metrics.annualizedReturn * 100).toFixed(2) + "%",
      icon: metrics.annualizedReturn >= 0 ? TrendingUp : TrendingDown,
      positive: metrics.annualizedReturn >= 0,
    },
    {
      label: "Annualized Volatility",
      value: (metrics.annualizedVolatility * 100).toFixed(2) + "%",
      icon: Activity,
      positive: null,
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(3),
      icon: BarChart3,
      positive: metrics.sharpeRatio > 1,
    },
    {
      label: "Maximum Drawdown",
      value: (metrics.maxDrawdown * 100).toFixed(2) + "%",
      icon: TrendingDown,
      positive: false,
    },
    {
      label: "Total Return",
      value: (metrics.totalReturn * 100).toFixed(2) + "%",
      icon: Percent,
      positive: metrics.totalReturn >= 0,
    },
    {
      label: "Trading Days",
      value: metrics.tradingDays.toLocaleString(),
      icon: Calendar,
      positive: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="group relative rounded-xl bg-card border border-border/60 p-5 hover:border-primary/30 transition-all overflow-hidden"
        >
          {/* Subtle glow on positive/negative */}
          {card.positive === true && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-chart-up/5 rounded-full blur-2xl" />
          )}
          {card.positive === false && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/5 rounded-full blur-2xl" />
          )}

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                card.positive === true ? "bg-chart-up/10" :
                card.positive === false ? "bg-destructive/10" :
                "bg-primary/10"
              }`}>
                <card.icon className={`w-3.5 h-3.5 ${
                  card.positive === true ? "text-chart-up" :
                  card.positive === false ? "text-destructive" :
                  "text-primary"
                }`} />
              </div>
            </div>
            <p className="data-label mb-1.5">{card.label}</p>
            <p className={`data-value text-xl ${
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
  );
};

export default MetricCards;
