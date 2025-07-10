"use client"

import React from 'react';
import { ComponentPalette } from './ComponentPalette';
import { Toolbar } from './Toolbar';
import StrategyCanvas from './StrategyCanvas';
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StrategyValidation from "./StrategyValidation"
import { useStrategyStore } from "@/stores/strategyStore"
import { buildBackendStrategyPayload } from "@/stores/strategyStore"
import { Play, Save } from "lucide-react"
import { useSaveStrategy, useValidateStrategy, useBacktest, useStrategies } from "@/hooks/useApi"
import { api } from "@/lib/api"

export function StrategyBuilder() {
  const { strategy, validateStrategy, saveStrategy } = useStrategyStore()
  const [isValidating, setIsValidating] = useState(false)
  const [isBacktesting, setIsBacktesting] = useState(false)
  const saveStrategyMutation = useSaveStrategy()
  const validateStrategyMutation = useValidateStrategy()
  const backtestMutation = useBacktest()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [strategyName, setStrategyName] = useState(strategy.name || "")
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const { data: strategiesList, refetch: refetchStrategies } = useStrategies()
  const { loadStrategy, setStrategy } = useStrategyStore()
  const [description, setDescription] = useState(strategy.description || "")

  useEffect(() => {
    if (showLoadDialog) refetchStrategies()
  }, [showLoadDialog, refetchStrategies])

  const handleValidate = async () => {
    setIsValidating(true)
    try {
      await validateStrategyMutation.mutateAsync(strategy)
    } catch (error) {
      console.error("Validation failed:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = async () => {
    setStrategyName(strategy.name || "")
    setDescription(strategy.description || "")
    setShowSaveDialog(true)
  }

  const handleConfirmSave = async () => {
    try {
      // Extract asset-selector node properties
      const assetSelector = strategy.components.find((c) => c.type === "asset-selector");
      const market_type = assetSelector?.properties?.market_type || "spot";
      const allocation = assetSelector?.properties?.allocation ?? 1.0;
      const order_type = assetSelector?.properties?.order_type || "market";
      const slippage = assetSelector?.properties?.slippage ?? 0.0;
      const fee = assetSelector?.properties?.fee ?? 0.0;
      const stop_loss = assetSelector?.properties?.stop_loss ?? null;
      const take_profit = assetSelector?.properties?.take_profit ?? null;

      const updatedStrategy = {
        ...strategy,
        name: strategyName,
        description,
        market_type,
        order_type,
        allocation,
        slippage,
        fee,
        stop_loss,
        take_profit,
      };
      const payload = buildBackendStrategyPayload(updatedStrategy);
      await saveStrategyMutation.mutateAsync(payload);
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Save failed:", error)
    }
  }

  const handleBacktest = async () => {
    setIsBacktesting(true)
    try {
      // Find the asset-selector node in the strategy components
      const assetSelector = strategy.components.find(
        (c) => c.type === "asset-selector"
      );
      if (!assetSelector) {
        throw new Error("No asset-selector node found in the strategy.");
      }
      const symbol = assetSelector.properties.symbol;
      const timeframe = assetSelector.properties.timeframe;
      if (!symbol || !timeframe) {
        throw new Error("Asset or timeframe not set in asset-selector node.");
      }
      // Fetch OHLCV data for the selected asset and timeframe
      const marketDataRes = await api.getMarketData(symbol, timeframe);
      const ohlcv_data = marketDataRes.data?.ohlcv || [];
      if (!ohlcv_data.length) {
        throw new Error("No OHLCV data found for the selected asset and timeframe.");
      }
      // Run the backtest with the selected strategy and fetched OHLCV data
      const result = await backtestMutation.mutateAsync({
        strategy,
        parameters: {
          ohlcv_data,
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        },
      });
      console.log("Backtest result:", result)
      // Save performance data after backtest
      if (result && result.data) {
        await api.savePerformanceData(
          strategy.id,
          "1y", // or use the actual time range
          result.data
        )
        console.log("Performance data saved!")
      }
    } catch (error) {
      console.error("Backtest failed:", error)
    } finally {
      setIsBacktesting(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full w-full">
        <ComponentPalette />
        <div className="flex-1 flex flex-col">
          <Toolbar />
          <div className="p-4">
            <Button
              variant="default"
              onClick={handleBacktest}
              disabled={isBacktesting}
              className="mb-4"
            >
              {isBacktesting ? "Running Backtest..." : "Run Backtest"}
              <Play className="w-4 h-4 ml-2 inline" />
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              className="mb-4 ml-2"
            >
              Save Strategy
              <Save className="w-4 h-4 ml-2 inline" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLoadDialog(true)}
              className="mb-4 ml-2"
            >
              Load Strategy
            </Button>
          </div>
          <StrategyCanvas />
        </div>
      </div>
      {/* Load Strategy Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a strategy to load</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto">
            {strategiesList && strategiesList.length > 0 ? (
              <ul>
                {strategiesList.map((s: any) => (
                  <li key={s.id} className={`flex items-center justify-between p-2 rounded hover:bg-slate-100 cursor-pointer ${selectedStrategyId === s.id ? 'bg-slate-200' : ''}`}
                      onClick={() => setSelectedStrategyId(s.id)}>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.created_at ? new Date(s.created_at).toLocaleString() : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500">No strategies found.</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLoadDialog(false)} variant="outline">Cancel</Button>
            <Button
              onClick={async () => {
                if (selectedStrategyId) {
                  // Find the selected strategy and ensure components/connections are arrays
                  const selected = strategiesList.find((s: any) => s.id === selectedStrategyId);
                  if (selected) {
                    // Patch structure for node-based builder if needed
                    const patched = {
                      ...selected,
                      components: selected.components || [],
                      connections: selected.connections || [],
                    };
                    // If your loadStrategy expects the full object, use setStrategy; otherwise, pass the id
                    if (typeof loadStrategy === 'function' && loadStrategy.length > 0) {
                      await loadStrategy(selectedStrategyId);
                    } else if (typeof setStrategy === 'function') {
                      setStrategy(patched);
                    }
                  }
                  setShowLoadDialog(false)
                }
              }}
              disabled={!selectedStrategyId}
            >
              Load
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Save Strategy Name Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Strategy</DialogTitle>
          </DialogHeader>
          <Input
            value={strategyName}
            onChange={e => setStrategyName(e.target.value)}
            placeholder="Strategy Name"
            autoFocus
          />
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="mt-2"
          />
          <DialogFooter>
            <Button onClick={() => setShowSaveDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={handleConfirmSave} disabled={!strategyName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}
