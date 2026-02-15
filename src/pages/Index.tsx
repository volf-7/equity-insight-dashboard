import { useState, useCallback } from "react";
import { Activity } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import ChartSection from "@/components/ChartSection";
import DataTable from "@/components/DataTable";
import ResearchConclusion from "@/components/ResearchConclusion";
import { parseCSV, computeAll, ComputedRow, RiskMetrics } from "@/lib/quant";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [data, setData] = useState<ComputedRow[] | null>(null);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [fileName, setFileName] = useState<string>("");
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
        setFileName("dataset loaded");
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
    setFileName("");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground font-bold text-lg leading-tight tracking-tight">
                Volatility Modeling & Risk-Adjusted Performance
              </h1>
              <p className="text-muted-foreground text-xs font-mono">
                Indian Equity Indices — Quantitative Analysis
              </p>
            </div>
          </div>
          {data && (
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {!data ? (
          <div className="max-w-2xl mx-auto pt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upload Historical Data
              </h2>
              <p className="text-muted-foreground text-sm">
                Provide a CSV with Date, Open, High, Low, Close columns to begin analysis.
              </p>
            </div>
            <FileUpload onFileLoad={handleFileLoad} />
          </div>
        ) : (
          <>
            {metrics && <MetricCards metrics={metrics} />}
            <ChartSection data={data} />
            <DataTable data={data} />
            {metrics && <ResearchConclusion metrics={metrics} />}
          </>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4 mt-8">
        <p className="text-center text-xs font-mono text-muted-foreground">
          Quantitative Computing Dashboard — Client-side computation, no data leaves your browser
        </p>
      </footer>
    </div>
  );
};

export default Index;
