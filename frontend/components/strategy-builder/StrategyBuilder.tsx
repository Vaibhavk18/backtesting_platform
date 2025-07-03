"use client"

import React from 'react';
import { ComponentPalette } from './ComponentPalette';
import { Toolbar } from './Toolbar';
import StrategyCanvas from './StrategyCanvas';
import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StrategyValidation from "./StrategyValidation"
import { useStrategyStore } from "@/stores/strategyStore"
import { Play, Save } from "lucide-react"
import { useSaveStrategy, useValidateStrategy, useBacktest } from "@/hooks/useApi"
import { api } from "@/lib/api"

export function StrategyBuilder() {
  const { strategy, validateStrategy, saveStrategy } = useStrategyStore()
  const [isValidating, setIsValidating] = useState(false)
  const [isBacktesting, setIsBacktesting] = useState(false)
  const saveStrategyMutation = useSaveStrategy()
  const validateStrategyMutation = useValidateStrategy()
  const backtestMutation = useBacktest()

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
    try {
      await saveStrategyMutation.mutateAsync(strategy)
    } catch (error) {
      console.error("Save failed:", error)
    }
  }

  const handleBacktest = async () => {
    setIsBacktesting(true)
    try {
      const result = await backtestMutation.mutateAsync({
        strategy,
        parameters: { startDate: "2023-01-01", endDate: "2023-12-31" },
      })
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
          </div>
          <StrategyCanvas />
        </div>
      </div>
    </DndProvider>
  );
}
