export interface StrategyComponent {
  id: string
  type: string
  name: string
  position: {
    x: number
    y: number
  }
  properties: Record<string, any>
  inputs: string[]
  outputs: string[]
}

export interface StrategyConnection {
  id: string
  from: string
  to: string
  fromOutput: string
  toInput: string
}

export interface Strategy {
  id: string
  name: string
  components: StrategyComponent[]
  connections: StrategyConnection[]
  isValid: boolean
  createdAt: Date
  updatedAt: Date
  description?: string
  market_type?: string
  order_type?: string
  allocation?: number
  slippage?: number
  fee?: number
  stop_loss?: number
  take_profit?: number
}

export interface BacktestResult {
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
  profitFactor: number
}

export interface PerformanceMetrics {
  returns: number[]
  dates: string[]
  drawdowns: number[]
  trades: Trade[]
  benchmarkReturns?: number[]
}

export interface Trade {
  id: string
  symbol: string
  side: "long" | "short"
  entryDate: string
  exitDate?: string
  entryPrice: number
  exitPrice?: number
  quantity: number
  pnl?: number
  status: "open" | "closed"
}

// LogicNode type for nested logic trees
export type LogicNode =
  | { type: "AND" | "OR"; children: LogicNode[] }
  | { type: "CONDITION"; left: string; operator: string; right: string | number };
