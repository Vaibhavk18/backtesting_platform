"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategyBuilder } from "@/components/strategy-builder/StrategyBuilder"
import PerformanceDashboard from "@/components/dashboard/PerformanceDashboard"
import DataVisualization from "@/components/visualization/DataVisualization"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export default function Home() {
  const [activeTab, setActiveTab] = useState("builder")

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Trading Strategy Platform</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
              <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
              <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="mt-6">
              <StrategyBuilder />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <PerformanceDashboard />
            </TabsContent>

            <TabsContent value="visualization" className="mt-6">
              <DataVisualization />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
