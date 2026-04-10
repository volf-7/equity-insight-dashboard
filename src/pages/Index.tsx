import { useState, useCallback, useRef } from "react";
import { Activity, BarChart3, TrendingUp, Shield, LineChart, Zap, FlaskConical, Download, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import ChartSection from "@/components/ChartSection";
import DataTable from "@/components/DataTable";
import ResearchConclusion from "@/components/ResearchConclusion";
import PredictionSection from "@/components/PredictionSection";
import CompareMode from "@/components/CompareMode";
import { parseCSV, computeAll, ComputedRow, RiskMetrics } from "@/lib/quant";
import { generatePrediction, PredictionResult } from "@/lib/prediction";
import { generateNifty50Data } from "@/lib/sampleData";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: LineChart, title: "Log Returns", desc: "Daily logarithmic return computation" },
  { icon: Activity, title: "Rolling Volatility", desc: "30-day annualized rolling std dev" },
  { icon: Shield, title: "Risk Metrics", desc: "Sharpe, VaR, max drawdown" },
  { icon: BarChart3, title: "Interactive Charts", desc: "7 zoomable financial visualizations" },
  { icon: TrendingUp, title: "Price Prediction", desc: "Linear regression + EMA forecast" },
  { icon: Zap, title: "Client-Side", desc: "Zero data leaves your browser" },
];

const Index = () => {
  const [data, setData] = useState<ComputedRow[] | null>(null);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const processData = useCallback(
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
        if (result.data.length >= 90) {
          setPrediction(generatePrediction(result.data));
        }
        toast({ title: "Data loaded", description: `${rows.length} trading days parsed successfully.` });
      } catch (err: any) {
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      }
    },
    [toast]
  );

  const handleLoadSample = useCallback(() => {
    const csv = generateNifty50Data();
    processData(csv);
  }, [processData]);

  const handleReset = useCallback(() => {
    setData(null);
    setMetrics(null);
    setPrediction(null);
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        backgroundColor: "#101318",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cover page
      pdf.setFillColor(16, 19, 24);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(200, 210, 220);
      pdf.setFontSize(22);
      pdf.text("Volatility Modeling &", pageWidth / 2, 80, { align: "center" });
      pdf.text("Risk Analysis", pageWidth / 2, 92, { align: "center" });
      pdf.setFontSize(10);
      pdf.setTextColor(120, 130, 140);
      pdf.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageWidth / 2, 110, { align: "center" });
      pdf.text("Client-side computation — zero data egress", pageWidth / 2, 118, { align: "center" });

      // Dashboard content pages
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
      position = -(pageHeight - 20);

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
        position -= (pageHeight - 20);
      }

      pdf.save("volatility-risk-analysis.pdf");
      toast({ title: "PDF exported", description: "Report saved successfully." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

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
          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            {!data && (
              <button
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`text-xs font-mono px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isCompareMode
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare
              </button>
            )}
            {data && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="text-xs font-mono px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? "Generating…" : "Export PDF"}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleReset}
                  className="text-xs font-mono px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-all border border-border hover:border-destructive"
                >
                  ✕ Reset
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {!data ? (
          isCompareMode ? (
            <CompareMode />
          ) : (
            <div className="max-w-3xl mx-auto pt-4 space-y-10">
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
              <FileUpload onFileLoad={processData} />

              {/* Demo button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 text-primary font-mono text-sm hover:bg-primary/10 transition-all"
                >
                  <FlaskConical className="w-4 h-4" />
                  Load Sample Data
                </button>
                <p className="text-muted-foreground text-[11px] font-mono">
                  No CSV? Try with sample NIFTY 50 data
                </p>
              </motion.div>

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
          )
        ) : (
          <motion.div
            ref={dashboardRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {metrics && <MetricCards metrics={metrics} />}
            <ChartSection data={data} />
            {prediction && <PredictionSection prediction={prediction} />}
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
