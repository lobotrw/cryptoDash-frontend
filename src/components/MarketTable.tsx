import React, { useEffect, useMemo, useState } from "react";
import { candlesUrl } from "../config/api";
import type { ApiCandle } from "../lib/stats";
import { computeStats } from "../lib/stats";

type Row = {
  symbol: string;
  price: number;
  priceChangePct: number;
  volume: number;
  volumeChangePct: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  deltaPct: number;
  supertrendDir: 1 | -1 | null;
  stale: boolean;
  error?: string;
};

type Props = {
  symbols: string[];
  timeframe: string;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  refreshMs?: number;
};

function fmtNum(n: number, d = 2) {
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(d);
}

function fmtPct(n: number) {
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

const errorRow = (symbol: string, error: string): Row => ({
  symbol, price: NaN, priceChangePct: NaN, volume: NaN, volumeChangePct: NaN, buyVolume: NaN,
  sellVolume: NaN, delta: NaN, deltaPct: NaN, supertrendDir: null, stale: false, error,
});

async function loadRow(symbol: string, timeframe: string, signal: AbortSignal): Promise<Row> {
  const res = await fetch(candlesUrl(symbol, timeframe, 3), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const candles: ApiCandle[] = json.candles ?? [];
  const s = computeStats(candles, timeframe);
  if (!s) throw new Error("no data");
  return {
    symbol,
    price: s.price,
    priceChangePct: s.priceChangePct,
    volume: s.totalVolume,
    volumeChangePct: s.volumeChangePct,
    buyVolume: s.buyVolume,
    sellVolume: s.sellVolume,
    delta: s.delta,
    deltaPct: s.deltaPct,
    supertrendDir: s.supertrendDir,
    stale: Boolean(json.stale),
  };
}

export default function MarketTable({
  symbols,
  timeframe,
  selectedSymbol,
  onSelectSymbol,
  refreshMs = 30_000,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // Small candle slices per symbol, refreshed on the same interval as the chart.
  // One failing symbol only marks its own row (allSettled), never blanks the table.
  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      const settled = await Promise.allSettled(symbols.map((s) => loadRow(s, timeframe, ctrl.signal)));
      if (ctrl.signal.aborted) return;
      setRows(
        settled.map((r, i) =>
          r.status === "fulfilled" ? r.value : errorRow(symbols[i], (r.reason as Error)?.message ?? "error"),
        ),
      );
      setLoading(false);
    }

    load();
    const interval = setInterval(load, refreshMs);
    return () => {
      ctrl.abort();
      clearInterval(interval);
    };
  }, [symbols, timeframe, refreshMs]);

  const sortedRows = useMemo(() => {
    // Keep stable ordering: selected first, then by symbol
    return [...rows].sort((a, b) => {
      if (a.symbol === selectedSymbol) return -1;
      if (b.symbol === selectedSymbol) return 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [rows, selectedSymbol]);

  return (
    <div
      style={{
        marginTop: "1rem",
        width: "100%",
        border: "1px solid #35363d",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <th style={th}>Symbol</th>
              <th style={th}>Price</th>
              <th style={th}>Price %</th>
              <th style={th}>Volume</th>
              <th style={th}>Vol %</th>
              <th style={th} title="Taker buy volume of the last closed candle">Buy Vol</th>
              <th style={th}>Sell Vol</th>
              <th style={th}>Delta</th>
              <th style={th}>Δ%</th>
              <th style={th}>SuperTrend</th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r) => {
              const isSelected = r.symbol === selectedSymbol;
              const stText =
                r.supertrendDir === 1
                  ? "Bull"
                  : r.supertrendDir === -1
                    ? "Bear"
                    : "-";

              return (
                <tr
                  key={r.symbol}
                  onClick={() => onSelectSymbol(r.symbol)}
                  style={{
                    cursor: "pointer",
                    background: isSelected
                      ? "rgba(59,130,246,0.15)"
                      : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <td style={td}>
                    {r.symbol.replace("USDT", "")}
                    {r.stale && <span style={{ color: "#f59e0b", marginLeft: 6 }} title="No new candles: delisted?">stale</span>}
                    {r.error && <span style={{ color: "#f87171", marginLeft: 6 }} title={r.error}>unavailable</span>}
                  </td>
                  <td style={td}>{fmtNum(r.price, 2)}</td>

                  <td
                    style={{
                      ...td,
                      color: r.priceChangePct >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {fmtPct(r.priceChangePct)}
                  </td>

                  <td style={td}>{fmtNum(r.volume, 0)}</td>

                  <td
                    style={{
                      ...td,
                      color: r.volumeChangePct >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {fmtPct(r.volumeChangePct)}
                  </td>

                  <td style={{ ...td, color: "#22c55e" }}>
                    {fmtNum(r.buyVolume, 0)}
                  </td>

                  <td style={{ ...td, color: "#ef4444" }}>
                    {fmtNum(r.sellVolume, 0)}
                  </td>

                  <td
                    style={{
                      ...td,
                      color: r.delta >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {fmtNum(r.delta, 0)}
                  </td>

                  <td
                    style={{
                      ...td,
                      color: r.deltaPct >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {fmtPct(r.deltaPct)}
                  </td>
                  <td
                    style={{
                      ...td,
                      color:
                        r.supertrendDir === 1
                          ? "#22c55e"
                          : r.supertrendDir === -1
                            ? "#ef4444"
                            : "#ffffff",
                    }}
                  >
                    {stText}
                  </td>
                </tr>
              );
            })}

            {!loading && sortedRows.length === 0 && (
              <tr>
                <td style={{ ...td, padding: "1rem" }} colSpan={10}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.65)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 13,
  color: "rgba(255,255,255,0.9)",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
};
