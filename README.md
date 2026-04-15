# StockMind AI

AI-powered stock analytics dashboard with real-time data, interactive charts, and AI chat.

## Features

- **Stock Search** - Search for any stock symbol
- **Real-time KPIs** - Price, Volume, Market Cap, Day Range, 52W High/Low, P/E Ratio
- **Interactive Charts**
  - Price Chart with OHLC data
  - SMA 50 & SMA 200 overlays
  - Volume bar chart
  - RSI 14 indicator
- **AI Chat** - Ask questions about stocks using Groq AI
- **Light/Dark Theme** - Toggle between themes

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Zustand (state management)
- Recharts (charts)
- Finnhub API (stock data)
- Groq AI (chat)

## Getting Started

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_FINNHUB_API_KEY=your_finnhub_key
VITE_GROQ_API_KEY=your_groq_key
```

## License

MIT