"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface RiskMetricsProps {
  data: any
}

const riskMetrics = [
  { metric: "Volatility", value: 12.5, benchmark: 15.2, rating: "Good" },
  { metric: "Beta", value: 0.85, benchmark: 1.0, rating: "Excellent" },
  { metric: "Alpha", value: 6.3, benchmark: 0, rating: "Excellent" },
  { metric: "Information Ratio", value: 1.42, benchmark: 0, rating: "Good" },
  { metric: "Calmar Ratio", value: 2.95, benchmark: 1.8, rating: "Excellent" },
  { metric: "Sortino Ratio", value: 2.18, benchmark: 1.5, rating: "Good" },
]

const riskRadarData = [
  { subject: "Volatility", A: 85, B: 70, fullMark: 100 },
  { subject: "Sharpe Ratio", A: 92, B: 75, fullMark: 100 },
  { subject: "Max Drawdown", A: 78, B: 65, fullMark: 100 },
  { subject: "Win Rate", A: 88, B: 72, fullMark: 100 },
  { subject: "Profit Factor", A: 85, B: 68, fullMark: 100 },
  { subject: "Recovery Factor", A: 90, B: 80, fullMark: 100 },
]

const varData = [
  { confidence: "95%", var: -2.1, cvar: -3.2 },
  { confidence: "99%", var: -3.8, cvar: -5.1 },
  { confidence: "99.9%", var: -6.2, cvar: -8.4 },
]

export default function RiskMetrics({ data }: RiskMetricsProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Average":
        return "bg-yellow-100 text-yellow-800"
      case "Poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Metrics Table */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Risk Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.metric}</span>
                    <Badge className={getRatingColor(metric.rating)}>{metric.rating}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Strategy: {metric.value}</span>
                    <span>Benchmark: {metric.benchmark}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Profile Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={riskRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Strategy"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Radar
                name="Benchmark"
                dataKey="B"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value at Risk */}
      <Card>
        <CardHeader>
          <CardTitle>Value at Risk (VaR)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={varData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="confidence" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
              <Bar dataKey="var" fill="hsl(var(--primary))" name="VaR" />
              <Bar dataKey="cvar" fill="hsl(var(--destructive))" name="CVaR" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Decomposition */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Risk Decomposition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Market Risk</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Systematic Risk</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Idiosyncratic Risk</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Sector Exposure</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Technology</span>
                  <span>28%</span>
                </div>
                <Progress value={28} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Healthcare</span>
                  <span>22%</span>
                </div>
                <Progress value={22} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Financial</span>
                  <span>18%</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Risk Factors</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Interest Rate</span>
                  <span>42%</span>
                </div>
                <Progress value={42} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Credit Spread</span>
                  <span>31%</span>
                </div>
                <Progress value={31} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Volatility</span>
                  <span>27%</span>
                </div>
                <Progress value={27} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
