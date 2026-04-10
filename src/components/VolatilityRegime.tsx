import { useMemo } from "react";
import { ComputedRow } from "@/lib/quant";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: ComputedRow[];
}

const VolatilityRegime = ({ data }: Props) => {
  const { regimeData, currentRegime } = useMemo(() => {
    const vols = data.filter(d => d.rollingVol !== null).map(d => d.rollingVol!);
    const sorted = [...vols].sort((a, b) => a - b);
    const p33 = sorted[Math.floor(sorted.length * 0.33)] || 0;
    const p66 = sorted[Math.floor(sorted.length * 0.66)] || 0;

    const regimeData = data.filter(d => d.rollingVol !== null).map(d => {
      const vol = d.rollingVol!;
      const regime = vol <= p33 ? "LOW" : vol <= p66 ? "MEDIUM" : "HIGH";
      return { dateStr: d.dateStr, regime, vol };
    });

    const current = regimeData.length > 0 ? regimeData[regimeData.length - 1].regime : "MEDIUM";

    return { regimeData, currentRegime: current };
  }, [data]);

  const regimeColors = {
    LOW: "bg-chart-up",
    MEDIUM: "bg-accent",
    HIGH: "bg-destructive",
  };

  const badgeColors = {
    LOW: "bg-chart-up/10 text-chart-up border-chart-up/30",
    MEDIUM: "bg-accent/10 text-accent border-accent/30",
    HIGH: "bg-destructive/10 text-destructive border-destructive/30",
  };

  // Create segments for the bar
  const totalWidth = regimeData.length;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title text-sm">Volatility Regime</h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${badgeColors[currentRegime]}`}>
          <span className={`w-2 h-2 rounded-full ${regimeColors[currentRegime]}`} />
          CURRENT: {currentRegime}
        </div>
      </div>

      {/* Regime bar */}
      <div className="flex h-6 rounded overflow-hidden border border-border/60">
        {regimeData.map((d, i) => (
          <div
            key={i}
            className={`${regimeColors[d.regime]} opacity-70`}
            style={{ width: `${100 / totalWidth}%` }}
            title={`${d.dateStr}: ${d.regime} (${(d.vol * 100).toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-chart-up" /> LOW (&lt;33rd pctl)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent" /> MEDIUM (33-66th)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive" /> HIGH (&gt;66th pctl)</span>
      </div>
    </div>
  );
};

export default VolatilityRegime;
