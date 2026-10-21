// Pure helpers shared by the stats panel and the market table.

export type ApiCandle = {
  openTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  takerBuyVolume?: number;
  supertrend?: number | null;
  supertrendDir?: 1 | -1 | null;
};

export const INTERVAL_MS: Record<string, number> = {
  "5m": 5 * 60e3,
  "15m": 15 * 60e3,
  "1h": 60 * 60e3,
  "4h": 4 * 60 * 60e3,
  "1d": 24 * 60 * 60e3,
};

export function pctChange(curr: number, prev: number): number {
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

/** Only candles whose close time has passed (the backend stores closed candles; this is defensive). */
export function closedCandles<T extends { openTime: string }>(candles: T[], timeframe: string, now = Date.now()): T[] {
  const iv = INTERVAL_MS[timeframe];
  if (!iv) return candles;
  return candles.filter((c) => new Date(c.openTime).getTime() + iv <= now);
}

export type Stats = {
  asOf: string; // openTime of the candle the stats describe (last CLOSED candle)
  price: number;
  priceChangePct: number;
  totalVolume: number;
  volumeChangePct: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  deltaPct: number;
  supertrendDir: 1 | -1 | null;
};

/**
 * Stats of the last CLOSED candle compared with the closed candle before it.
 * (Comparing a still-forming candle's partial volume with a full candle always shows a big drop.)
 * Buy volume = Binance taker-buy base volume; sell volume = total − taker buy.
 */
export function computeStats(candles: ApiCandle[], timeframe: string, now = Date.now()): Stats | null {
  const closed = closedCandles(candles, timeframe, now);
  const last = closed[closed.length - 1];
  const prev = closed[closed.length - 2];
  if (!last) return null;

  const totalVolume = Number(last.volume ?? 0);
  const buyVolume = Number(last.takerBuyVolume ?? 0);
  const sellVolume = Math.max(totalVolume - buyVolume, 0);
  const delta = buyVolume - sellVolume;

  return {
    asOf: last.openTime,
    price: last.close,
    priceChangePct: prev ? pctChange(last.close, prev.close) : 0,
    totalVolume,
    volumeChangePct: prev && prev.volume ? pctChange(totalVolume, Number(prev.volume)) : 0,
    buyVolume,
    sellVolume,
    delta,
    deltaPct: totalVolume === 0 ? 0 : (delta / totalVolume) * 100,
    supertrendDir: (last.supertrendDir ?? null) as 1 | -1 | null,
  };
}

/** "YYYY-MM-DD HH:MM UTC" */
export function fmtUtc(iso: string | number | Date): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

/** Axis label in UTC: the date at 00:00 UTC, otherwise HH:MM. */
export function utcAxisLabel(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  if (hh === "00" && mm === "00") {
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", timeZone: "UTC" });
  }
  return `${hh}:${mm}`;
}
