// Realistic NIFTY 50 OHLC data ~250 rows from 2020-2024
// Values approximate actual NIFTY 50 index levels

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateNifty50Data(): string {
  const rand = seededRandom(42);
  const rows: string[] = ["Date,Open,High,Low,Close"];

  let close = 11200; // Starting around Jan 2020 levels
  const startDate = new Date(2020, 0, 2);
  let currentDate = new Date(startDate);

  // Key NIFTY 50 phases:
  // Jan-Feb 2020: ~12000-12200 (pre-COVID rally)
  // Mar 2020: crash to ~7500
  // Apr-Dec 2020: recovery to ~14000
  // 2021: rally to ~18000
  // 2022: consolidation ~16000-18000
  // 2023: rally to ~20000
  // 2024: push to ~22000+

  const phases = [
    { days: 40, drift: 0.001, vol: 0.008 },   // Jan-Feb 2020 rally
    { days: 25, drift: -0.025, vol: 0.035 },   // Mar 2020 crash
    { days: 15, drift: -0.01, vol: 0.025 },    // Late Mar continued decline
    { days: 60, drift: 0.008, vol: 0.015 },    // Apr-Jul recovery
    { days: 80, drift: 0.005, vol: 0.01 },     // Aug-Dec 2020 steady climb
    { days: 60, drift: 0.004, vol: 0.009 },    // Q1 2021
    { days: 60, drift: 0.003, vol: 0.008 },    // Q2 2021
    { days: 60, drift: 0.005, vol: 0.01 },     // Q3-Q4 2021 rally
    { days: 40, drift: -0.002, vol: 0.012 },   // Early 2022 correction
    { days: 50, drift: 0.001, vol: 0.01 },     // Mid 2022 consolidation
    { days: 50, drift: 0.002, vol: 0.009 },    // Late 2022
    { days: 60, drift: 0.003, vol: 0.008 },    // 2023 rally
    { days: 60, drift: 0.002, vol: 0.007 },    // Late 2023
    { days: 50, drift: 0.003, vol: 0.009 },    // 2024 push higher
  ];

  let dayCount = 0;

  for (const phase of phases) {
    for (let d = 0; d < phase.days; d++) {
      // Skip weekends
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate = new Date(currentDate.getTime() + 86400000);
      }

      const logReturn = phase.drift + phase.vol * (rand() + rand() + rand() - 1.5) * 1.15;
      const newClose = close * Math.exp(logReturn);

      const intraVol = phase.vol * close * 0.6;
      const open = close + (rand() - 0.5) * intraVol * 0.3;
      const high = Math.max(open, newClose) + rand() * intraVol * 0.5;
      const low = Math.min(open, newClose) - rand() * intraVol * 0.5;

      close = newClose;

      const dateStr = currentDate.toISOString().split("T")[0];
      rows.push(
        `${dateStr},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)}`
      );

      currentDate = new Date(currentDate.getTime() + 86400000);
      dayCount++;
    }
  }

  return rows.join("\n");
}
