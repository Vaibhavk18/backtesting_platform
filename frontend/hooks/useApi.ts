import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

// Custom hooks for API calls
export const useStrategies = () => {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: () => api.getStrategies(),
    select: (response) => response.data,
  })
}

export const useMarketData = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ["marketData", symbol, timeframe],
    queryFn: () => api.getMarketData(symbol, timeframe),
    select: (response) => response.data,
    refetchInterval: 5000, // Refetch every 5 seconds
    enabled: !!symbol && !!timeframe,
  })
}

export const useSymbols = () => {
  return useQuery({
    queryKey: ["symbols"],
    queryFn: () => api.getSymbols(),
    select: (response) => response.data,
  })
}

export const useTimeframes = () => {
  return useQuery({
    queryKey: ["timeframes"],
    queryFn: () => api.getTimeframes(),
    select: (response) => response.data,
  })
}

export const useMarketTypes = () => {
  return useQuery({
    queryKey: ["marketTypes"],
    queryFn: () => api.getMarketTypes(),
    select: (response) => response.data,
  })
}

export const useOKXInstruments = (instType: string = "SPOT") => {
  return useQuery({
    queryKey: ["okxInstruments", instType],
    queryFn: () => api.getOKXInstruments(instType),
    select: (response) => response.data,
    enabled: !!instType,
  })
}

export const useOKXTrades = (instId: string, limit: number = 100) => {
  return useQuery({
    queryKey: ["okxTrades", instId, limit],
    queryFn: () => api.getOKXTrades(instId, limit),
    enabled: !!instId,
  })
}

export const useOKXCandlesticks = (instId: string, bar: string = "1m", limit: number = 100) => {
  return useQuery({
    queryKey: ["okxCandlesticks", instId, bar, limit],
    queryFn: () => api.getOKXCandlesticks(instId, bar, limit),
    enabled: !!instId && !!bar,
  })
}

export const useOKXHistoryCandles = (instId: string, bar: string = "1m", limit: number = 100, after?: string, before?: string) => {
  return useQuery({
    queryKey: ["okxHistoryCandles", instId, bar, limit, after, before],
    queryFn: () => api.getOKXHistoryCandles(instId, bar, limit, after, before),
    select: (response) => response.data,
    enabled: !!instId && !!bar,
  })
}

export const useOKXHistoryTrades = (instId: string, type: string = "1", limit: number = 100, after?: string, before?: string) => {
  return useQuery({
    queryKey: ["okxHistoryTrades", instId, type, limit, after, before],
    queryFn: () => api.getOKXHistoryTrades(instId, type, limit, after, before),
    select: (response) => response.data,
    enabled: !!instId,
  })
}

export const usePerformanceData = (strategyId: string, timeRange: string) => {
  return useQuery({
    queryKey: ["performance", strategyId, timeRange],
    queryFn: () => api.getPerformanceData(strategyId, timeRange),
    select: (response) => response.data,
    enabled: !!strategyId && !!timeRange,
  })
}

export const useSaveStrategy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (strategy: any) => api.saveStrategy(strategy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] })
    },
  })
}

export const useValidateStrategy = () => {
  return useMutation({
    mutationFn: (strategy: any) => api.validateStrategy(strategy),
  })
}

export const useBacktest = () => {
  return useMutation({
    mutationFn: ({ strategy, parameters }: { strategy: any; parameters: any }) => api.runBacktest(strategy, parameters),
  })
}
