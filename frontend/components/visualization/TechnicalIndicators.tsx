"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface TechnicalIndicatorsProps {
  data: any
  symbol: string
  timeframe: string
}

// Mock indicator data
const mockIndicatorData = Array.from({ length: 50 }, (_, i) => ({
  time: Date.now() - (50 - i) * 3600000,
  rsi: 30 + Math.random() * 40,
  macd: (Math.random() - 0.5) * 2,
  signal: (Math.random() - 0.5) * 1.5,
  histogram: (Math.random() - 0.5) * 0.5,
  bb_upper: 105 + Math.random() * 10,
  bb_middle: 100 + Math.random() * 5,
  bb_lower: 95 + Math.random() * 10,
  stoch_k: Math.random() * 100,
  stoch_d: Math.random() * 100,
}))

const indicators = [
  {
    name: "RSI (14)",
    value: 68.4,
    signal: "Overbought",
    color: "text-yellow-600",
    description: "Relative Strength Index indicates momentum",
  },
  {
    name: "MACD",
    value: 1.23,
    signal: "Bullish",
    color: "text-green-600",
    description: "Moving Average Convergence Divergence",
  },
  {
    name: "Stochastic",
    value: 75.2,
    signal: "Overbought",
    color: "text-yellow-600",
    description: "Stochastic Oscillator momentum indicator",
  },
  {
    name: "Bollinger Bands",
    value: 0.85,
    signal: "Upper Band",
    color: "text-blue-600",
    description: "Price relative to Bollinger Bands",
  },
]

export default function TechnicalIndicators({ data, symbol, timeframe }: TechnicalIndicatorsProps) {
  return (
    <div className="space-y-6">
      {/* Indicator Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator) => (
          <Card key={indicator.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{indicator.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{indicator.value}</div>
                <Badge className={indicator.color}>{indicator.signal}</Badge>
                <p className="text-xs text-muted-foreground">{indicator.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RSI Chart */}
      <Card>
        <CardHeader>
          <CardTitle>RSI (Relative Strength Index)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockIndicatorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="Overbought" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" label="Oversold" />
              <Line type="monotone" dataKey="rsi" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MACD Chart */}
      <Card>
        <CardHeader>
          <CardTitle>MACD (Moving Average Convergence Divergence)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockIndicatorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="MACD"
                dot={false}
              />
              <Line type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={2} name="Signal" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bollinger Bands */}
        <Card>
          <CardHeader>
            <CardTitle>Bollinger Bands</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockIndicatorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Area
                  type="monotone"
                  dataKey="bb_upper"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Line type="monotone" dataKey="bb_middle" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Area
                  type="monotone"
                  dataKey="bb_lower"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stochastic Oscillator */}
        <Card>
          <CardHeader>
            <CardTitle>Stochastic Oscillator</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockIndicatorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis domain={[0, 100]} />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="5 5" />
                <Line
                  type="monotone"
                  dataKey="stoch_k"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="%K"
                  dot={false}
                />
                <Line type="monotone" dataKey="stoch_d" stroke="#ef4444" strokeWidth={2} name="%D" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Indicator Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Trend Indicators</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Moving Averages</span>
                  <Badge variant="default">Bullish</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MACD</span>
                  <Badge variant="default">Bullish</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ADX</span>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Momentum Indicators</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">RSI</span>
                  <Badge variant="outline">Overbought</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stochastic</span>
                  <Badge variant="outline">Overbought</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Williams %R</span>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Overall Signal</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">BULLISH</div>
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-muted-foreground">75% of indicators suggest bullish momentum</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
