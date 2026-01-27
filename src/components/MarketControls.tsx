type Props = {
  timeframe: string;
  onTimeframeChange: (t: string) => void;

  timeframes: string[];
};

export default function MarketControls({
  timeframe,
  onTimeframeChange,
  timeframes,
}: Props) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
      {/* Timeframes */}
      <div>
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            style={{
              marginRight: "0.1rem",
              padding: "0.4rem 0.8rem",
              background: tf === timeframe ? "#0ea5e9" : "#020617",
              color: "#e5e7eb",
              border: "1px solid #1d2e55",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
