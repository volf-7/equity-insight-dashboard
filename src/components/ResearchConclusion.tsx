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

  return (
    <div className="chart-container space-y-6">
      <h3 className="section-title">Research Conclusion</h3>

      <div className="space-y-4 text-sm leading-relaxed text-secondary-foreground">
        <div>
          <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wider mb-2">
            ▸ Volatility Clustering
          </h4>
          <p>
            The rolling volatility chart reveals characteristic volatility clustering — periods of
            high volatility tend to be followed by continued elevated volatility, consistent with
            the ARCH/GARCH effects documented extensively in financial econometrics. This
            heteroskedastic behavior implies that simple constant-volatility models underestimate
            tail risk during turbulent periods.
          </p>
        </div>

        <div>
          <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wider mb-2">
            ▸ Sharpe Ratio Interpretation
          </h4>
          <p>
            The computed Sharpe Ratio of{" "}
            <span className="text-primary font-mono font-bold">{metrics.sharpeRatio.toFixed(3)}</span>{" "}
            {sharpeInterpretation} With an annualized return of{" "}
            <span className="text-primary font-mono">{(metrics.annualizedReturn * 100).toFixed(2)}%</span>{" "}
            against annualized volatility of{" "}
            <span className="text-accent font-mono">{(metrics.annualizedVolatility * 100).toFixed(2)}%</span>,
            the risk-return trade-off is quantified precisely.
          </p>
        </div>

        <div>
          <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wider mb-2">
            ▸ Maximum Drawdown Analysis
          </h4>
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
        </div>

        <div>
          <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wider mb-2">
            ▸ Volatility–Return Nexus
          </h4>
          <p>
            {highVolBetterReturns
              ? "The analysis suggests that elevated volatility periods, while uncomfortable, did contribute to favorable risk-adjusted returns over the full sample period. The positive Sharpe Ratio confirms that bearing volatility risk was rewarded, though the path-dependent nature of returns (as shown by the drawdown chart) means that timing and holding period significantly influence realized outcomes."
              : "The data indicates that higher volatility did not translate into proportionally better risk-adjusted returns. The sub-optimal Sharpe Ratio suggests that volatility acted primarily as a drag on performance rather than a compensated risk factor. This aligns with the low-volatility anomaly observed across emerging market indices, where less volatile assets often deliver superior risk-adjusted returns."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchConclusion;
