import { useEffect, useState } from "react";
import CandlestickChart from "../components/CandlestickChart";
import MarketControls from "../components/MarketControls";
import { COINS, TIMEFRAMES } from "../config/market";
import MarketTable from "../components/MarketTable";
import MarketStats from "../components/MarketStats";

type Candle = {
  openTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  supertrendDir?: 1 | -1 | null;
};

export default function Dashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/candles?symbol=${symbol}&tf=${timeframe}&limit=300`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch candles");
      }

      const json = await res.json();
      setCandles(json.candles ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchCandles();

    // auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCandles();
    }, 30_000);

    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  return (
    <div style={{ marginTop: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>
        {symbol.replace("USDT", "/USDT")} · {timeframe}
      </h1>

      <MarketControls
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        timeframes={TIMEFRAMES}
      />

      {loading && <div>Loading market data…</div>}
      {error && <div style={{ color: "#f87171" }}>{error}</div>}

      {!loading && !error && candles.length > 0 && (
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
            <MarketStats
              symbol={symbol}
              timeframe={timeframe}
              candles={candles}
            />{" "}
          </div>
        </div>
      )}

      <MarketTable
        symbols={COINS}
        timeframe={timeframe}
        selectedSymbol={symbol}
        onSelectSymbol={setSymbol}
      />
    </div>
  );
}
