"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CandlestickChart from "./CandlestickChart"
import TechnicalIndicators from "./TechnicalIndicators"
import VolumeProfile from "./VolumeProfile"
import TradeMarkers from "./TradeMarkers"
import { RefreshCw, Download, Settings } from "lucide-react"
import { useMarketData, useSymbols } from "@/hooks/useApi"
import { saveAs } from "file-saver"

export default function DataVisualization() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USDT")
  const [timeframe, setTimeframe] = useState("1h")
  const [showIndicators, setShowIndicators] = useState(true)
  const [showTrades, setShowTrades] = useState(true)

  const { data: marketData, isLoading, refetch } = useMarketData(selectedSymbol, timeframe)
  const { data: symbols } = useSymbols()

  function exportToCSV(data: any[], symbol: string, timeframe: string) {
    if (!data || !data.length) return;
    const header = "timestamp,open,high,low,close,volume\n";
    const rows = data.map(
      (candle: any) =>
        `${candle.timestamp || candle[0]},${candle.open || candle[1]},${candle.high || candle[2]},${candle.low || candle[3]},${candle.close || candle[4]},${candle.volume || candle[5]}`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${symbol}_${timeframe}_ohlcv.csv`);
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Symbol</label>
            <input
              type="text"
              className="w-32 border rounded px-2 py-1 text-sm"
              value={selectedSymbol}
              onChange={e => setSelectedSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. BTC-USDT"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showIndicators ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(!showIndicators)}
          >
            Indicators
          </Button>
          <Button variant={showTrades ? "default" : "outline"} size="sm" onClick={() => setShowTrades(!showTrades)}>
            Trades
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" style={{ display: isLoading ? 'inline-block' : 'none' }} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(marketData?.ohlcv, selectedSymbol, timeframe)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Market Info Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Symbol</span>
                <div className="font-bold text-lg">{selectedSymbol}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Price</span>
                <div className="font-bold text-lg text-green-600">${marketData?.currentPrice || "175.42"}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Change</span>
                <div className="font-bold text-lg text-green-600">
                  +{marketData?.change || "2.34"} ({marketData?.changePercent || "+1.35"}%)
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Volume</span>
                <div className="font-bold text-lg">{marketData?.volume || "45.2M"}</div>
              </div>
            </div>
            <Badge variant="default">Live</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Chart - {selectedSymbol}</CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Chart Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <CandlestickChart
              data={marketData?.ohlcv}
              symbol={selectedSymbol}
              timeframe={timeframe}
              showIndicators={showIndicators}
              showTrades={showTrades}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Analysis Tabs */}
      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="volume">Volume Profile</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="mt-6">
          <TechnicalIndicators data={marketData} symbol={selectedSymbol} timeframe={timeframe} />
        </TabsContent>

        <TabsContent value="volume" className="mt-6">
          <VolumeProfile data={marketData} symbol={selectedSymbol} />
        </TabsContent>

        <TabsContent value="trades" className="mt-6">
          <TradeMarkers data={marketData} symbol={selectedSymbol} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
