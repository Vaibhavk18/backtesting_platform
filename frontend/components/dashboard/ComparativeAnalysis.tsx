"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface ComparativeAnalysisProps {
  data: any
}

const comparisonData = Array.from({ length: 252 }, (_, i) => ({
  date: new Date(2023, 0, i + 1).toISOString().split("T")[0],
  strategy1: 10000 * (1 + (Math.random() - 0.4) * 0.02 + i * 0.001),
  strategy2: 10000 * (1 + (Math.random() - 0.42) * 0.018 + i * 0.0009),
  benchmark: 10000 * (1 + (Math.random() - 0.45) * 0.015 + i * 0.0008),
}))

const performanceMetrics = [
  { metric: "Total Return", strategy1: "24.5%", strategy2: "18.2%", benchmark: "12.8%" },
  { metric: "Sharpe Ratio", strategy1: "1.85", strategy2: "1.42", benchmark: "0.98" },
  { metric: "Max Drawdown", strategy1: "-8.3%", strategy2: "-12.1%", benchmark: "-15.4%" },
  { metric: "Volatility", strategy1: "12.5%", strategy2: "15.8%", benchmark: "16.2%" },
  { metric: "Win Rate", strategy1: "68.4%", strategy2: "62.1%", benchmark: "N/A" },
  { metric: "Calmar Ratio", strategy1: "2.95", strategy2: "1.50", benchmark: "0.83" },
]

const radarComparisonData = [
  { subject: "Return", strategy1: 90, strategy2: 75, benchmark: 60, fullMark: 100 },
  { subject: "Risk-Adj Return", strategy1: 85, strategy2: 70, benchmark: 55, fullMark: 100 },
  { subject: "Consistency", strategy1: 88, strategy2: 65, benchmark: 50, fullMark: 100 },
  { subject: "Drawdown Control", strategy1: 82, strategy2: 68, benchmark: 45, fullMark: 100 },
  { subject: "Win Rate", strategy1: 85, strategy2: 75, benchmark: 60, fullMark: 100 },
  { subject: "Recovery", strategy1: 90, strategy2: 70, benchmark: 55, fullMark: 100 },
]

export default function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
  const [compareWith, setCompareWith] = useState("strategy2")
  const [timeframe, setTimeframe] = useState("1y")

  const getBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const rankMetrics = (s1: string, s2: string, benchmark: string) => {
    const values = [
      { name: "Strategy 1", value: Number.parseFloat(s1.replace("%", "")) },
      { name: "Strategy 2", value: Number.parseFloat(s2.replace("%", "")) },
      { name: "Benchmark", value: Number.parseFloat(benchmark.replace("%", "").replace("N/A", "0")) },
    ].sort((a, b) => b.value - a.value)

    return values.map((item, index) => ({ ...item, rank: index + 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Compare With</label>
          <Select value={compareWith} onValueChange={setCompareWith}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strategy2">Strategy 2</SelectItem>
              <SelectItem value="benchmark">Benchmark Only</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Timeframe</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Line
                type="monotone"
                dataKey="strategy1"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Current Strategy"
                dot={false}
              />
              {compareWith !== "benchmark" && (
                <Line
                  type="monotone"
                  dataKey="strategy2"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Strategy 2"
                  dot={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Benchmark"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => {
                const rankings = rankMetrics(metric.strategy1, metric.strategy2, metric.benchmark)

                return (
                  <div key={metric.metric} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{metric.metric}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Current Strategy</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.strategy1}</span>
                          <Badge variant={getBadgeVariant(rankings.find((r) => r.name === "Strategy 1")?.rank || 3)}>
                            #{rankings.find((r) => r.name === "Strategy 1")?.rank}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Strategy 2</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.strategy2}</span>
                          <Badge variant={getBadgeVariant(rankings.find((r) => r.name === "Strategy 2")?.rank || 3)}>
                            #{rankings.find((r) => r.name === "Strategy 2")?.rank}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Benchmark</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.benchmark}</span>
                          <Badge variant={getBadgeVariant(rankings.find((r) => r.name === "Benchmark")?.rank || 3)}>
                            #{rankings.find((r) => r.name === "Benchmark")?.rank}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Radar Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Multi-Dimensional Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarComparisonData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Current Strategy"
                  dataKey="strategy1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Strategy 2"
                  dataKey="strategy2"
                  stroke="hsl(var(--secondary))"
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Market Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Market Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Bull Market Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Strategy</span>
                  <span className="font-medium text-green-600">+32.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Strategy 2</span>
                  <span className="font-medium text-green-600">+28.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Benchmark</span>
                  <span className="font-medium text-green-600">+24.7%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Bear Market Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Strategy</span>
                  <span className="font-medium text-red-600">-8.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Strategy 2</span>
                  <span className="font-medium text-red-600">-15.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Benchmark</span>
                  <span className="font-medium text-red-600">-22.1%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Sideways Market Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Strategy</span>
                  <span className="font-medium">+4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Strategy 2</span>
                  <span className="font-medium">+1.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Benchmark</span>
                  <span className="font-medium">-0.5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
