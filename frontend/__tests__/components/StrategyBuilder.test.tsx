import type React from "react"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import StrategyBuilder from "@/components/strategy-builder/StrategyBuilder"

// Mock the zustand store
jest.mock("@/stores/strategyStore", () => ({
  useStrategyStore: () => ({
    strategy: {
      id: "test-strategy",
      name: "Test Strategy",
      components: [],
      connections: [],
      isValid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    addComponent: jest.fn(),
    removeComponent: jest.fn(),
    updateComponent: jest.fn(),
    clearStrategy: jest.fn(),
    validateStrategy: jest.fn(),
    saveStrategy: jest.fn(),
  }),
}))

// Mock the API hooks
jest.mock("@/hooks/useApi", () => ({
  useSaveStrategy: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
  useValidateStrategy: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
  useBacktest: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </QueryClientProvider>
  )
}

describe("StrategyBuilder", () => {
  it("renders strategy builder interface", () => {
    render(
      <TestWrapper>
        <StrategyBuilder />
      </TestWrapper>,
    )

    expect(screen.getByText("Components")).toBeInTheDocument()
    expect(screen.getByText("Strategy Flow")).toBeInTheDocument()
    expect(screen.getByText("Validation & Properties")).toBeInTheDocument()
  })

  it("displays validate, save, and backtest buttons", () => {
    render(
      <TestWrapper>
        <StrategyBuilder />
      </TestWrapper>,
    )

    expect(screen.getByText("Validate")).toBeInTheDocument()
    expect(screen.getByText("Save")).toBeInTheDocument()
    expect(screen.getByText("Backtest")).toBeInTheDocument()
  })

  it("shows drag and drop message when no components", () => {
    render(
      <TestWrapper>
        <StrategyBuilder />
      </TestWrapper>,
    )

    expect(screen.getByText("Drag components here")).toBeInTheDocument()
    expect(screen.getByText("Build your trading strategy by dragging components from the palette")).toBeInTheDocument()
  })
})
