import { useMemo } from "react";

type Candle = {
  close: number;
  volume?: number;
  takerBuyVolume?: number;
  supertrendDir?: 1 | -1 | null;
};

type Props = {
  symbol: string;
  timeframe: string;
  candles: Candle[];
};

function pctChange(curr: number, prev: number) {
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

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
  const stats = useMemo(() => {
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    if (!last) {
      return null;
    }

    const price = last.close;
    const priceChangePct = prev ? pctChange(last.close, prev.close) : 0;

    const totalVolume = Number(last.volume ?? 0);
    const buyVolume = Number(last.takerBuyVolume ?? 0);
    const sellVolume = Math.max(totalVolume - buyVolume, 0);

    const delta = buyVolume - sellVolume;
    const deltaPct = totalVolume === 0 ? 0 : (delta / totalVolume) * 100;

    const volumeChangePct =
      prev && prev.volume ? pctChange(totalVolume, prev.volume) : 0;

    return {
      price,
      priceChangePct,
      totalVolume,
      volumeChangePct,
      buyVolume,
      sellVolume,
      delta,
      deltaPct,
      supertrendDir: (last.supertrendDir ?? null) as 1 | -1 | null,
    };
  }, [candles]);

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
          Timeframe: {timeframe}
        </div>
      </div>

      <StatRow label="Price" value={fmtNum(stats.price, 2)} />

      <StatRow
        label="Price Change"
        value={fmtPct(stats.priceChangePct)}
        valueColor={priceUp ? "#22c55e" : "#ef4444"}
      />

      <StatRow label="Volume" value={fmtNum(stats.totalVolume, 0)} />

      <StatRow
        label="Volume Change"
        value={fmtPct(stats.volumeChangePct)}
        valueColor={volUp ? "#22c55e" : "#ef4444"}
      />

      <StatRow
        label="Buy Volume"
        value={fmtNum(stats.buyVolume, 0)}
        valueColor="#22c55e"
      />

      <StatRow
        label="Sell Volume"
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
