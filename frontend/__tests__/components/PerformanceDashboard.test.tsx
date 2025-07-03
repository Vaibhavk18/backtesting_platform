import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import PerformanceDashboard from "@/components/dashboard/PerformanceDashboard"

// Mock the API hooks
jest.mock("@/hooks/useApi", () => ({
  useStrategies: () => ({
    data: [
      { id: "strategy-1", name: "Test Strategy 1" },
      { id: "strategy-2", name: "Test Strategy 2" },
    ],
    isLoading: false,
  }),
  usePerformanceData: () => ({
    data: {
      totalReturn: "+24.5%",
      sharpeRatio: "1.85",
      maxDrawdown: "-8.3%",
      winRate: "68.4%",
    },
    isLoading: false,
    refetch: jest.fn(),
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe("PerformanceDashboard", () => {
  it("renders performance metrics", async () => {
    render(
      <TestWrapper>
        <PerformanceDashboard />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByText("Total Return")).toBeInTheDocument()
      expect(screen.getByText("Sharpe Ratio")).toBeInTheDocument()
      expect(screen.getByText("Max Drawdown")).toBeInTheDocument()
      expect(screen.getByText("Win Rate")).toBeInTheDocument()
    })
  })

  it("displays performance tabs", () => {
    render(
      <TestWrapper>
        <PerformanceDashboard />
      </TestWrapper>,
    )

    expect(screen.getByText("Performance Charts")).toBeInTheDocument()
    expect(screen.getByText("Risk Metrics")).toBeInTheDocument()
    expect(screen.getByText("Trade Analysis")).toBeInTheDocument()
    expect(screen.getByText("Compare")).toBeInTheDocument()
  })
})
