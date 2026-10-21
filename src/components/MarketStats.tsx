import { useMemo } from "react";

import type { ApiCandle } from "../lib/stats";
import { computeStats, fmtUtc } from "../lib/stats";

type Props = {
  symbol: string;
  timeframe: string;
  candles: ApiCandle[];
};

function fmtNum(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(digits);
}

function fmtPct(n: number) {
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function MarketStats({ symbol, timeframe, candles }: Props) {
  // last CLOSED candle vs the closed candle before it
  const stats = useMemo(() => computeStats(candles, timeframe), [candles, timeframe]);

  if (!stats) return null;

  const priceUp = stats.priceChangePct >= 0;
  const volUp = stats.volumeChangePct >= 0;
  const deltaUp = stats.delta >= 0;

  const stText =
    stats.supertrendDir === 1
      ? "Bullish"
      : stats.supertrendDir === -1
        ? "Bearish"
        : "-";

  const stColor =
    stats.supertrendDir === 1
      ? "#22c55e"
      : stats.supertrendDir === -1
        ? "#ef4444"
        : "rgba(255,255,255,0.7)";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {symbol.replace("USDT", "")}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
          Timeframe: {timeframe} · last closed candle
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{fmtUtc(stats.asOf)}</div>
      </div>

      <StatRow label="Price" value={fmtNum(stats.price, 2)} />

      <StatRow
        label="Price Change (vs prev. candle)"
        value={fmtPct(stats.priceChangePct)}
        valueColor={priceUp ? "#22c55e" : "#ef4444"}
      />

      <StatRow label="Volume" value={fmtNum(stats.totalVolume, 0)} />

      <StatRow
        label="Volume Change (vs prev. candle)"
        value={fmtPct(stats.volumeChangePct)}
        valueColor={volUp ? "#22c55e" : "#ef4444"}
      />

      <StatRow
        label="Taker Buy Volume"
        value={fmtNum(stats.buyVolume, 0)}
        valueColor="#22c55e"
      />

      <StatRow
        label="Taker Sell Volume"
        value={fmtNum(stats.sellVolume, 0)}
        valueColor="#ef4444"
      />

      <StatRow
        label="Delta"
        value={`${fmtNum(stats.delta, 0)} (${fmtPct(stats.deltaPct)})`}
        valueColor={deltaUp ? "#22c55e" : "#ef4444"}
      />

      <StatRow label="Supertrend" value={stText} valueColor={stColor} />
    </div>
  );
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
        borderRadius: 12,
        padding: "1rem",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 18 }}>
        {label}
      </div>
      <div
        style={{
          color: valueColor ?? "rgba(255,255,255,0.92)",
          fontSize: 18,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}
