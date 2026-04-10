import { ComputedRow } from "./quant";

export interface PredictionResult {
  forecastDays: { dateStr: string; predicted: number; upper: number; lower: number }[];
  historicalTail: { dateStr: string; close: number }[];
  forecastDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  predictedDay30: number;
  ema20: number;
  slope: number;
  rSquared: number;
  confidenceLow: number;
  confidenceHigh: number;
}

function linearRegression(y: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = y.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += y[i];
    sumXY += i * y[i];
    sumX2 += i * i;
    sumY2 += y[i] * y[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (y[i] - yMean) ** 2;
    ssRes += (y[i] - (intercept + slope * i)) ** 2;
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, rSquared };
}

function computeEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export function generatePrediction(data: ComputedRow[]): PredictionResult {
  const last90 = data.slice(-90);
  const last60 = data.slice(-60);
  const last30 = data.slice(-30);

  const closes60 = last60.map(d => d.close);
  const { slope, intercept, rSquared } = linearRegression(closes60);

  // EMA-20
  const allCloses = data.map(d => d.close);
  const ema20 = computeEMA(allCloses.slice(-40), 20);

  // Residual std from last 30 days for confidence band
  const residuals = last30.map((d, i) => {
    const idx = closes60.length - 30 + i;
    const predicted = intercept + slope * idx;
    return d.close - predicted;
  });
  const residMean = residuals.reduce((s, v) => s + v, 0) / residuals.length;
  const residStd = Math.sqrt(
    residuals.reduce((s, v) => s + (v - residMean) ** 2, 0) / (residuals.length - 1)
  );

  // Generate 30-day forecast
  const lastClose = data[data.length - 1].close;
  const lastDate = new Date(data[data.length - 1].date);
  const baseIdx = closes60.length - 1;

  // EMA projection: continue from last EMA value with recent momentum
  const emaProjectionSlope = (ema20 - computeEMA(allCloses.slice(-41, -1), 20)) || 0;

  const forecastDays: PredictionResult["forecastDays"] = [];
  for (let i = 1; i <= 30; i++) {
    const lrPredicted = intercept + slope * (baseIdx + i);
    const emaPredicted = ema20 + emaProjectionSlope * i;
    const predicted = 0.6 * lrPredicted + 0.4 * emaPredicted;
    const upper = predicted + 1.5 * residStd;
    const lower = predicted - 1.5 * residStd;

    // Next business day
    const d = new Date(lastDate);
    let addedDays = 0;
    let offset = 0;
    while (addedDays < i) {
      offset++;
      const nd = new Date(lastDate.getTime() + offset * 86400000);
      if (nd.getDay() !== 0 && nd.getDay() !== 6) addedDays++;
    }
    const forecastDate = new Date(lastDate.getTime() + offset * 86400000);

    forecastDays.push({
      dateStr: forecastDate.toISOString().split("T")[0],
      predicted: Math.round(predicted * 100) / 100,
      upper: Math.round(upper * 100) / 100,
      lower: Math.round(lower * 100) / 100,
    });
  }

  // Direction
  let direction: PredictionResult["forecastDirection"] = "NEUTRAL";
  if (slope > 0 && lastClose > ema20) direction = "BULLISH";
  else if (slope < 0 && lastClose < ema20) direction = "BEARISH";

  const day30 = forecastDays[forecastDays.length - 1];

  return {
    forecastDays,
    historicalTail: last90.map(d => ({ dateStr: d.dateStr, close: d.close })),
    forecastDirection: direction,
    predictedDay30: day30.predicted,
    ema20: Math.round(ema20 * 100) / 100,
    slope: Math.round(slope * 100) / 100,
    rSquared: Math.round(rSquared * 10000) / 10000,
    confidenceLow: day30.lower,
    confidenceHigh: day30.upper,
  };
}
