import { create } from "zustand"
import type { Strategy, StrategyComponent, StrategyConnection } from "@/types/strategy"
import { api } from '@/lib/api'
import { v4 as uuidv4 } from 'uuid'

interface StrategyStore {
  strategy: Strategy
  selectedComponentId: string | null
  history: Strategy[]
  future: Strategy[]
  validationErrors: Record<string, string[]>
  addComponent: (component: StrategyComponent) => void
  removeComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<StrategyComponent>) => void
  addConnection: (connection: StrategyConnection) => void
  removeConnection: (connectionId: string) => void
  clearStrategy: () => void
  setComponentPosition: (componentId: string, position: { x: number; y: number }) => void
  selectComponent: (componentId: string | null) => void
  undo: () => void
  redo: () => void
  validateStrategy: () => void
  setStrategy: (strategy: Strategy) => void
  saveStrategy: () => Promise<void>
  loadStrategy: (strategyId?: string) => Promise<void>
  autosave: () => void
}

const initialStrategy: Strategy = {
  id: uuidv4(),
  name: "New Strategy",
  components: [],
  connections: [],
  isValid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function deepCloneStrategy(strategy: Strategy): Strategy {
  return JSON.parse(JSON.stringify(strategy));
}

// Helper to build backend-compatible payload
function buildBackendStrategyPayload(strategy: Strategy) {
  return {
    name: strategy.name,
    data: {
      id: strategy.id,
      isValid: strategy.isValid,
      createdAt: strategy.createdAt,
      updatedAt: strategy.updatedAt,
      // Add any other frontend-specific fields here
    },
    indicators: [], // TODO: Populate from components if needed
    entry: {},      // TODO: Populate from components if needed
    exit: {},       // TODO: Populate from components if needed
    order_type: "market", // TODO: Set from UI or default
    market_type: "spot",  // TODO: Set from UI or default
    allocation: 1.0,       // TODO: Set from UI or default
    slippage: 0.0,         // TODO: Set from UI or default
    fee: 0.0,              // TODO: Set from UI or default
    stop_loss: null,       // TODO: Set from UI or default
    take_profit: null,     // TODO: Set from UI or default
    components: { nodes: strategy.components },
    connections: { edges: strategy.connections },
  };
}

// Helper to convert backend payload to frontend Strategy type
function buildFrontendStrategyFromBackend(backend: any): Strategy {
  return {
    id: backend.data?.id || '',
    name: backend.name || '',
    components: backend.components?.nodes || [],
    connections: backend.connections?.edges || [],
    isValid: backend.data?.isValid ?? false,
    createdAt: backend.data?.createdAt ? new Date(backend.data.createdAt) : new Date(),
    updatedAt: backend.data?.updatedAt ? new Date(backend.data.updatedAt) : new Date(),
  };
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  strategy: initialStrategy,
  selectedComponentId: null,
  history: [],
  future: [],
  validationErrors: {},

  addComponent: (component) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        components: [...state.strategy.components, component],
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
      };
    });
    get().validateStrategy();
  },

  removeComponent: (componentId) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        components: state.strategy.components.filter((c) => c.id !== componentId),
        connections: state.strategy.connections.filter((conn) => conn.from !== componentId && conn.to !== componentId),
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
        selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
      };
    });
    get().validateStrategy();
  },

  updateComponent: (componentId, updates) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        components: state.strategy.components.map((c) => (c.id === componentId ? { ...c, ...updates } : c)),
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
      };
    });
    get().validateStrategy();
  },

  addConnection: (connection) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        connections: [...state.strategy.connections, connection],
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
      };
    });
    get().validateStrategy();
  },

  removeConnection: (connectionId) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        connections: state.strategy.connections.filter((c) => `${c.from}-${c.to}` !== connectionId),
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
      };
    });
    get().validateStrategy();
  },

  clearStrategy: () => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => ({
      strategy: {
        ...initialStrategy,
        id: uuidv4(),
        updatedAt: new Date(),
      },
      history: [...state.history, prev],
      future: [],
      selectedComponentId: null,
    }));
    get().validateStrategy();
  },

  setComponentPosition: (componentId, position) => {
    const prev = deepCloneStrategy(get().strategy);
    set((state) => {
      const next = {
        ...state.strategy,
        components: state.strategy.components.map((c) =>
          c.id === componentId ? { ...c, position } : c
        ),
        updatedAt: new Date(),
      };
      return {
        strategy: next,
        history: [...state.history, prev],
        future: [],
      };
    });
  },

  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId });
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        strategy: prev,
        history: newHistory,
        future: [deepCloneStrategy(state.strategy), ...state.future],
        selectedComponentId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        strategy: next,
        history: [...state.history, deepCloneStrategy(state.strategy)],
        future: newFuture,
        selectedComponentId: null,
      };
    });
  },

  validateStrategy: () => {
    // Placeholder: implement real validation logic as needed
    const { strategy } = get();
    const errors: Record<string, string[]> = {};
    // Example: check for unconnected nodes
    strategy.components.forEach((c) => {
      const connected = strategy.connections.some((conn) => conn.from === c.id || conn.to === c.id);
      if (!connected) {
        errors[c.id] = ["Component is not connected to any other node."];
      }
    });
    set({ validationErrors: errors });
  },

  setStrategy: (strategy) => {
    set({
      strategy: deepCloneStrategy(strategy),
      history: [],
      future: [],
      selectedComponentId: null,
    });
    get().validateStrategy();
  },

  saveStrategy: async () => {
    const { strategy } = get();
    const payload = buildBackendStrategyPayload(strategy);
    try {
      await api.saveStrategy(payload);
    } catch (e) {
      // fallback to localStorage if API fails
      localStorage.setItem("strategy", JSON.stringify(strategy));
    }
  },

  loadStrategy: async (strategyId?: string) => {
    try {
      let strategy;
      if (strategyId) {
        const res = await api.getStrategies();
        const backend = res.data.find((s: any) => s.id === strategyId);
        strategy = backend ? buildFrontendStrategyFromBackend(backend) : undefined;
      } else {
        const res = await api.getStrategies();
        const backend = res.data[0];
        strategy = backend ? buildFrontendStrategyFromBackend(backend) : undefined;
      }
      if (strategy) {
        set({
          strategy: deepCloneStrategy(strategy),
          history: [],
          future: [],
          selectedComponentId: null,
        });
        get().validateStrategy();
      }
    } catch (e) {
      // fallback to localStorage if API fails
      const local = localStorage.getItem("strategy");
      if (local) {
        set({
          strategy: deepCloneStrategy(JSON.parse(local)),
          history: [],
          future: [],
          selectedComponentId: null,
        });
        get().validateStrategy();
      }
    }
  },

  autosave: () => {
    const { strategy } = get();
    localStorage.setItem("strategy", JSON.stringify(strategy));
  },
}))
