"use client"

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStrategyStore } from '@/stores/strategyStore';
import ComponentProperties from './ComponentProperties';
import { Undo2, Redo2, Save, Upload, Pencil } from 'lucide-react';
import { StrategyComponent } from '@/types/strategy';
import { StrategyComponentCard } from './StrategyComponentCard';
import ConnectionLine from './ConnectionLine';

function getPortPosition(node: StrategyComponent, port: string, isInput: boolean) {
  // Simple layout: input ports on left, output ports on right
  const y = node.position.y + 32 + (isInput ? node.inputs.indexOf(port) * 20 : node.outputs.indexOf(port) * 20);
  const x = node.position.x + (isInput ? 0 : 200);
  return { x, y };
}

const StrategyCanvas = () => {
  const {
    strategy,
    setComponentPosition,
    addConnection,
    removeConnection,
    addComponent,
    removeComponent,
    selectedComponentId,
    selectComponent,
    undo,
    redo,
    saveStrategy,
    loadStrategy,
    autosave,
    validationErrors,
    updateComponent,
  } = useStrategyStore();

  const components = strategy.components;
  const connections = strategy.connections;

  const [dragOver, setDragOver] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showPropertiesForId, setShowPropertiesForId] = useState<string | null>(null);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [editingEnd, setEditingEnd] = useState<'from' | 'to' | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string, output: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const componentType = e.dataTransfer.getData('componentType');
    console.log('handleDrop componentType:', componentType);
    if (componentType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: Math.max(0, e.clientX - rect.left - 120),
        y: Math.max(0, e.clientY - rect.top - 60),
      };
      const defaults = getComponentDefaults(componentType);
      if (!defaults) {
        console.error('No defaults found for component type:', componentType);
        return;
      }
      const newComponent: StrategyComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        name: componentType,
        position,
        properties: defaults.properties,
        inputs: defaults.inputs,
        outputs: defaults.outputs,
      };
      addComponent(newComponent);
    }
  }, [addComponent]);

  const handleConnectionLineClick = (connectionId: string) => {
    setEditingConnectionId(connectionId);
    setEditingEnd(null);
  };

  const handleConnectionHandleClick = (connectionId: string, end: 'from' | 'to') => {
    setEditingConnectionId(connectionId);
    setEditingEnd(end);
  };

  const handleNodeClick = (nodeId: string) => {
    if (editingConnectionId && editingEnd) {
      // Edit the selected end of the connection
      updateConnection(editingConnectionId, editingEnd, nodeId);
      setEditingConnectionId(null);
      setEditingEnd(null);
    } else if (connectingFromId && connectingFromId !== nodeId) {
      // Complete new connection
      addConnection({
        id: `${connectingFromId}-${nodeId}-${Date.now()}`,
        from: connectingFromId,
        to: nodeId,
        fromOutput: '',
        toInput: '',
      });
      setConnectingFromId(null);
    } else {
      selectComponent(nodeId);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (connectingFromId) {
      setConnectingFromId(null);
    } else if (editingConnectionId) {
      setEditingConnectionId(null);
      setEditingEnd(null);
    } else {
      selectComponent(null);
    }
  };

  const handleConnectionStart = (nodeId: string) => {
    setConnectingFromId(nodeId);
  };

  const handleOutputPortClick = (nodeId: string, output: string) => {
    setConnectingFrom({ nodeId, output });
  };

  const handleInputPortClick = (targetNodeId: string, inputName: string) => {
    if (connectingFrom) {
      const connection = {
        id: `${connectingFrom.nodeId}-${targetNodeId}-${inputName}-${Date.now()}`,
        from: connectingFrom.nodeId,
        fromOutput: connectingFrom.output,
        to: targetNodeId,
        toInput: inputName
      };
      console.log('handleInputPortClick', { targetNodeId, inputName, connectingFrom }); // DEBUG
      console.log('addConnection', connection); // DEBUG
      addConnection(connection);
      setConnectingFrom(null);
    }
  };

  // Autosave
  useEffect(() => { autosave(); }, [strategy, autosave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveStrategy(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) { e.preventDefault(); removeComponent(selectedComponentId); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveStrategy, removeComponent, selectedComponentId]);

  // Helper for node defaults (reuse your improved getComponentDefaults)
  function getComponentDefaults(type: string) {
    console.log('getComponentDefaults called with:', type);
    switch (type) {
      case 'asset-selector':
        return { inputs: [], outputs: ['data'], properties: { symbol: '', timeframe: '1h' } };
      case 'sma-indicator':
        return { inputs: ['data'], outputs: ['result'], properties: { period: 20, source: 'close' } };
      case 'rsi-indicator':
        return { inputs: ['data'], outputs: ['result'], properties: { period: 14, overbought: 70, oversold: 30 } };
      case 'macd-indicator':
        return { inputs: ['data'], outputs: ['result'], properties: {} };
      case 'and-logic':
      case 'or-logic':
        return { inputs: ['cond1', 'cond2'], outputs: ['result'], properties: {} };
      case 'comparison':
        return { inputs: ['left', 'right'], outputs: ['result'], properties: {} };
      case 'market-order':
        return {
          inputs: ['signal'],
          outputs: ['order'],
          properties: { side: 'buy', quantity: 1, slippage: 0.001, commission: 0.0005 }
        };
      case 'limit-order':
        return {
          inputs: ['signal'],
          outputs: ['order'],
          properties: { side: 'buy', quantity: 1, price: 0, slippage: 0.001, commission: 0.0005 }
        };
      case 'stop-loss':
        return { inputs: ['order'], outputs: ['protectedOrder'], properties: { type: 'percentage', value: 2 } };
      case 'position-sizing':
        return { inputs: ['order'], outputs: ['sizedOrder'], properties: {} };
      default:
        console.warn('Unknown component type:', type);
        return { inputs: ['input'], outputs: ['output'], properties: {} };
    }
  }

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only open on canvas background
    if (e.target === canvasRef.current) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: '' });
    }
  };
  const handleNodeContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };
  const closeContextMenu = () => setContextMenu(null);

  // Save/load handlers
  const handleSave = () => { saveStrategy(); };
  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        loadStrategy(json);
      } catch (err) {
        alert('Invalid strategy file');
      }
    };
    reader.readAsText(file);
  };

  // Validation errors summary
  const errorList = Object.entries(validationErrors).flatMap(([id, errs]) => errs.map(e => ({ id, error: e })));

  // Helper functions for context menu actions
  function duplicateComponent(component: StrategyComponent) {
    const newId = `${component.type}-${Date.now()}`;
    const newComponent = {
      ...component,
      id: newId,
      name: component.name + ' Copy',
      position: { x: component.position.x + 40, y: component.position.y + 40 },
    };
    addComponent(newComponent);
  }
  function bringToFront(nodeId: string) {
    // Move node to end of array (rendered last = on top)
    // This is a visual effect only; to persist z-order, add a zIndex field to StrategyComponent and update store logic
    updateComponent(nodeId, {}); // trigger update
  }
  function sendToBack(nodeId: string) {
    updateComponent(nodeId, {});
  }

  function updateConnection(connectionId: string, end: 'from' | 'to', newNodeId: string) {
    // Find the connection
    const connIdx = strategy.connections.findIndex(c => c.id === connectionId);
    if (connIdx === -1) return;
    const updated = { ...strategy.connections[connIdx], [end]: newNodeId };
    // Replace in store
    const newConnections = [...strategy.connections];
    newConnections[connIdx] = updated;
    // Use store's loadStrategy to update
    loadStrategy({ ...strategy, connections: newConnections });
  }

  // Canvas rendering
  return (
    <div
      ref={canvasRef}
      data-canvas
      className={`flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 ${dragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />
      </div>
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((connection, index) => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            components={components}
            onClick={() => handleConnectionLineClick(connection.id)}
            isEditing={editingConnectionId === connection.id}
            onHandleClick={(end) => handleConnectionHandleClick(connection.id, end)}
          />
        ))}
      </svg>
      {/* Components */}
      {components.map((component) => (
        <StrategyComponentCard
          key={component.id}
          component={component}
          isSelected={selectedComponentId === component.id}
          isConnecting={!!connectingFromId}
          onSelect={() => selectComponent(component.id)}
          onUpdate={(updates) => updateComponent(component.id, updates)}
          onDelete={() => removeComponent(component.id)}
          onConnectionStart={() => handleConnectionStart(component.id)}
          onConnectionEnd={() => {}}
          onShowProperties={() => setShowPropertiesForId(component.id)}
          onNodeClick={() => handleNodeClick(component.id)}
          isEditingConnection={!!editingConnectionId && !!editingEnd}
          onInputPortClick={inputName => handleInputPortClick(component.id, inputName)}
          onOutputPortClick={outputName => handleOutputPortClick(component.id, outputName)}
        />
      ))}
      {/* Empty State */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-12 max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Start Building Your Strategy</h3>
            <p className="text-slate-500 mb-6">
              Drag components from the sidebar or click them to add to your canvas. 
              Connect them to show relationships and build your visual strategy.
            </p>
            <div className="text-sm text-slate-400">
              💡 Use drag and drop to position components anywhere on the canvas
            </div>
          </div>
        </div>
      )}
      {/* Drag Overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-50/50 border-2 border-dashed border-blue-300 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
            <p className="text-blue-600 font-medium">Drop component here</p>
          </div>
        </div>
      )}
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '6px 16px',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={undo} title="Undo (Ctrl+Z)" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>
            <Undo2 size={16} /> Undo
          </button>
          <button onClick={redo} title="Redo (Ctrl+Y)" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>
            <Redo2 size={16} /> Redo
          </button>
        </div>
        <div style={{ width: 1, height: 24, background: '#e5e7eb', margin: '0 8px' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} title="Save to localStorage (Ctrl+S)" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>
            <Save size={16} /> Save
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, background: '#f3f4f6', cursor: 'pointer' }} title="Load from file">
            <Upload size={16} /> Load
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleLoad} />
          </label>
        </div>
      </div>
      {/* Validation errors summary */}
      {errorList.length > 0 && (
        <div style={{ position: 'absolute', top: 56, left: 8, zIndex: 10, background: '#fee', color: '#900', padding: 8, borderRadius: 4, maxWidth: 320 }}>
          <b>Validation Errors:</b>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {errorList.map(({ id, error }, i) => (
              <li key={id + i}>{id}: {error}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-slate-300 rounded shadow-lg z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={closeContextMenu}
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-slate-100" onClick={() => { selectComponent(contextMenu.nodeId); setContextMenu(null); }}>
            Edit Properties
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600" onClick={() => { removeComponent(contextMenu.nodeId); setContextMenu(null); }}>
            Delete Node
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-slate-100" onClick={() => { const node = components.find(c => c.id === contextMenu.nodeId); if (node) duplicateComponent(node); setContextMenu(null); }}>
            Duplicate Node
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-slate-100" onClick={() => { bringToFront(contextMenu.nodeId); setContextMenu(null); }}>
            Bring to Front
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-slate-100" onClick={() => { sendToBack(contextMenu.nodeId); setContextMenu(null); }}>
            Send to Back
          </button>
        </div>
      )}
      {/* Properties Panel */}
      {showPropertiesForId && (
        <ComponentProperties
          component={components.find(c => c.id === showPropertiesForId)!}
          isOpen={!!showPropertiesForId}
          onClose={() => setShowPropertiesForId(null)}
        />
      )}
    </div>
  );
}

export default StrategyCanvas;

