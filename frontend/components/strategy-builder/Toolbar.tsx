import React from 'react';
import { useStrategyStore } from '@/stores/strategyStore';
import { useState } from 'react';

export function Toolbar() {
  const saveStrategy = useStrategyStore((s) => s.saveStrategy);
  const loadStrategy = useStrategyStore((s) => s.loadStrategy);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveStrategy();
      alert('Strategy saved!');
    } catch (e) {
      alert('Failed to save strategy.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    const id = prompt('Enter strategy ID to load (leave blank for first):');
    setLoading(true);
    try {
      await loadStrategy(id || undefined);
      alert('Strategy loaded!');
    } catch (e) {
      alert('Failed to load strategy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
      <button
        className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50"
        onClick={handleSave}
        disabled={loading}
      >
        Save
      </button>
      <button
        className="px-3 py-1 rounded bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50"
        onClick={handleLoad}
        disabled={loading}
      >
        Load
      </button>
      <span className="text-slate-500 ml-4">Toolbar (undo/redo/save/clear...)</span>
    </div>
  );
} 