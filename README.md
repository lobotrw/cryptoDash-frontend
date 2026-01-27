
# 📊 CryptoDash – Market Dashboard (Frontend)

CryptoDash is a real-time crypto market dashboard built with **React** and **Apache ECharts**, designed for advanced market analysis and indicator visualization.

This frontend consumes a custom backend API that streams OHLCV data and computed indicators such as **ATR** and **Supertrend**.

---

## 🚀 Features

- 📈 Candlestick charts (OHLC)
- 🔁 Auto-updating market data
- 📉 Supertrend overlay (bullish / bearish)
- 📊 Market statistics panel
- 📋 Interactive market table
  - Price & volume change
  - Buy / sell volume
  - Delta & delta %
  - Supertrend direction
- 🖱 Click a symbol → instantly updates the chart
- 🌙 Dark, TradingView-style UI

---

## 🧱 Tech Stack

- React
- TypeScript
- Apache ECharts
- Vite
- Fetch API

---

## 📦 Project Structure

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

## 🔌 Backend Requirement

This frontend expects the **CryptoDash backend** to be running.

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

## 🧠 Design Notes

- Indicators are computed server-side
- Frontend focuses purely on visualization
- Apache ECharts chosen for:
  - Stability
  - No flickering
  - Multi-series overlays
  - Advanced axis control

---

## 📌 Roadmap

- More indicators (EMA, VWAP, RSI)
- Symbol search & filters
- Multi-timeframe comparison
- Full-screen chart mode
- Cloud deployment (Vercel)

---

## ⚠️ Disclaimer

This project is for educational and analytical purposes only.  
It is not financial advice.

---

## 🧑‍💻 Author

VanHes1ng  
Crypto market analytics & system development
```
