"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PerformanceCharts from "./PerformanceCharts"
import RiskMetrics from "./RiskMetrics"
import TradeAnalysis from "./TradeAnalysis"
import ComparativeAnalysis from "./ComparativeAnalysis"
import { Loader2, RefreshCw } from "lucide-react"
import { useStrategies, usePerformanceData } from "@/hooks/useApi"

export default function PerformanceDashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState("strategy-1")
  const [timeRange, setTimeRange] = useState("1y")

  const { data: strategies, isLoading: strategiesLoading } = useStrategies()
  const { data: performanceData, isLoading, refetch } = usePerformanceData(selectedStrategy, timeRange)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading performance data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Strategy</label>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies?.map((strategy: any) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{performanceData?.totalReturn || "+24.5%"}</div>
            <p className="text-xs text-muted-foreground">vs benchmark: +18.2%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.sharpeRatio || "1.85"}</div>
            <Badge variant="default" className="mt-1">
              Excellent
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{performanceData?.maxDrawdown || "-8.3%"}</div>
            <p className="text-xs text-muted-foreground">Recovery: 45 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.winRate || "68.4%"}</div>
            <p className="text-xs text-muted-foreground">142 of 208 trades</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="mt-6">
          <PerformanceCharts data={performanceData} />
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <RiskMetrics data={performanceData} />
        </TabsContent>

        <TabsContent value="trades" className="mt-6">
          <TradeAnalysis data={performanceData} />
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          <ComparativeAnalysis data={performanceData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
