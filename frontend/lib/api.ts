// API utility for backend integration


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface MarketData {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  volume: string
  ohlcv: OHLCV[]
}

export interface OHLCV {
  instId: string;
  bar: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  volCcy?: number;
  volCcyQuote?: number;
  confirm: number;
  base: string;
  quote: string;
}

export interface PerformanceData {
  totalReturn: string
  sharpeRatio: string
  maxDrawdown: string
  winRate: string
  trades: any[]
  equityCurve: any[]
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `HTTP error ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Strategy Management
  async getStrategies(): Promise<ApiResponse<any[]>> {
    const res = await fetch(`${BASE_URL}/api/v1/strategies`)
    return handleResponse<any[]>(res)
  },

  async saveStrategy(strategy: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${BASE_URL}/api/v1/strategies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strategy),
    })
    return handleResponse<any>(res)
  },

  async validateStrategy(strategy: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${BASE_URL}/api/v1/strategies/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strategy),
    })
    return handleResponse<any>(res)
  },

  // Market Data
  async getMarketData(symbol: string, timeframe: string): Promise<ApiResponse<MarketData>> {
    const url = new URL(`${BASE_URL}/api/v1/ohlcv`)
    url.searchParams.append("symbol", symbol)
    url.searchParams.append("timeframe", timeframe)
    url.searchParams.append("exchange", "okx")
    url.searchParams.append("market_type", "SPOT")
    const res = await fetch(url.toString())
    return handleResponse<MarketData>(res)
  },

  async getSymbols(): Promise<ApiResponse<string[]>> {
    const res = await fetch(`${BASE_URL}/api/v1/okx/supported`)
    return handleResponse<{symbols: string[]}>(res).then(response => ({
      ...response,
      data: response.data.symbols
    }))
  },

  async getTimeframes(): Promise<ApiResponse<string[]>> {
    const res = await fetch(`${BASE_URL}/api/v1/okx/supported`)
    return handleResponse<{timeframes: string[]}>(res).then(response => ({
      ...response,
      data: response.data.timeframes
    }))
  },

  async getMarketTypes(): Promise<ApiResponse<string[]>> {
    const res = await fetch(`${BASE_URL}/api/v1/okx/supported`)
    return handleResponse<{market_types: string[]}>(res).then(response => ({
      ...response,
      data: response.data.market_types
    }))
  },

  // OKX-specific endpoints
  async getOKXInstruments(instType: string = "SPOT"): Promise<ApiResponse<any>> {
    const url = new URL(`${BASE_URL}/api/v1/okx/instruments`)
    url.searchParams.append("inst_type", instType)
    const res = await fetch(url.toString())
    return handleResponse<any>(res)
  },

  async getOKXTrades(instId: string, limit: number = 100): Promise<ApiResponse<any>> {
    const url = new URL(`${BASE_URL}/api/v1/okx/trades`)
    url.searchParams.append("instId", instId)
    url.searchParams.append("limit", limit.toString())
    const res = await fetch(url.toString())
    return handleResponse<any>(res)
  },

  async getOKXCandlesticks(instId: string, bar: string = "1m", limit: number = 100): Promise<ApiResponse<any>> {
    const url = new URL(`${BASE_URL}/api/v1/okx/candlesticks`)
    url.searchParams.append("instId", instId)
    url.searchParams.append("bar", bar)
    url.searchParams.append("limit", limit.toString())
    const res = await fetch(url.toString())
    return handleResponse<any>(res)
  },

  async getOKXHistoryCandles(instId: string, bar: string = "1m", limit: number = 100, after?: string, before?: string): Promise<ApiResponse<any>> {
    const url = new URL(`${BASE_URL}/api/v1/okx/history-candles`);
    url.searchParams.append("instId", instId);
    url.searchParams.append("bar", bar);
    url.searchParams.append("limit", limit.toString());
    if (after) url.searchParams.append("after", after);
    if (before) url.searchParams.append("before", before);
    const res = await fetch(url.toString());
    return handleResponse<any>(res);
  },

  async getOKXHistoryTrades(instId: string, type: string = "1", limit: number = 100, after?: string, before?: string): Promise<ApiResponse<any>> {
    const url = new URL(`${BASE_URL}/api/v1/okx/history-trades`);
    url.searchParams.append("instId", instId);
    url.searchParams.append("type", type);
    url.searchParams.append("limit", limit.toString());
    if (after) url.searchParams.append("after", after);
    if (before) url.searchParams.append("before", before);
    const res = await fetch(url.toString());
    return handleResponse<any>(res);
  },

  // Performance Data
  async getPerformanceData(strategyId: string, timeRange: string): Promise<ApiResponse<PerformanceData>> {
    const url = new URL(`${BASE_URL}/api/v1/performance`)
    url.searchParams.append("strategy_id", strategyId)
    url.searchParams.append("time_range", timeRange)
    const res = await fetch(url.toString())
    return handleResponse<PerformanceData>(res)
  },

  // Backtesting
  async runBacktest(strategy: any, parameters: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${BASE_URL}/api/strategies/backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy, parameters }),
    })
    return handleResponse<any>(res)
  },

  async savePerformanceData(strategyId: string, timeRange: string, metrics: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${BASE_URL}/api/v1/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategy_id: strategyId,
        time_range: timeRange,
        metrics_json: metrics,
      }),
    });
    return handleResponse<any>(res);
  },
}
