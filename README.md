
#  CryptoDash – Market Dashboard (Frontend)

CryptoDash is a real-time crypto market dashboard built with **React** and **Apache ECharts**, designed for advanced market analysis and indicator visualization.

This frontend consumes a custom backend API that streams OHLCV data and computed indicators such as **ATR** and **Supertrend**.
---

##  Features

- Candlestick charts (OHLC)
- Auto-updating market data
- Supertrend overlay (bullish / bearish)
- Market statistics panel
- Interactive market table
  - Price & volume change
  - Buy / sell volume
  - Delta & delta %
  - Supertrend direction
- Click a symbols row at the table → instantly updates the chart to clicked row
   Dark UI style

<img width="2559" height="1287" alt="image" src="https://github.com/user-attachments/assets/320c66f6-cbe6-4134-9998-3690fea54460" />

---

##  Tech Stack

- React
- TypeScript
- Apache ECharts
- Vite
- Fetch API

---

##  Project Structure

```
src/
├─ components/
│  ├─ CandlestickChart.tsx
│  ├─ MarketStats.tsx
│  ├─ MarketTable.tsx
│  └─ MarketControls.tsx
├─ pages/
│  └─ Dashboard.tsx
├─ config/
│  └─ market.ts
└─ main.tsx
```

---

## ⚙️ Setup & Run

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Environment variables
Create `.env` file:

```env
VITE_API_URL=http://localhost:4000
```

### 3️⃣ Run locally
```bash
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

---

## Backend Requirement

This frontend expects the **CryptoDash backend** to be running.
backend ->> https://github.com/VanHes1ng/cryptoDash-server

Required API:
```
GET /api/candles?symbol=BTCUSDT&tf=1h&limit=200
```

Returned candle fields:
- openTime
- open
- high
- low
- close
- volume
- takerBuyVolume
- atr
- supertrend
- supertrendDir

---

## Design Notes
- Indicators are computed server-side
- Frontend focuses purely on visualization

---

## Disclaimer
This project is for educational and analytical purposes only.  
It is not financial advice.

---

## Author
VanHes1ng  
Crypto market analytics & system development
```

## Configuration

- `VITE_API_URL`: the backend base URL (default `http://localhost:4000`). See `.env.example`. The backend must allow this app's origin through its `CORS_ORIGIN` setting.

## How the numbers are defined

- The backend stores **closed candles only**. The stats panel and the table describe the **last closed candle** compared with the one before it, and the panel shows its time. (Comparing a still-forming candle with a full one made "Volume Change" look like a large drop.)
- **Taker buy volume** is Binance's taker-buy base volume. Sell = total − taker buy. Delta = buy − sell.
- All times are shown in **UTC**, matching the candle open times.
- The chart, stats and table refresh every 30 s. A refresh updates the chart in place without unmounting it. If one symbol fails, only its own row is marked "unavailable".
- A **stale** badge appears when the backend reports no new candles for a symbol (for example after a delisting). MATICUSDT was replaced by POLUSDT.

## Tests

`npm test` (vitest) runs the stats and UTC-label tests. Also run `npm run lint` and `npm run build`.
