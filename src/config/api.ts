// Backend base URL. Set VITE_API_URL at build/dev time, e.g. VITE_API_URL=https://api.example.com
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export function candlesUrl(symbol: string, timeframe: string, limit: number): string {
  const q = new URLSearchParams({ symbol, tf: timeframe, limit: String(limit) });
  return `${API_URL}/api/candles?${q.toString()}`;
}
