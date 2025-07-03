"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface PerformanceChartsProps {
  data: any
}

// Mock data - replace with actual data from your API
const mockEquityCurve = Array.from({ length: 252 }, (_, i) => ({
  date: new Date(2023, 0, i + 1).toISOString().split("T")[0],
  portfolio: 10000 * (1 + (Math.random() - 0.4) * 0.02 + i * 0.001),
  benchmark: 10000 * (1 + (Math.random() - 0.45) * 0.015 + i * 0.0008),
  drawdown: Math.random() * -10,
}))

const mockReturns = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2023, i, 1).toLocaleDateString("en-US", { month: "short" }),
  returns: (Math.random() - 0.5) * 20,
  benchmark: (Math.random() - 0.5) * 15,
}))

const mockDrawdownPeriods = [
  { period: "Jan 2023", drawdown: -5.2, duration: 12 },
  { period: "Mar 2023", drawdown: -3.8, duration: 8 },
  { period: "Jun 2023", drawdown: -8.3, duration: 18 },
  { period: "Sep 2023", drawdown: -4.1, duration: 6 },
  { period: "Nov 2023", drawdown: -2.9, duration: 4 },
]

export default function PerformanceCharts({ data }: PerformanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equity Curve */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockEquityCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Strategy"
                dot={false}
              />
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

      {/* Monthly Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockReturns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, ""]} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="returns" fill="hsl(var(--primary))" name="Strategy" />
              <Bar dataKey="benchmark" fill="hsl(var(--muted-foreground))" name="Benchmark" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Drawdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Drawdown Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockEquityCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Drawdown"]}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Return Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Return Distribution Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 252 }, (_, i) => {
              const return_ = (Math.random() - 0.5) * 6
              const intensity = Math.abs(return_) / 3
              const color = return_ > 0 ? `rgba(34, 197, 94, ${intensity})` : `rgba(239, 68, 68, ${intensity})`

              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: color }}
                  title={`Day ${i + 1}: ${return_.toFixed(2)}%`}
                />
              )
            })}
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
                <div
                  key={opacity}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
