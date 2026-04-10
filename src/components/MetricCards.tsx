import { RiskMetrics } from "@/lib/quant";
import { TrendingUp, TrendingDown, Activity, BarChart3, Calendar, Percent, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      tooltip: null,
    },
    {
      label: "Annualized Volatility",
      value: (metrics.annualizedVolatility * 100).toFixed(2) + "%",
      icon: Activity,
      positive: null,
      tooltip: null,
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(3),
      icon: BarChart3,
      positive: metrics.sharpeRatio > 1,
      tooltip: null,
    },
    {
      label: "Maximum Drawdown",
      value: (metrics.maxDrawdown * 100).toFixed(2) + "%",
      icon: TrendingDown,
      positive: false,
      tooltip: null,
    },
    {
      label: "Total Return",
      value: (metrics.totalReturn * 100).toFixed(2) + "%",
      icon: Percent,
      positive: metrics.totalReturn >= 0,
      tooltip: null,
    },
    {
      label: "Trading Days",
      value: metrics.tradingDays.toLocaleString(),
      icon: Calendar,
      positive: null,
      tooltip: null,
    },
    {
      label: "VaR 95% (1-Day)",
      value: (metrics.var95 * 100).toFixed(3) + "%",
      icon: ShieldAlert,
      positive: false,
      tooltip: "Value at Risk: the maximum expected single-day loss at 95% confidence. There is a 5% chance of losing more than this amount in one day.",
    },
    {
      label: "VaR 99% (1-Day)",
      value: (metrics.var99 * 100).toFixed(3) + "%",
      icon: ShieldAlert,
      positive: false,
      tooltip: "Value at Risk: the maximum expected single-day loss at 99% confidence. There is a 1% chance of losing more than this amount in one day.",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card, i) => {
        const content = (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative rounded-xl bg-card border border-border/60 p-4 hover:border-primary/30 transition-all overflow-hidden"
          >
            {card.positive === true && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-chart-up/5 rounded-full blur-2xl" />
            )}
            {card.positive === false && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/5 rounded-full blur-2xl" />
            )}

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  card.positive === true ? "bg-chart-up/10" :
                  card.positive === false ? "bg-destructive/10" :
                  "bg-primary/10"
                }`}>
                  <card.icon className={`w-3 h-3 ${
                    card.positive === true ? "text-chart-up" :
                    card.positive === false ? "text-destructive" :
                    "text-primary"
                  }`} />
                </div>
              </div>
              <p className="data-label mb-1 text-[10px]">{card.label}</p>
              <p className={`font-mono font-bold text-base ${
                card.positive === true ? "text-chart-up" :
                card.positive === false ? "text-destructive" :
                "text-foreground"
              }`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        );

        if (card.tooltip) {
          return (
            <Tooltip key={card.label}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs">
                <p>{card.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return content;
      })}
    </div>
  );
};

export default MetricCards;
