import { useCallback, useEffect, useRef, useState } from "react";
import CandlestickChart from "../components/CandlestickChart";
import MarketControls from "../components/MarketControls";
import { COINS, TIMEFRAMES } from "../config/market";
import { candlesUrl } from "../config/api";
import MarketTable from "../components/MarketTable";
import MarketStats from "../components/MarketStats";
import type { ApiCandle } from "../lib/stats";
import { fmtUtc } from "../lib/stats";

const REFRESH_MS = 30_000;

export default function Dashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [candles, setCandles] = useState<ApiCandle[]>([]);
  const [stale, setStale] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedKey = useRef<string | null>(null);

  const fetchCandles = useCallback(
    async (signal?: AbortSignal) => {
      const key = `${symbol}|${timeframe}`;
      // Only the first load of a symbol/timeframe shows "Loading"; refreshes keep the chart on screen
      if (loadedKey.current !== key) setInitialLoading(true);
      try {
        const res = await fetch(candlesUrl(symbol, timeframe, 300), { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setCandles(json.candles ?? []);
        setStale(Boolean(json.stale));
        setError(null);
        loadedKey.current = key;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        setError("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    },
    [symbol, timeframe],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCandles(ctrl.signal);
    const interval = setInterval(() => fetchCandles(ctrl.signal), REFRESH_MS);
    return () => {
      ctrl.abort();
      clearInterval(interval);
    };
  }, [fetchCandles]);

  const showChart = candles.length > 0 && loadedKey.current === `${symbol}|${timeframe}`;
  const last = candles[candles.length - 1];

  return (
    <div style={{ marginTop: "1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>
        {symbol.replace("USDT", "/USDT")} · {timeframe}
      </h1>
      {last && (
        <div style={{ fontSize: 12, color: stale ? "#f59e0b" : "rgba(255,255,255,0.55)", marginBottom: "0.75rem" }}>
          Last closed candle: {fmtUtc(last.openTime)}
          {stale && " · STALE: no new candles (delisted symbol?)"}
        </div>
      )}

      <MarketControls
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        timeframes={TIMEFRAMES}
      />

      {initialLoading && !showChart && <div>Loading market data…</div>}
      {error && <div style={{ color: "#f87171" }}>{error}</div>}

      {showChart && (
        <div style={{ display: "flex" }}>
          <div style={{ flex: 3, gap: "1rem", marginRight: "1rem" }}>
            <CandlestickChart candles={candles} />
          </div>

          <div
            style={{
              flex: 1,
              width: "100%",
              border: "1px solid #35363d",
              borderRadius: 12,
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <MarketStats symbol={symbol} timeframe={timeframe} candles={candles} />
          </div>
        </div>
      )}

      <MarketTable
        symbols={COINS}
        timeframe={timeframe}
        selectedSymbol={symbol}
        onSelectSymbol={setSymbol}
        refreshMs={REFRESH_MS}
      />
    </div>
  );
}
