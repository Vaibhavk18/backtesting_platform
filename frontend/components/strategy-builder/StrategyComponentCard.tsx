import React, { useState, useCallback } from 'react';
import { Edit3, Trash2, Link, Check, X } from 'lucide-react';
import { StrategyComponent } from '@/types/strategy';

interface StrategyComponentCardProps {
  component: StrategyComponent;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<StrategyComponent>) => void;
  onDelete: () => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
  onShowProperties: () => void;
  onNodeClick: () => void;
  isEditingConnection?: boolean;
  onInputPortClick?: (inputName: string) => void;
  onOutputPortClick?: (outputName: string) => void;
}

const componentConfig: { [key: string]: { color: string; borderColor: string } } = {
  'asset-selector': { color: 'bg-purple-500', borderColor: 'border-purple-200' },
  'sma-indicator': { color: 'bg-blue-500', borderColor: 'border-blue-200' },
  'rsi-indicator': { color: 'bg-green-500', borderColor: 'border-green-200' },
  'macd-indicator': { color: 'bg-orange-500', borderColor: 'border-orange-200' },
  'and-logic': { color: 'bg-teal-500', borderColor: 'border-teal-200' },
  'or-logic': { color: 'bg-yellow-500', borderColor: 'border-yellow-200' },
  'comparison': { color: 'bg-pink-500', borderColor: 'border-pink-200' },
  'market-order': { color: 'bg-indigo-500', borderColor: 'border-indigo-200' },
  'limit-order': { color: 'bg-indigo-400', borderColor: 'border-indigo-200' },
  'stop-loss': { color: 'bg-red-500', borderColor: 'border-red-200' },
  'position-sizing': { color: 'bg-gray-500', borderColor: 'border-gray-200' },
};

export function StrategyComponentCard({
  component,
  isSelected,
  isConnecting,
  onSelect,
  onUpdate,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  onShowProperties,
  onNodeClick,
  isEditingConnection,
  onInputPortClick,
  onOutputPortClick,
}: StrategyComponentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(component.name);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const config = componentConfig[component.type] || { color: 'bg-slate-400', borderColor: 'border-slate-200' };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    onSelect();
  }, [isEditing, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const container = document.querySelector('[data-canvas]') as HTMLElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newPosition = {
      x: Math.max(0, Math.min(e.clientX - containerRect.left - dragOffset.x, containerRect.width - 240)),
      y: Math.max(0, Math.min(e.clientY - containerRect.top - dragOffset.y, containerRect.height - 120)),
    };
    onUpdate({ position: newPosition });
  }, [isDragging, dragOffset, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    onUpdate({ name: editName });
    setIsEditing(false);
  }, [editName, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditName(component.name);
    setIsEditing(false);
  }, [component.name]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      handleEdit();
    }
  }, [isEditing, handleEdit]);

  return (
    <div
      className={`absolute select-none ${isDragging ? 'z-50' : 'z-10'} ${isSelected ? 'z-20' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease',
        minWidth: 240,
        minHeight: 120,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing || isEditingConnection) onNodeClick();
      }}
    >
      {/* --- Input ports (left side) --- */}
      <div className="absolute left-0 top-1/2 flex flex-col gap-2 -translate-y-1/2 z-20">
        {(component.inputs || []).map((input, idx) => (
          <div
            key={input}
            className="w-4 h-4 bg-slate-300 rounded-full border-2 border-slate-500 cursor-crosshair flex items-center justify-center shadow"
            title={input}
            style={{ margin: 2 }}
            onClick={e => {
              e.stopPropagation();
              onInputPortClick && onInputPortClick(input);
            }}
          >
            <span className="text-xs font-bold text-slate-700">{input[0].toUpperCase()}</span>
          </div>
        ))}
      </div>
      {/* --- Output ports (right side) --- */}
      <div className="absolute right-0 top-1/2 flex flex-col gap-2 -translate-y-1/2 z-20">
        {(component.outputs || []).map((output, idx) => (
          <div
            key={output}
            className="w-4 h-4 bg-blue-300 rounded-full border-2 border-blue-500 cursor-crosshair flex items-center justify-center shadow"
            title={output}
            style={{ margin: 2 }}
            onClick={e => {
              e.stopPropagation();
              onOutputPortClick && onOutputPortClick(output);
            }}
          >
            <span className="text-xs font-bold text-blue-700">{output[0].toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div
        className={`w-60 bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
          isSelected 
            ? `${config.borderColor} shadow-xl` 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xl'
        } ${
          isDragging ? 'shadow-2xl' : ''
        } ${
          isConnecting ? 'cursor-crosshair' : 'cursor-move'
        }`}
        onMouseEnter={() => isConnecting && onConnectionEnd()}
      >
        {/* Header */}
        <div className={`flex items-center p-4 rounded-t-xl ${config.color} text-white`}>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Component name"
              autoFocus
            />
          ) : (
            <h3 className="flex-1 font-medium text-sm">{component.name}</h3>
          )}
        </div>
        {/* Show key properties below name */}
        <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100 bg-slate-50">
          <div><b>Type:</b> {component.type}</div>
          {component.properties && Object.keys(component.properties).length > 0 && (
            <div className="font-semibold mb-1">Properties:</div>
          )}
          {component.properties && Object.keys(component.properties).length > 0 && (
            <ul className="space-y-0.5">
              {Object.entries(component.properties).map(([key, value]) => (
                <li key={key} className="flex gap-1">
                  <span className="font-medium">{key}:</span>
                  <span
                    title={typeof value === 'string' && value.length > 12 ? value : undefined}
                    className="truncate max-w-[100px] inline-block align-bottom"
                  >
                    {typeof value === 'string' && value.length > 12
                      ? value.slice(0, 10) + '...'
                      : String(value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Actions */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          {isEditing ? (
            <div className="flex space-x-2 ml-auto">
              <button
                onClick={handleCancel}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
              <button
                onClick={handleSave}
                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                title="Save"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onConnectionStart}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Connect to another component"
              >
                <Link size={14} />
              </button>
              <button
                onClick={onShowProperties}
                className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-100 rounded transition-colors"
                title="Show Properties"
              >
                <Edit3 size={14} />
              </button>
              <div className="flex space-x-1">
                <button
                  onClick={handleEdit}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Edit Name"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 