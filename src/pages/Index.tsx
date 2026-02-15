import { useState, useCallback } from "react";
import { Activity, BarChart3, TrendingUp, Shield, LineChart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import ChartSection from "@/components/ChartSection";
import DataTable from "@/components/DataTable";
import ResearchConclusion from "@/components/ResearchConclusion";
import { parseCSV, computeAll, ComputedRow, RiskMetrics } from "@/lib/quant";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: LineChart, title: "Log Returns", desc: "Daily logarithmic return computation with visual time-series" },
  { icon: Activity, title: "Rolling Volatility", desc: "30-day annualized rolling standard deviation" },
  { icon: Shield, title: "Risk Metrics", desc: "Sharpe ratio, max drawdown, annualized risk/return" },
  { icon: BarChart3, title: "Interactive Charts", desc: "5 zoomable, brushable financial visualizations" },
  { icon: TrendingUp, title: "Equity Curve", desc: "Cumulative return tracking with drawdown overlay" },
  { icon: Zap, title: "Client-Side", desc: "All computation runs locally — zero data leaves your browser" },
];

const Index = () => {
  const [data, setData] = useState<ComputedRow[] | null>(null);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const { toast } = useToast();

  const handleFileLoad = useCallback(
    (content: string) => {
      try {
        const rows = parseCSV(content);
        if (rows.length < 31) {
          toast({ title: "Insufficient data", description: "Need at least 31 rows for rolling volatility.", variant: "destructive" });
          return;
        }
        const result = computeAll(rows);
        setData(result.data);
        setMetrics(result.metrics);
        toast({ title: "Data loaded", description: `${rows.length} trading days parsed successfully.` });
      } catch (err: any) {
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      }
    },
    [toast]
  );

  const handleReset = useCallback(() => {
    setData(null);
    setMetrics(null);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/60 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground font-bold text-base leading-tight tracking-tight">
                Volatility Modeling & Risk Analysis
              </h1>
              <p className="text-muted-foreground text-[11px] font-mono tracking-wider">
                INDIAN EQUITY INDICES — QUANTITATIVE COMPUTING
              </p>
            </div>
          </div>
          {data && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-all border border-border hover:border-destructive"
            >
              ✕ Reset
            </motion.button>
          )}
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {!data ? (
          <div className="max-w-3xl mx-auto pt-8 space-y-12">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                QUANTITATIVE ANALYSIS ENGINE
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Volatility Modeling &<br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Risk-Adjusted Performance
                </span>
              </h2>
              <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                Upload historical OHLC data to compute log returns, rolling volatility,
                Sharpe ratios, drawdowns, and generate publication-ready analytics.
              </p>
            </motion.div>

            {/* Upload */}
            <FileUpload onFileLoad={handleFileLoad} />

            {/* Feature grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="group p-4 rounded-xl bg-card/40 border border-border/60 hover:border-primary/30 hover:bg-card transition-all"
                >
                  <f.icon className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-foreground text-sm font-semibold mb-1">{f.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {metrics && <MetricCards metrics={metrics} />}
            <ChartSection data={data} />
            <DataTable data={data} />
            {metrics && <ResearchConclusion metrics={metrics} />}
          </motion.div>
        )}
      </main>

      <footer className="relative border-t border-border/60 px-6 py-5 mt-8">
        <p className="text-center text-[11px] font-mono text-muted-foreground tracking-wider">
          QUANTITATIVE COMPUTING DASHBOARD — CLIENT-SIDE COMPUTATION — ZERO DATA EGRESS
        </p>
      </footer>
    </div>
  );
};

export default Index;
