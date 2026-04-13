import { ComputedRow } from "@/lib/quant";

interface Props {
  data: ComputedRow[];
}

const DataQualityPanel = ({ data }: Props) => {
  const firstDate = data[0]?.dateStr ?? "—";
  const lastDate = data[data.length - 1]?.dateStr ?? "—";
  const nullCount = data.filter(d => d.logReturn === null && data.indexOf(d) > 0).length;

  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3 font-mono text-[11px] text-muted-foreground space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-chart-up" />
        <span>Rows parsed: <span className="text-foreground font-bold">{data.length}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span>Date range: <span className="text-foreground">{firstDate}</span> → <span className="text-foreground">{lastDate}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${nullCount > 0 ? "bg-accent" : "bg-chart-up"}`} />
        <span>Missing values: <span className="text-foreground">{nullCount}</span></span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span>Columns: Date → Date, Open → Open, High → High, Low → Low, Close → Close</span>
      </div>
    </div>
  );
};

export default DataQualityPanel;
