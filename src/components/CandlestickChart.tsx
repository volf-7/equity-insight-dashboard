import { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { ComputedRow } from "@/lib/quant";

interface Props {
  data: ComputedRow[];
  syncId?: string;
}

const GRID_COLOR = "hsl(220, 14%, 18%)";
const UP_COLOR = "hsl(160, 70%, 45%)";
const DOWN_COLOR = "hsl(0, 72%, 55%)";
const MUTED_COLOR = "hsl(215, 15%, 50%)";

interface CandleData {
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  bodyBottom: number;
  bodyHeight: number;
  wickBottom: number;
  wickHeight: number;
  bullish: boolean;
}

const CandlestickChart = ({ data, syncId }: Props) => {
  const chartData = useMemo(() => {
    const sampled = data.length > 500
      ? data.filter((_, i) => i % Math.ceil(data.length / 500) === 0 || i === data.length - 1)
      : data;

    return sampled.map((row): CandleData => {
      const bullish = row.close >= row.open;
      return {
        dateStr: row.dateStr,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        bodyBottom: Math.min(row.open, row.close),
        bodyHeight: Math.abs(row.close - row.open) || 0.5,
        wickBottom: row.low,
        wickHeight: row.high - row.low,
        bullish,
      };
    });
  }, [data]);

  const yDomain = useMemo(() => {
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.05;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  const CandleShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const { bullish, high, low, open, close } = payload;
    const color = bullish ? UP_COLOR : DOWN_COLOR;
    const [yMin, yMax] = yDomain;
    const chartHeight = props.background?.height || 300;
    const chartY = props.background?.y || 0;
    const priceToY = (price: number) => chartY + chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight;
    const wickX = x + width / 2;
    const bodyTop = priceToY(Math.max(open, close));
    const bodyBot = priceToY(Math.min(open, close));
    const wickTop = priceToY(high);
    const wickBot = priceToY(low);
    const bodyH = Math.max(bodyBot - bodyTop, 1);

    return (
      <g>
        <line x1={wickX} y1={wickTop} x2={wickX} y2={wickBot} stroke={color} strokeWidth={1} />
        <rect x={x + 1} y={bodyTop} width={Math.max(width - 2, 2)} height={bodyH} fill={color} fillOpacity={0.9} stroke={color} strokeWidth={0.5} />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload as CandleData;
    return (
      <div style={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "hsl(210, 20%, 92%)" }}>
        <div style={{ marginBottom: 4, color: MUTED_COLOR }}>{d.dateStr}</div>
        <div>O: <span style={{ color: d.bullish ? UP_COLOR : DOWN_COLOR }}>{d.open.toFixed(2)}</span></div>
        <div>H: <span style={{ color: UP_COLOR }}>{d.high.toFixed(2)}</span></div>
        <div>L: <span style={{ color: DOWN_COLOR }}>{d.low.toFixed(2)}</span></div>
        <div>C: <span style={{ color: d.bullish ? UP_COLOR : DOWN_COLOR }}>{d.close.toFixed(2)}</span></div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Candlestick Price Action</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} barGap={0} barCategoryGap="10%" syncId={syncId}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="dateStr" tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={{ stroke: GRID_COLOR }} interval="preserveStartEnd" />
          <YAxis domain={yDomain} tick={{ fill: MUTED_COLOR, fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="close" shape={<CandleShape />} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.bullish ? UP_COLOR : DOWN_COLOR} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
