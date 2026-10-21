import { describe, expect, it } from "vitest";
import { closedCandles, computeStats, fmtUtc, utcAxisLabel, type ApiCandle } from "./stats";

const H = 3600e3;
const t0 = Date.UTC(2026, 9, 19, 10, 0);
const c = (i: number, close: number, volume: number, takerBuyVolume: number): ApiCandle => ({
  openTime: new Date(t0 + i * H).toISOString(), open: close, high: close, low: close, close, volume, takerBuyVolume, supertrendDir: 1,
});

describe("computeStats", () => {
  const candles = [c(0, 100, 1000, 600), c(1, 110, 800, 300), c(2, 111, 50, 40)]; // #2 still forming
  const now = t0 + 2 * H + 10 * 60e3; // 12:10 UTC: the 12:00 candle is not closed

  it("ignores the still-forming candle", () => {
    expect(closedCandles(candles, "1h", now)).toHaveLength(2);
    const s = computeStats(candles, "1h", now)!;
    expect(s.asOf).toBe(candles[1].openTime);
    expect(s.price).toBe(110);
    expect(s.priceChangePct).toBeCloseTo(10);
    expect(s.volumeChangePct).toBeCloseTo(-20); // 800 vs 1000, not 50 vs 800 (-93.75 %)
  });

  it("delta = taker buy - (total - taker buy)", () => {
    const s = computeStats(candles, "1h", now)!;
    expect(s.buyVolume).toBe(300);
    expect(s.sellVolume).toBe(500);
    expect(s.delta).toBe(-200);
    expect(s.deltaPct).toBeCloseTo(-25);
  });

  it("returns null without a closed candle", () => {
    expect(computeStats([candles[2]], "1h", now)).toBeNull();
  });
});

describe("UTC labels", () => {
  it("formats in UTC regardless of the browser time zone", () => {
    expect(fmtUtc("2026-10-19T00:00:00.000Z")).toBe("2026-10-19 00:00 UTC");
    expect(utcAxisLabel("2026-10-19T13:05:00.000Z")).toBe("13:05");
    expect(utcAxisLabel("2026-10-19T00:00:00.000Z")).toBe("Oct 19");
  });
});
