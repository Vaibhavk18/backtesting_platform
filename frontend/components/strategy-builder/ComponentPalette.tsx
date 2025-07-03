"use client"

import React from 'react';
import { Eye, Target, Flag, CheckSquare, BarChart3, Zap, Package, Clock, Plus } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { StrategyComponent } from '@/types/strategy';

const componentTypes = [
  { type: 'asset-selector', icon: Eye, label: 'Asset', color: 'bg-purple-500', description: 'Select asset' },
  { type: 'sma-indicator', icon: BarChart3, label: 'SMA', color: 'bg-blue-500', description: 'Simple Moving Average' },
  { type: 'rsi-indicator', icon: BarChart3, label: 'RSI', color: 'bg-green-500', description: 'Relative Strength Index' },
  { type: 'macd-indicator', icon: BarChart3, label: 'MACD', color: 'bg-orange-500', description: 'MACD Indicator' },
  { type: 'and-logic', icon: CheckSquare, label: 'AND', color: 'bg-teal-500', description: 'AND Logic' },
  { type: 'or-logic', icon: CheckSquare, label: 'OR', color: 'bg-yellow-500', description: 'OR Logic' },
  { type: 'comparison', icon: Flag, label: 'Comparison', color: 'bg-pink-500', description: 'Comparison Node' },
  { type: 'market-order', icon: Zap, label: 'Market Order', color: 'bg-indigo-500', description: 'Market Order' },
  { type: 'limit-order', icon: Zap, label: 'Limit Order', color: 'bg-indigo-400', description: 'Limit Order' },
  { type: 'stop-loss', icon: Package, label: 'Stop Loss', color: 'bg-red-500', description: 'Stop Loss' },
  { type: 'position-sizing', icon: Clock, label: 'Position Sizing', color: 'bg-gray-500', description: 'Position Sizing' },
];

export function ComponentPalette() {
  const addComponent = useStrategyStore((s) => s.addComponent);

  const handleDragStart = (e: React.DragEvent, type: StrategyComponent['type']) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (type: StrategyComponent['type']) => {
    // Add component to center of canvas when clicked
    const newComponent: StrategyComponent = {
      id: `${type}-${Date.now()}`,
      type,
      name: type,
      position: { x: 400, y: 300 },
      properties: {},
      inputs: [],
      outputs: [],
    };
    addComponent(newComponent);
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Strategy Components</h2>
        <p className="text-sm text-slate-600">Drag components to the canvas or click to add</p>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {componentTypes.map(({ type, icon: Icon, label, color, description }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleClick(type)}
            className="group flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${color} text-white mr-4 group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800 group-hover:text-slate-900">{label}</h3>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <Plus size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Connect components by dragging from one to another</p>
          <p>✨ Double-click components to edit content</p>
        </div>
      </div>
    </div>
  );
}
