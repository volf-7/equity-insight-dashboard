import { ComputedRow } from "@/lib/quant";

interface Props {
  data: ComputedRow[];
}

const HeaderTicker = ({ data }: Props) => {
  const last = data[data.length - 1];
  const lastReturn = last?.logReturn ?? 0;
  const isPositive = lastReturn >= 0;
  const pct = (lastReturn * 100).toFixed(2);
  const arrow = isPositive ? "▲" : "▼";

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="text-foreground font-bold">{last.close.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      <span className={isPositive ? "text-chart-up" : "text-destructive"}>
        {arrow} {pct}%
      </span>
      <span className="text-muted-foreground text-[10px]">{last.dateStr}</span>
    </div>
  );
};

export default HeaderTicker;
