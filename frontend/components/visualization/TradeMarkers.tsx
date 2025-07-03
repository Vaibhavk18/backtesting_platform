"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TradeMarkersProps {
  data: any
  symbol: string
}

const mockTrades = [
  {
    id: 1,
    type: "entry",
    side: "long",
    price: 98.5,
    time: Date.now() - 86400000 * 5,
    quantity: 100,
    reason: "RSI oversold + support level",
    status: "closed",
    pnl: 450,
  },
  {
    id: 2,
    type: "exit",
    side: "long",
    price: 102.75,
    time: Date.now() - 86400000 * 2,
    quantity: 100,
    reason: "Take profit target reached",
    status: "closed",
    pnl: 450,
  },
  {
    id: 3,
    type: "entry",
    side: "short",
    price: 104.2,
    time: Date.now() - 86400000 * 1,
    quantity: 75,
    reason: "Resistance rejection + RSI overbought",
    status: "open",
    pnl: -125,
  },
]

const mockSignals = [
  {
    time: Date.now() - 86400000 * 7,
    price: 96.8,
    signal: "buy",
    strength: 85,
    indicators: ["RSI", "MACD", "Support"],
  },
  {
    time: Date.now() - 86400000 * 4,
    price: 101.5,
    signal: "sell",
    strength: 72,
    indicators: ["RSI", "Resistance"],
  },
  {
    time: Date.now() - 86400000 * 1,
    price: 103.8,
    signal: "sell",
    strength: 90,
    indicators: ["RSI", "MACD", "Resistance"],
  },
]

const priceData = Array.from({ length: 30 }, (_, i) => ({
  time: Date.now() - (30 - i) * 86400000,
  price: 95 + Math.random() * 10 + Math.sin(i * 0.3) * 3,
}))

export default function TradeMarkers({ data, symbol }: TradeMarkersProps) {
  const openTrades = mockTrades.filter(trade => trade.status === 'open')
  const closedTrades = mockTrades.filter(trade => trade.status === 'closed')

  return (
    <div className="space-y-6">
      {/* Trade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTrades.length}</div>
            <p className="text-xs text-muted-foreground">
              Total exposure: $7,815
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTrades.length}</div>
            <p className="text-xs text-muted-foreground">
              This session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-$125</div>
            <p className="text-xs text-muted-foreground">
              -1.6% of portfolio
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
