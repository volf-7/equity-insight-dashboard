import { useMemo } from "react";
import { OHLCRow } from "@/lib/quant";
import { detectPatterns, DetectedPattern } from "@/lib/patterns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  data: OHLCRow[];
}

const typeConfig: Record<string, { border: string; badge: string; icon: typeof TrendingUp }> = {
  "BULLISH REVERSAL": { border: "border-chart-up/40", badge: "bg-chart-up/10 text-chart-up border-chart-up/30", icon: TrendingUp },
  "BEARISH REVERSAL": { border: "border-destructive/40", badge: "bg-destructive/10 text-destructive border-destructive/30", icon: TrendingDown },
  "CONTINUATION": { border: "border-accent/40", badge: "bg-accent/10 text-accent border-accent/30", icon: TrendingUp },
  "NEUTRAL": { border: "border-border", badge: "bg-muted text-muted-foreground border-border", icon: Minus },
};

const PatternDetection = ({ data }: Props) => {
  const patterns = useMemo(() => detectPatterns(data, 30), [data]);

  const dominantSignal = useMemo(() => {
    if (patterns.length === 0) return "NEUTRAL";
    const bull = patterns.filter(p => p.type === "BULLISH REVERSAL").length;
    const bear = patterns.filter(p => p.type === "BEARISH REVERSAL").length;
    if (bull > bear) return "BULLISH";
    if (bear > bull) return "BEARISH";
    if (bull === bear && bull > 0) return "MIXED";
    return "NEUTRAL";
  }, [patterns]);

  const summaryBorder = dominantSignal === "BULLISH" ? "border-chart-up/40" : dominantSignal === "BEARISH" ? "border-destructive/40" : dominantSignal === "MIXED" ? "border-accent/40" : "border-border";
  const summaryText = dominantSignal === "BULLISH" ? "text-chart-up" : dominantSignal === "BEARISH" ? "text-destructive" : dominantSignal === "MIXED" ? "text-accent" : "text-muted-foreground";

  return (
    <div className="chart-container space-y-4">
      <h3 className="section-title mb-2">Detected Candlestick Patterns</h3>

      {/* Summary card */}
      <div className={`rounded-xl border ${summaryBorder} bg-card/60 p-4 flex items-center gap-3`}>
        <span className="text-sm text-secondary-foreground">
          <span className="font-mono font-bold text-foreground">{patterns.length}</span> pattern(s) detected in the last <span className="font-mono font-bold text-foreground">30</span> candles.
          Dominant signal: <span className={`font-mono font-bold ${summaryText}`}>{dominantSignal}</span>.
        </span>
      </div>

      {patterns.length === 0 ? (
        <p className="text-sm text-muted-foreground font-mono py-4">
          No significant candlestick patterns detected in the selected window. Try a shorter time range like 1M or 3M.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patterns.map((p, i) => {
            const cfg = typeConfig[p.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={`${p.name}-${p.date}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border ${cfg.border} bg-card/60 p-4 space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cfg.badge.split(" ")[1]}`} />
                    <span className="font-semibold text-sm text-foreground">{p.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    {p.type}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground">Detected at {p.date}</p>
                <p className="text-xs text-secondary-foreground leading-relaxed">{p.description}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatternDetection;
