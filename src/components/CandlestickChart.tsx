import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

type CandleFromApi = {
  openTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  supertrend?: number | null;
  supertrendDir?: 1 | -1 | null;
};

type Props = {
  candles: CandleFromApi[];
};

export default function CandlestickChart({ candles }: Props) {
  const option = useMemo(() => {
    // ─────────────────────────────
    // X axis (time)
    // ─────────────────────────────
    const times = candles.map((c) => c.openTime);

    // ─────────────────────────────
    // Candlestick data
    // ─────────────────────────────
    const candleData = candles.map((c) => [c.open, c.close, c.low, c.high]);
    const lastCandle = candles[candles.length - 1];
    const lastClose = lastCandle?.close;
    // ─────────────────────────────
    // Supertrend (bull / bear)
    // null breaks the line (THIS is key)
    // ─────────────────────────────
    const supertrendBull = candles.map((c) =>
      c.supertrendDir === 1 ? c.supertrend : null,
    );

    const supertrendBear = candles.map((c) =>
      c.supertrendDir === -1 ? c.supertrend : null,
    );

    return {
      backgroundColor: "#020617",
      animation: true, // IMPORTANT: no flicker
      grid: {
        left: 35,
        right: 80, // ⬅️ increase this (try 70–100)
        top: 20,
        bottom: 40,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          label: {
            formatter: (p: any) => {
              const d = new Date(p.value);
              return d.toLocaleString("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
            },
          },
        },
      },
      xAxis: {
        type: "category",
        data: times,

        axisLabel: {
          formatter: (value: string) => {
            const d = new Date(value);

            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");

            // show date at midnight
            if (hh === "00" && mm === "00") {
              return d.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              });
            }

            return `${hh}:${mm}`;
          },
        },
      },
      yAxis: {
        position: "right",
        scale: true,
        splitLine: { show: true, lineStyle: { color: "#1e293b57" } },
        axisLabel: {
          margin: 25, // ⬅️ distance between axis line and numbers
          color: "#e5e7eb49",
        },
      },

      series: [
        {
          name: "Price",
          type: "candlestick",
          data: candleData,
          itemStyle: {
            color: "#22c55e",
            color0: "#ef4444",
            borderColor: "#22c55e",
            borderColor0: "#ef4444",
          },
          markLine: {
            symbol: "none",
            lineStyle: {
              type: "dashed",
              color: "#e5e7eb65",
              width: 1,
            },
            data: lastClose ? [{ yAxis: lastClose }] : [],
          },
        },
        {
          name: "Supertrend Bull",
          type: "line",
          data: supertrendBull,

          showSymbol: false,
          lineStyle: {
            color: "#22c55e",
            width: 2,
          },
        },
        {
          name: "Supertrend Bear",
          type: "line",
          data: supertrendBear,

          showSymbol: false,
          lineStyle: {
            color: "#ef4444",
            width: 2,
          },
        },
      ],
    };
  }, [candles]);

  return (
    <div
      style={{
        borderRadius: "1rem",
        overflow: "hidden",
        height: "100%",
        border: "1px solid #35363d",
      }}
    >
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
}
