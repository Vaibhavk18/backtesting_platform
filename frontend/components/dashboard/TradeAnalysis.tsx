"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Search, TrendingUp, TrendingDown } from "lucide-react"

interface TradeAnalysisProps {
  data: any
}

const mockTrades = [
  {
    id: 1,
    symbol: "AAPL",
    side: "Long",
    entryDate: "2023-10-15",
    exitDate: "2023-10-22",
    entryPrice: 175.5,
    exitPrice: 182.3,
    quantity: 100,
    pnl: 680,
    duration: 7,
    return: 3.87,
  },
  {
    id: 2,
    symbol: "MSFT",
    side: "Long",
    entryDate: "2023-10-18",
    exitDate: "2023-10-25",
    entryPrice: 338.2,
    exitPrice: 345.8,
    quantity: 50,
    pnl: 380,
    duration: 7,
    return: 2.25,
  },
  {
    id: 3,
    symbol: "GOOGL",
    side: "Short",
    entryDate: "2023-10-20",
    exitDate: "2023-10-24",
    entryPrice: 142.8,
    exitPrice: 138.9,
    quantity: 75,
    pnl: 292.5,
    duration: 4,
    return: 2.73,
  },
  // Add more mock trades...
]

const durationData = [
  { duration: "1-3 days", count: 45, avgReturn: 1.2 },
  { duration: "4-7 days", count: 38, avgReturn: 2.1 },
  { duration: "1-2 weeks", count: 32, avgReturn: 3.4 },
  { duration: "2-4 weeks", count: 28, avgReturn: 4.2 },
  { duration: "1+ months", count: 15, avgReturn: 6.8 },
]

const pnlDistribution = [
  { range: "-10% to -5%", count: 8, color: "#ef4444" },
  { range: "-5% to 0%", count: 22, color: "#f97316" },
  { range: "0% to 5%", count: 85, color: "#22c55e" },
  { range: "5% to 10%", count: 42, color: "#16a34a" },
  { range: "10%+", count: 18, color: "#15803d" },
]

export default function TradeAnalysis({ data }: TradeAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")

  const filteredTrades = mockTrades.filter((trade) => trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Trade Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">208</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">68.4%</div>
            <p className="text-xs text-muted-foreground">142 wins / 66 losses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5 days</div>
            <p className="text-xs text-muted-foreground">Range: 1-45 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.34</div>
            <Badge variant="default" className="mt-1">
              Good
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Duration Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Duration Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="duration" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Trade Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* P&L Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>P&L Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pnlDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {pnlDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Trades</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Return %</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.side === "Long" ? "default" : "secondary"}>
                      {trade.side === "Long" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell>{trade.entryDate}</TableCell>
                  <TableCell>{trade.exitDate}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>${trade.exitPrice.toFixed(2)}</TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell className={trade.pnl > 0 ? "text-green-600" : "text-red-600"}>
                    ${trade.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className={trade.return > 0 ? "text-green-600" : "text-red-600"}>
                    {trade.return > 0 ? "+" : ""}
                    {trade.return.toFixed(2)}%
                  </TableCell>
                  <TableCell>{trade.duration} days</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
