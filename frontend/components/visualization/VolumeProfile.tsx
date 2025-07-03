"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts"

interface VolumeProfileProps {
  data: any
  symbol: string
}

// Mock volume profile data
const mockVolumeProfile = Array.from({ length: 20 }, (_, i) => {
  const price = 95 + i * 0.5
  const volume = Math.random() * 1000000
  const isHighVolume = volume > 500000

  return {
    price: price.toFixed(2),
    volume: Math.floor(volume),
    buyVolume: Math.floor(volume * (0.4 + Math.random() * 0.2)),
    sellVolume: Math.floor(volume * (0.4 + Math.random() * 0.2)),
    isHighVolume,
    isPOC: i === 10, // Point of Control
  }
})

const mockTimeVolume = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  volume: Math.random() * 2000000,
  avgPrice: 100 + (Math.random() - 0.5) * 10,
}))

const volumeMetrics = [
  { label: "Total Volume", value: "45.2M", change: "+12.5%" },
  { label: "Avg Volume (20d)", value: "38.7M", change: "+16.8%" },
  { label: "Volume Ratio", value: "1.17", change: "Above Average" },
  { label: "VWAP", value: "$175.42", change: "+0.85%" },
]

export default function VolumeProfile({ data, symbol }: VolumeProfileProps) {
  const pocPrice = mockVolumeProfile.find((item) => item.isPOC)?.price || "100.00"
  const totalVolume = mockVolumeProfile.reduce((sum, item) => sum + item.volume, 0)

  return (
    <div className="space-y-6">
      {/* Volume Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {volumeMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Profile Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Volume Profile</CardTitle>
              <Badge variant="outline">POC: ${pocPrice}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={mockVolumeProfile}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="price" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === "buyVolume" ? "Buy Volume" : name === "sellVolume" ? "Sell Volume" : "Total Volume",
                  ]}
                />
                <Bar dataKey="buyVolume" stackId="volume" fill="#22c55e" name="Buy Volume" />
                <Bar dataKey="sellVolume" stackId="volume" fill="#ef4444" name="Sell Volume" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intraday Volume Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Intraday Volume Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={mockTimeVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                <YAxis yAxisId="volume" orientation="left" />
                <YAxis yAxisId="price" orientation="right" />
                <Tooltip
                  labelFormatter={(value) => `${value}:00`}
                  formatter={(value: number, name: string) => [
                    name === "volume" ? value.toLocaleString() : `$${value.toFixed(2)}`,
                    name === "volume" ? "Volume" : "Avg Price",
                  ]}
                />
                <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--primary))" fillOpacity={0.6} name="volume" />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="avgPrice"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Volume Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">High Volume Nodes</h4>
              <div className="space-y-2">
                {mockVolumeProfile
                  .filter((item) => item.isHighVolume)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-medium">${item.price}</span>
                      <span className="text-sm text-muted-foreground">{(item.volume / 1000000).toFixed(1)}M</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Support/Resistance Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium">Strong Support</span>
                  <span className="text-sm text-green-600">$98.50</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium">POC</span>
                  <span className="text-sm text-blue-600">${pocPrice}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm font-medium">Strong Resistance</span>
                  <span className="text-sm text-red-600">$104.25</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Volume Insights</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Market Sentiment</div>
                  <Badge variant="default">Bullish</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Higher buy volume at key levels</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Volume Trend</div>
                  <Badge variant="default">Increasing</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Above average volume activity</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
