import { useMemo } from "react";
import { motion } from "framer-motion";

export type TimeRange = "1W" | "1M" | "3M" | "1Y" | "3Y" | "5Y" | "MAX";

interface Props {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  totalDays: number;
  availableDays: number;
}

const RANGES: { key: TimeRange; days: number | null; label: string }[] = [
  { key: "1W", days: 7, label: "1W" },
  { key: "1M", days: 30, label: "1M" },
  { key: "3M", days: 90, label: "3M" },
  { key: "1Y", days: 365, label: "1Y" },
  { key: "3Y", days: 1095, label: "3Y" },
  { key: "5Y", days: 1825, label: "5Y" },
  { key: "MAX", days: null, label: "MAX" },
];

export function getFilteredDataRange(range: TimeRange, totalDays: number): number {
  const r = RANGES.find(r => r.key === range);
  if (!r || !r.days) return totalDays;
  return Math.min(r.days, totalDays);
}

const TimeRangeFilter = ({ selected, onChange, totalDays, availableDays }: Props) => {
  const warning = useMemo(() => {
    const r = RANGES.find(r => r.key === selected);
    if (!r || !r.days) return null;
    if (r.days > totalDays) return `Only ${totalDays} days of data available`;
    return null;
  }, [selected, totalDays]);

  return (
    <div className="sticky top-[65px] z-40 backdrop-blur-sm bg-background/90 border-b border-border/60 -mx-6 px-6 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-border/60 overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => onChange(r.key)}
              className={`px-3 py-1.5 text-xs font-mono font-semibold transition-all border-r border-border/40 last:border-r-0 ${
                selected === r.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {availableDays} trading days shown
        </span>
        {warning && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono text-accent"
          >
            ⚠ {warning}
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default TimeRangeFilter;
