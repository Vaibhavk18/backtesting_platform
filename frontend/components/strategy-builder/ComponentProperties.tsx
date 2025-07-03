"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StrategyComponent, LogicNode } from "@/types/strategy"
import { useStrategyStore } from "@/stores/strategyStore"
import LogicOperatorBuilder from './LogicOperatorBuilder'
import { Switch } from "@/components/ui/switch"

interface ComponentPropertiesProps {
  component: StrategyComponent
  isOpen: boolean
  onClose: () => void
}

export default function ComponentProperties({ component, isOpen, onClose }: ComponentPropertiesProps) {
  const { updateComponent, removeComponent, validationErrors, strategy } = useStrategyStore()
  const [properties, setProperties] = useState(component.properties)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sync local state with component.properties if component changes
  useEffect(() => {
    setProperties(component.properties)
  }, [component])

  const handleSave = () => {
    updateComponent(component.id, { properties })
    onClose()
  }

  const handleDelete = () => {
    removeComponent(component.id)
    onClose()
  }

  // Inline validation errors for this component
  const errors = validationErrors[component.id] || []

  const renderPropertyFields = () => {
    switch (component.type) {
      case "sma-indicator":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                type="number"
                value={properties.period || 20}
                onChange={(e) => setProperties({ ...properties, period: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="source">Price Source</Label>
              <Select
                value={properties.source || "close"}
                onValueChange={(value) => setProperties({ ...properties, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "rsi-indicator":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                type="number"
                value={properties.period || 14}
                onChange={(e) => setProperties({ ...properties, period: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="overbought">Overbought Level</Label>
              <Input
                id="overbought"
                type="number"
                value={properties.overbought || 70}
                onChange={(e) => setProperties({ ...properties, overbought: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="oversold">Oversold Level</Label>
              <Input
                id="oversold"
                type="number"
                value={properties.oversold || 30}
                onChange={(e) => setProperties({ ...properties, oversold: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
        )

      case "asset-selector":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={properties.symbol || ""}
                onChange={(e) => setProperties({ ...properties, symbol: e.target.value })}
                placeholder="e.g., AAPL, BTC/USD"
              />
            </div>
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={properties.timeframe || "1h"}
                onValueChange={(value) => setProperties({ ...properties, timeframe: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "stop-loss":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Stop Loss Type</Label>
              <Select
                value={properties.type || "percentage"}
                onValueChange={(value) => setProperties({ ...properties, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="atr">ATR Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={properties.value || 2}
                onChange={(e) => setProperties({ ...properties, value: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
        )

      case "and-logic":
      case "or-logic":
      case "comparison": {
        // Fallback: List all nodes in the canvas (except itself) for selection
        function getNodeName(nodeId: string) {
          const node = strategy.components.find(c => c.id === nodeId);
          return node ? node.name : nodeId;
        }
        const allNodeOptions = strategy.components
          .filter(c => c.id !== component.id)
          .map(c => ({
            label: `${getNodeName(c.id)} (${c.type})`,
            value: c.id
          }));
        const leftIsConst = properties.leftIsConst || false;
        const rightIsConst = properties.rightIsConst || false;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} id="advanced-logic-toggle" />
              <Label htmlFor="advanced-logic-toggle">Advanced Logic</Label>
            </div>
            {showAdvanced ? (
              <LogicOperatorBuilder
                value={properties.logic || { type: "AND", children: [] }}
                onChange={logicNode => setProperties({ ...properties, logic: logicNode })}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Left</Label>
                  <Select
                    value={leftIsConst ? 'const' : (properties.left || '')}
                    onValueChange={val => {
                      if (val === 'const') setProperties({ ...properties, leftIsConst: true });
                      else setProperties({ ...properties, left: val, leftIsConst: false });
                    }}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select node or constant" /></SelectTrigger>
                    <SelectContent>
                      {allNodeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                      <SelectItem value="const">Constant…</SelectItem>
                    </SelectContent>
                  </Select>
                  {leftIsConst && (
                    <Input
                      className="w-full mt-2"
                      value={properties.leftConst || ''}
                      onChange={e => setProperties({ ...properties, leftConst: e.target.value })}
                      placeholder="Value"
                    />
                  )}
                </div>
                <div>
                  <Label>Operator</Label>
                  <Select
                    value={properties.operator || '=='}
                    onValueChange={val => setProperties({ ...properties, operator: val })}
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">&gt;</SelectItem>
                      <SelectItem value="<">&lt;</SelectItem>
                      <SelectItem value=">=">&ge;</SelectItem>
                      <SelectItem value="<=">&le;</SelectItem>
                      <SelectItem value="==">=</SelectItem>
                      <SelectItem value="!=">!=</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Right</Label>
                  <Select
                    value={rightIsConst ? 'const' : (properties.right || '')}
                    onValueChange={val => {
                      if (val === 'const') setProperties({ ...properties, rightIsConst: true });
                      else setProperties({ ...properties, right: val, rightIsConst: false });
                    }}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select node or constant" /></SelectTrigger>
                    <SelectContent>
                      {allNodeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                      <SelectItem value="const">Constant…</SelectItem>
                    </SelectContent>
                  </Select>
                  {rightIsConst && (
                    <Input
                      className="w-full mt-2"
                      value={properties.rightConst || ''}
                      onChange={e => setProperties({ ...properties, rightConst: e.target.value })}
                      placeholder="Value"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return <div className="text-sm text-muted-foreground">No configurable properties for this component.</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{component.name} Properties</DialogTitle>
        </DialogHeader>

        {/* Inline validation errors */}
        {errors.length > 0 && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-xs">
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        <div className="py-4">{renderPropertyFields()}</div>

        <div className="flex justify-between gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
