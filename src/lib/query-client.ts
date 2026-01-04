/**
 * ⚡ TanStack Query Client Configuration
 * Optimized caching strategy for weather data
 */
import { QueryClient } from '@tanstack/react-query'

/**
 * 📊 Cache time constants (in milliseconds)
 * Weather data changes but not instantly - these values balance freshness with performance
 */
export const CACHE_TIMES = {
  /** 🌡️ Current weather/air quality - relatively fresh */
  WEATHER: 5 * 60 * 1000, // 5 minutes
  /** 📅 Forecast data - changes less frequently */
  FORECAST: 10 * 60 * 1000, // 10 minutes
  /** 📍 Location/geocoding data - very stable */
  GEOCODING: 60 * 60 * 1000, // 1 hour
  /** 📚 Historical data - never changes */
  HISTORICAL: 24 * 60 * 60 * 1000, // 24 hours
  /** 🌊 Marine/flood data - moderate freshness */
  MARINE: 15 * 60 * 1000, // 15 minutes
} as const

/**
 * 🗑️ Garbage collection times (when to remove from cache entirely)
 */
export const GC_TIMES = {
  WEATHER: 30 * 60 * 1000, // 30 minutes
  FORECAST: 60 * 60 * 1000, // 1 hour
  GEOCODING: 24 * 60 * 60 * 1000, // 24 hours
  HISTORICAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  MARINE: 60 * 60 * 1000, // 1 hour
} as const

/**
 * 🏭 Create a new QueryClient instance with optimized defaults
 * Call this function once and share the instance across the app
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // ⏱️ Default stale time - consider data fresh for 5 minutes
        staleTime: CACHE_TIMES.WEATHER,
        // 🗑️ Garbage collection time - keep in cache for 30 minutes
        gcTime: GC_TIMES.WEATHER,
        // 🔄 Retry failed requests twice before giving up
        retry: 2,
        // 🎯 Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 🖥️ Don't refetch on window focus (weather data doesn't change that fast)
        refetchOnWindowFocus: false,
        // 📡 Refetch when reconnecting (user might have been offline)
        refetchOnReconnect: true,
        // 🔌 Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
    },
  })
}

// 🌍 Query key factories for consistent key generation
export const weatherKeys = {
  all: ['weather'] as const,
  historical: (
    lat: number,
    lon: number,
    startDate?: string,
    endDate?: string,
    opts?: {
      daily?: readonly string[]
      hourly?: readonly string[]
      timezone?: string
      models?: unknown
    },
  ) =>
    [
      ...weatherKeys.all,
      'historical',
      {
        lat,
        lon,
        startDate,
        endDate,
        daily: opts?.daily,
        hourly: opts?.hourly,
        timezone: opts?.timezone,
        models: opts?.models,
      },
    ] as const,
  forecast: (
    lat: number,
    lon: number,
    opts?: {
      forecastDays?: number
      startDate?: string
      endDate?: string
      daily?: readonly string[]
      hourly?: readonly string[]
      current?: readonly string[]
      timezone?: string
      pastDays?: number
      models?: unknown
    },
  ) =>
    [
      ...weatherKeys.all,
      'forecast',
      {
        lat,
        lon,
        forecastDays: opts?.forecastDays,
        startDate: opts?.startDate,
        endDate: opts?.endDate,
        daily: opts?.daily,
        hourly: opts?.hourly,
        current: opts?.current,
        timezone: opts?.timezone,
        pastDays: opts?.pastDays,
        models: opts?.models,
      },
    ] as const,
  current: (lat: number, lon: number) =>
    [...weatherKeys.all, 'current', { lat, lon }] as const,
}

export const airQualityKeys = {
  all: ['airQuality'] as const,
  current: (lat: number, lon: number) =>
    [...airQualityKeys.all, 'current', { lat, lon }] as const,
}

export const marineKeys = {
  all: ['marine'] as const,
  current: (lat: number, lon: number) =>
    [...marineKeys.all, 'current', { lat, lon }] as const,
}

export const floodKeys = {
  all: ['flood'] as const,
  current: (lat: number, lon: number) =>
    [...floodKeys.all, 'current', { lat, lon }] as const,
}

export const geocodingKeys = {
  all: ['geocoding'] as const,
  search: (query: string) => [...geocodingKeys.all, 'search', query] as const,
}
