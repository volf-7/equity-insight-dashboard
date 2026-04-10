import { RiskMetrics } from "@/lib/quant";

interface ResearchConclusionProps {
  metrics: RiskMetrics;
}

const ResearchConclusion = ({ metrics }: ResearchConclusionProps) => {
  const sharpeInterpretation =
    metrics.sharpeRatio > 1
      ? "indicates strong risk-adjusted performance — the returns adequately compensate for the volatility endured."
      : metrics.sharpeRatio > 0.5
      ? "indicates moderate risk-adjusted returns — the strategy generates positive returns but with notable volatility drag."
      : metrics.sharpeRatio > 0
      ? "suggests weak risk-adjusted performance — the returns barely justify the risk taken."
      : "indicates negative risk-adjusted returns — the asset destroyed value on a risk-adjusted basis.";

  const drawdownSeverity =
    Math.abs(metrics.maxDrawdown) > 0.5
      ? "extremely severe"
      : Math.abs(metrics.maxDrawdown) > 0.3
      ? "significant"
      : Math.abs(metrics.maxDrawdown) > 0.15
      ? "moderate"
      : "relatively contained";

  const highVolBetterReturns = metrics.sharpeRatio > 0.5;

  const insights = [
    {
      title: "▸ Volatility Clustering",
      content: `The rolling volatility chart reveals characteristic volatility clustering — periods of high volatility tend to be followed by continued elevated volatility, consistent with the ARCH/GARCH effects documented extensively in financial econometrics. This heteroskedastic behavior implies that simple constant-volatility models underestimate tail risk during turbulent periods.`,
    },
    {
      title: "▸ Sharpe Ratio Interpretation",
      content: null,
      richContent: (
        <p>
          The computed Sharpe Ratio of{" "}
          <span className="text-primary font-mono font-bold">{metrics.sharpeRatio.toFixed(3)}</span>{" "}
          {sharpeInterpretation} With an annualized return of{" "}
          <span className="text-primary font-mono">{(metrics.annualizedReturn * 100).toFixed(2)}%</span>{" "}
          against annualized volatility of{" "}
          <span className="text-accent font-mono">{(metrics.annualizedVolatility * 100).toFixed(2)}%</span>,
          the risk-return trade-off is quantified precisely.
        </p>
      ),
    },
    {
      title: "▸ Maximum Drawdown Analysis",
      content: null,
      richContent: (
        <p>
          The maximum drawdown of{" "}
          <span className="text-destructive font-mono font-bold">
            {(metrics.maxDrawdown * 100).toFixed(2)}%
          </span>{" "}
          represents a {drawdownSeverity} peak-to-trough decline. This metric is critical for
          risk management as it captures the worst-case scenario an investor would have
          experienced. Recovery from such drawdowns requires disproportionately larger gains,
          underscoring the asymmetric nature of compound returns.
        </p>
      ),
    },
    {
      title: "▸ Value at Risk Assessment",
      content: null,
      richContent: (
        <p>
          The 1-day 95% VaR of{" "}
          <span className="text-destructive font-mono font-bold">{(metrics.var95 * 100).toFixed(3)}%</span>{" "}
          indicates that on 95% of trading days, the maximum expected loss does not exceed this threshold.
          The 99% VaR of{" "}
          <span className="text-destructive font-mono font-bold">{(metrics.var99 * 100).toFixed(3)}%</span>{" "}
          captures tail risk more conservatively. These historical VaR estimates assume returns
          follow their empirical distribution and may understate risk during regime changes.
        </p>
      ),
    },
    {
      title: "▸ Volatility–Return Nexus",
      content: highVolBetterReturns
        ? "The analysis suggests that elevated volatility periods, while uncomfortable, did contribute to favorable risk-adjusted returns over the full sample period. The positive Sharpe Ratio confirms that bearing volatility risk was rewarded, though the path-dependent nature of returns (as shown by the drawdown chart) means that timing and holding period significantly influence realized outcomes."
        : "The data indicates that higher volatility did not translate into proportionally better risk-adjusted returns. The sub-optimal Sharpe Ratio suggests that volatility acted primarily as a drag on performance rather than a compensated risk factor. This aligns with the low-volatility anomaly observed across emerging market indices, where less volatile assets often deliver superior risk-adjusted returns.",
    },
  ];

  return (
    <div className="chart-container space-y-8">
      <h3 className="section-title">Research Conclusion</h3>

      <div className="space-y-6">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="border-l-2 border-primary/40 pl-5 py-1"
          >
            <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wider mb-3">
              {insight.title}
            </h4>
            <div className="text-sm text-secondary-foreground" style={{ lineHeight: 1.8 }}>
              {insight.richContent || <p>{insight.content}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchConclusion;
