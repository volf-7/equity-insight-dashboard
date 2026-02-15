import { RiskMetrics } from "@/lib/quant";
import { TrendingUp, TrendingDown, Activity, BarChart3, Calendar, Percent } from "lucide-react";

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <card.icon className={`w-4 h-4 ${
              card.positive === true ? "text-chart-up" :
              card.positive === false ? "text-destructive" :
              "text-primary"
            }`} />
          </div>
          <p className="data-label mb-1">{card.label}</p>
          <p className={`data-value ${
            card.positive === true ? "text-chart-up" :
            card.positive === false ? "text-destructive" :
            "text-foreground"
          }`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
