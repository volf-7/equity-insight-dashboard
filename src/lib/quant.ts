export interface OHLCRow {
  date: Date;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ComputedRow extends OHLCRow {
  logReturn: number | null;
  rollingVol: number | null;
  cumulativeReturn: number;
  drawdown: number;
}

export interface RiskMetrics {
  annualizedReturn: number;
  annualizedVolatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  tradingDays: number;
}

export function parseCSV(text: string): OHLCRow[] {
  const lines = text.trim().split('\n');
  const header = lines[0].toLowerCase();
  const cols = header.split(',').map(c => c.trim());

  const dateIdx = cols.findIndex(c => c === 'date');
  const openIdx = cols.findIndex(c => c === 'open');
  const highIdx = cols.findIndex(c => c === 'high');
  const lowIdx = cols.findIndex(c => c === 'low');
  const closeIdx = cols.findIndex(c => c === 'close');

  if (dateIdx === -1 || closeIdx === -1) {
    throw new Error('CSV must contain at least Date and Close columns');
  }

  const rows: OHLCRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < cols.length) continue;

    const date = new Date(vals[dateIdx]);
    if (isNaN(date.getTime())) continue;

    rows.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      open: openIdx >= 0 ? parseFloat(vals[openIdx]) : 0,
      high: highIdx >= 0 ? parseFloat(vals[highIdx]) : 0,
      low: lowIdx >= 0 ? parseFloat(vals[lowIdx]) : 0,
      close: parseFloat(vals[closeIdx]),
    });
  }

  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

export function computeAll(rows: OHLCRow[]): { data: ComputedRow[]; metrics: RiskMetrics } {
  const WINDOW = 30;
  const TRADING_DAYS = 252;

  const data: ComputedRow[] = rows.map((row, i) => ({
    ...row,
    logReturn: i === 0 ? null : Math.log(row.close / rows[i - 1].close),
    rollingVol: null,
    cumulativeReturn: 1,
    drawdown: 0,
  }));

  // Rolling volatility
  for (let i = WINDOW; i < data.length; i++) {
    const window = data.slice(i - WINDOW + 1, i + 1)
      .map(d => d.logReturn)
      .filter((v): v is number => v !== null);

    if (window.length < WINDOW - 1) continue;

    const mean = window.reduce((s, v) => s + v, 0) / window.length;
    const variance = window.reduce((s, v) => s + (v - mean) ** 2, 0) / (window.length - 1);
    data[i].rollingVol = Math.sqrt(variance) * Math.sqrt(TRADING_DAYS);
  }

  // Cumulative returns
  let cumSum = 0;
  for (let i = 1; i < data.length; i++) {
    cumSum += data[i].logReturn!;
    data[i].cumulativeReturn = Math.exp(cumSum);
  }

  // Drawdown
  let peak = 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].cumulativeReturn > peak) peak = data[i].cumulativeReturn;
    data[i].drawdown = (data[i].cumulativeReturn / peak) - 1;
  }

  // Risk metrics
  const logReturns = data.slice(1).map(d => d.logReturn!);
  const meanReturn = logReturns.reduce((s, v) => s + v, 0) / logReturns.length;
  const stdReturn = Math.sqrt(
    logReturns.reduce((s, v) => s + (v - meanReturn) ** 2, 0) / (logReturns.length - 1)
  );

  const annualizedReturn = meanReturn * TRADING_DAYS;
  const annualizedVolatility = stdReturn * Math.sqrt(TRADING_DAYS);
  const sharpeRatio = annualizedVolatility !== 0 ? annualizedReturn / annualizedVolatility : 0;
  const maxDrawdown = Math.min(...data.map(d => d.drawdown));

  return {
    data,
    metrics: {
      annualizedReturn,
      annualizedVolatility,
      sharpeRatio,
      maxDrawdown,
      totalReturn: data[data.length - 1].cumulativeReturn - 1,
      tradingDays: logReturns.length,
    },
  };
}
