import React, { useMemo } from "react";

type Candle = {
  openTime: string;
  close: number;
  volume?: number;
  supertrendDir?: 1 | -1 | null;
  takerBuyVolume?: number;
};

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
};

type Props = {
  symbols: string[];
  timeframe: string;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

function pctChange(curr: number, prev: number) {
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

function fmtNum(n: number, d = 2) {
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(d);
}

function fmtPct(n: number) {
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function MarketTable({
  symbols,
  timeframe,
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch small candle slices for each symbol (limit=3 is enough)
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          symbols.map(async (symbol) => {
            const res = await fetch(
              `http://localhost:4000/api/candles?symbol=${symbol}&tf=${timeframe}&limit=3`,
            );
            if (!res.ok) throw new Error(`Failed ${symbol}`);

            const json = await res.json();
            const candles: Candle[] = json.candles ?? [];
            return { symbol, candles };
          }),
        );

        const computed: Row[] = results
          .map(({ symbol, candles }) => {
            const last = candles[candles.length - 1];
            const prev = candles[candles.length - 2];

            if (!last || !prev) return null;

            const price = last.close;
            const priceChangePct = pctChange(last.close, prev.close);

            const vLast = Number(last.volume ?? 0);
            const vPrev = Number(prev.volume ?? 0);
            const volumeChangePct = vPrev === 0 ? 0 : pctChange(vLast, vPrev);

            const totalVolume = Number(last.volume ?? 0);
            const buyVolume = Number(last.takerBuyVolume ?? 0);
            const sellVolume = Math.max(totalVolume - buyVolume, 0);

            const delta = buyVolume - sellVolume;
            const deltaPct =
              totalVolume === 0 ? 0 : (delta / totalVolume) * 100;

            return {
              symbol,
              price,
              priceChangePct,
              volume: totalVolume,
              volumeChangePct,
              buyVolume,
              sellVolume,
              delta,
              deltaPct,
              supertrendDir: last.supertrendDir ?? null,
            };
          })
          .filter(Boolean) as Row[];

        if (!cancelled) setRows(computed);
      } catch (e) {
        if (!cancelled) setError("Failed to load table");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [symbols, timeframe]);

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
              <th style={th}>Buy Vol</th>
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
                  <td style={td}>{r.symbol.replace("USDT", "")}</td>
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

            {!loading && !error && sortedRows.length === 0 && (
              <tr>
                <td style={{ ...td, padding: "1rem" }} colSpan={6}>
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
