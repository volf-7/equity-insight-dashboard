import { OHLCRow } from "./quant";

export interface DetectedPattern {
  name: string;
  type: "BULLISH REVERSAL" | "BEARISH REVERSAL" | "CONTINUATION" | "NEUTRAL";
  date: string;
  description: string;
}

function bodySize(r: OHLCRow) { return Math.abs(r.close - r.open); }
function range(r: OHLCRow) { return r.high - r.low; }
function upperWick(r: OHLCRow) { return r.high - Math.max(r.open, r.close); }
function lowerWick(r: OHLCRow) { return Math.min(r.open, r.close) - r.low; }
function isBullish(r: OHLCRow) { return r.close > r.open; }
function isBearish(r: OHLCRow) { return r.close < r.open; }

export function detectPatterns(data: OHLCRow[], lastN = 30): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const start = Math.max(0, data.length - lastN);
  const window = data.slice(start);

  for (let i = 0; i < window.length; i++) {
    const c = window[i];
    const r = range(c);
    if (r === 0) continue;
    const body = bodySize(c);
    const bodyRatio = body / r;
    const uw = upperWick(c);
    const lw = lowerWick(c);

    // Doji
    if (bodyRatio < 0.1) {
      patterns.push({ name: "Doji", type: "NEUTRAL", date: c.dateStr, description: "Open and close are nearly equal, signaling market indecision. Often precedes a reversal when appearing after a strong trend." });
    }

    // Hammer
    if (bodyRatio < 0.35 && lw >= 2 * body && uw < body * 0.5 && Math.max(c.open, c.close) > c.low + r * 0.6) {
      patterns.push({ name: "Hammer", type: "BULLISH REVERSAL", date: c.dateStr, description: "Small body at the top with a long lower wick. Suggests buyers stepped in after selling pressure, signaling a potential bottom reversal." });
    }

    // Inverted Hammer
    if (bodyRatio < 0.35 && uw >= 2 * body && lw < body * 0.5 && Math.min(c.open, c.close) < c.high - r * 0.6) {
      patterns.push({ name: "Inverted Hammer", type: "BULLISH REVERSAL", date: c.dateStr, description: "Small body at the bottom with a long upper wick. Indicates buying interest emerging despite initial selling." });
    }

    // Shooting Star (after uptrend)
    if (i >= 2 && bodyRatio < 0.35 && uw >= 2 * body && lw < body * 0.5) {
      const prev2Bullish = window.slice(Math.max(0, i - 2), i).every(p => isBullish(p));
      if (prev2Bullish) {
        patterns.push({ name: "Shooting Star", type: "BEARISH REVERSAL", date: c.dateStr, description: "After an uptrend, a small body with a long upper wick signals that buyers lost control. Often marks a top reversal." });
      }
    }

    // Marubozu
    if (bodyRatio > 0.9) {
      if (isBullish(c)) {
        patterns.push({ name: "Bullish Marubozu", type: "CONTINUATION", date: c.dateStr, description: "A full-body bullish candle with no wicks indicates strong buying conviction throughout the session." });
      } else {
        patterns.push({ name: "Bearish Marubozu", type: "CONTINUATION", date: c.dateStr, description: "A full-body bearish candle with no wicks signals intense selling pressure without any recovery." });
      }
    }

    // Spinning Top
    if (bodyRatio < 0.3 && bodyRatio > 0.05 && Math.abs(uw - lw) < r * 0.2) {
      patterns.push({ name: "Spinning Top", type: "NEUTRAL", date: c.dateStr, description: "Small body with roughly equal wicks on both sides. Shows tug-of-war between buyers and sellers with no clear winner." });
    }

    // Two-candle patterns
    if (i >= 1) {
      const prev = window[i - 1];

      // Bullish Engulfing
      if (isBearish(prev) && isBullish(c) && c.open <= prev.close && c.close >= prev.open) {
        patterns.push({ name: "Bullish Engulfing", type: "BULLISH REVERSAL", date: c.dateStr, description: "A bullish candle completely engulfs the prior bearish candle's body, indicating a strong shift from selling to buying pressure." });
      }

      // Bearish Engulfing
      if (isBullish(prev) && isBearish(c) && c.open >= prev.close && c.close <= prev.open) {
        patterns.push({ name: "Bearish Engulfing", type: "BEARISH REVERSAL", date: c.dateStr, description: "A bearish candle fully engulfs the prior bullish candle, signaling that sellers have overwhelmed buyers." });
      }

      // Tweezer Top
      if (Math.abs(prev.high - c.high) < r * 0.02 && isBullish(prev) && isBearish(c)) {
        patterns.push({ name: "Tweezer Top", type: "BEARISH REVERSAL", date: c.dateStr, description: "Two consecutive candles with matching highs where the second reverses direction. Indicates resistance at that price level." });
      }

      // Tweezer Bottom
      if (Math.abs(prev.low - c.low) < r * 0.02 && isBearish(prev) && isBullish(c)) {
        patterns.push({ name: "Tweezer Bottom", type: "BULLISH REVERSAL", date: c.dateStr, description: "Two candles with matching lows where the second reverses upward. Suggests strong support at that price level." });
      }
    }

    // Three-candle patterns
    if (i >= 2) {
      const p2 = window[i - 2];
      const p1 = window[i - 1];

      // Morning Star
      if (isBearish(p2) && bodySize(p1) / range(p1) < 0.3 && isBullish(c) && c.close > (p2.open + p2.close) / 2) {
        patterns.push({ name: "Morning Star", type: "BULLISH REVERSAL", date: c.dateStr, description: "A three-candle bullish reversal: bearish candle, small indecision candle, then a strong bullish candle. Classic bottom signal." });
      }

      // Evening Star
      if (isBullish(p2) && bodySize(p1) / range(p1) < 0.3 && isBearish(c) && c.close < (p2.open + p2.close) / 2) {
        patterns.push({ name: "Evening Star", type: "BEARISH REVERSAL", date: c.dateStr, description: "A three-candle bearish reversal: bullish candle, small indecision candle, then a strong bearish candle. Warns of a potential top." });
      }

      // Three White Soldiers
      if (isBullish(p2) && isBullish(p1) && isBullish(c) && p1.close > p2.close && c.close > p1.close && bodySize(p2) / range(p2) > 0.5 && bodySize(p1) / range(p1) > 0.5 && bodySize(c) / range(c) > 0.5) {
        patterns.push({ name: "Three White Soldiers", type: "BULLISH REVERSAL", date: c.dateStr, description: "Three consecutive strong bullish candles with progressively higher closes. A powerful bullish continuation/reversal signal." });
      }

      // Three Black Crows
      if (isBearish(p2) && isBearish(p1) && isBearish(c) && p1.close < p2.close && c.close < p1.close && bodySize(p2) / range(p2) > 0.5 && bodySize(p1) / range(p1) > 0.5 && bodySize(c) / range(c) > 0.5) {
        patterns.push({ name: "Three Black Crows", type: "BEARISH REVERSAL", date: c.dateStr, description: "Three consecutive strong bearish candles with progressively lower closes. A bearish signal warning of sustained selling." });
      }
    }
  }

  return patterns;
}
