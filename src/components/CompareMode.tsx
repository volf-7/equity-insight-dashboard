import { useState, useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { parseCSV, computeAll, ComputedRow, RiskMetrics } from "@/lib/quant";
import { useToast } from "@/hooks/use-toast";
import MetricCards from "./MetricCards";

const COLORS = [
  "hsl(175, 70%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(270, 60%, 60%)",
];
const GRID_COLOR = "hsl(220, 14%, 18%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";

interface IndexData {
  label: string;
  data: ComputedRow[];
  metrics: RiskMetrics;
}

const CompareMode = () => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 31) {
          toast({ title: "Insufficient data", description: "Need at least 31 rows.", variant: "destructive" });
          return;
        }
        const result = computeAll(rows);
        const label = file.name.replace(/\.csv$/i, "");
        setIndices(prev => [...prev.slice(0, 2), { label, data: result.data, metrics: result.metrics }]);
        toast({ title: "Index added", description: `${label}: ${rows.length} days.` });
      } catch (err: any) {
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const removeIndex = (i: number) => setIndices(prev => prev.filter((_, idx) => idx !== i));

  const updateLabel = (i: number, label: string) => {
    setIndices(prev => prev.map((d, idx) => idx === i ? { ...d, label } : d));
  };

  // Merge data for overlay charts
  const mergedData = indices.length > 0 ? (() => {
    const dateMap = new Map<string, any>();
    indices.forEach((idx, i) => {
      idx.data.forEach(row => {
        const existing = dateMap.get(row.dateStr) || { dateStr: row.dateStr };
        existing[`close_${i}`] = row.close;
        existing[`vol_${i}`] = row.rollingVol;
        existing[`cum_${i}`] = row.cumulativeReturn;
        dateMap.set(row.dateStr, existing);
      });
    });
    return Array.from(dateMap.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  })() : [];

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(220, 18%, 10%)",
      border: "1px solid hsl(220, 14%, 18%)",
      borderRadius: "8px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "12px",
      color: "hsl(210, 20%, 92%)",
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-bold text-foreground">Multi-Index Comparison</h2>
        <p className="text-muted-foreground text-sm">Upload 2–3 CSV files to compare indices side by side</p>
      </div>

      {/* Upload slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {indices.map((idx, i) => (
          <div key={i} className="chart-container flex items-center gap-2 p-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <input
              className="bg-transparent text-foreground font-mono text-sm border-b border-border focus:border-primary outline-none flex-1"
              value={idx.label}
              onChange={(e) => updateLabel(i, e.target.value)}
            />
            <button onClick={() => removeIndex(i)} className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {indices.length < 3 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="chart-container flex items-center justify-center gap-2 p-3 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span className="font-mono text-xs">Add Index CSV</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {indices.length >= 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Side-by-side metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {indices.map((idx, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="font-mono text-sm text-foreground font-semibold">{idx.label}</span>
                </div>
                <div className="chart-container text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Return</span><span className={idx.metrics.annualizedReturn >= 0 ? "text-chart-up" : "text-destructive"}>{(idx.metrics.annualizedReturn * 100).toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Volatility</span><span>{(idx.metrics.annualizedVolatility * 100).toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sharpe</span><span>{idx.metrics.sharpeRatio.toFixed(3)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Max DD</span><span className="text-destructive">{(idx.metrics.maxDrawdown * 100).toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">VaR 95%</span><span className="text-destructive">{(idx.metrics.var95 * 100).toFixed(3)}%</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Overlaid Price */}
          <div className="chart-container">
            <h3 className="section-title mb-4">Price Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="dateStr" tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {indices.map((idx, i) => (
                  <Line key={i} type="monotone" dataKey={`close_${i}`} name={idx.label} stroke={COLORS[i]} dot={false} strokeWidth={1.5} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Overlaid Volatility */}
          <div className="chart-container">
            <h3 className="section-title mb-4">Rolling Volatility Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="dateStr" tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v * 100).toFixed(0) + "%"} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {indices.map((idx, i) => (
                  <Line key={i} type="monotone" dataKey={`vol_${i}`} name={idx.label} stroke={COLORS[i]} dot={false} strokeWidth={1.5} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Overlaid Equity Curve */}
          <div className="chart-container">
            <h3 className="section-title mb-4">Equity Curve Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="dateStr" tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {indices.map((idx, i) => (
                  <Line key={i} type="monotone" dataKey={`cum_${i}`} name={idx.label} stroke={COLORS[i]} dot={false} strokeWidth={1.5} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CompareMode;
