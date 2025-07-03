"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStrategyStore } from "@/stores/strategyStore"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export default function StrategyValidation() {
  const { strategy } = useStrategyStore()
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  })

  useEffect(() => {
    validateStrategy()
  }, [strategy])

  const validateStrategy = () => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if strategy has components
    if (strategy.components.length === 0) {
      errors.push("Strategy must have at least one component")
    }

    // Check for asset selector
    const hasAssetSelector = strategy.components.some((c) => c.type === "asset-selector")
    if (!hasAssetSelector) {
      errors.push("Strategy must include an asset selector")
    }

    // Check for execution component
    const hasExecution = strategy.components.some((c) => c.type.includes("order") || c.type.includes("execution"))
    if (!hasExecution && strategy.components.length > 1) {
      warnings.push("Strategy should include an execution component")
    }

    // Check for risk management
    const hasRiskManagement = strategy.components.some((c) => c.type.includes("stop") || c.type.includes("risk"))
    if (!hasRiskManagement && strategy.components.length > 2) {
      warnings.push("Consider adding risk management components")
    }

    // Check for disconnected components
    const connectedComponents = new Set<string>()
    strategy.connections.forEach((conn) => {
      connectedComponents.add(conn.from)
      connectedComponents.add(conn.to)
    })

    const disconnectedComponents = strategy.components.filter(
      (c) => !connectedComponents.has(c.id) && strategy.components.length > 1,
    )

    if (disconnectedComponents.length > 0) {
      warnings.push(`${disconnectedComponents.length} component(s) are not connected`)
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-medium">Validation Status</h4>
        <Badge variant={validation.isValid ? "default" : "destructive"}>
          {validation.isValid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {validation.isValid ? "Valid" : "Invalid"}
        </Badge>
      </div>

      {validation.errors.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-destructive">Errors</h5>
          {validation.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-yellow-600">Warnings</h5>
          {validation.warnings.map((warning, index) => (
            <Alert key={index} className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {validation.isValid && validation.warnings.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            Strategy validation passed successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
