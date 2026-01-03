/**
 * 🌡️ Weather Query Hooks
 * TanStack Query wrappers for weather API calls with optimized caching
 */
import { useQuery } from '@tanstack/react-query'

import {
  getHistoricalWeather,
  getWeatherForecast,
  type HistoricalDailyWeatherVariable,
} from '@/api'
import { CACHE_TIMES, GC_TIMES, weatherKeys } from '@/lib/query-client'

// ============================================================================
// Historical Weather Query
// ============================================================================

export interface UseHistoricalWeatherOptions {
  /** 📍 Latitude coordinate */
  latitude: number
  /** 📍 Longitude coordinate */
  longitude: number
  /** 📅 Start date (YYYY-MM-DD) */
  startDate: string
  /** 📅 End date (YYYY-MM-DD) */
  endDate: string
  /** 📊 Daily variables to fetch */
  variables?: HistoricalDailyWeatherVariable[]
  /** 🌍 Timezone */
  timezone?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 📚 Fetch historical weather data with caching
 * Historical data never changes, so we cache it aggressively
 */
export function useHistoricalWeather({
  latitude,
  longitude,
  startDate,
  endDate,
  variables = ['temperature_2m_mean', 'precipitation_sum'],
  timezone = 'auto',
  enabled = true,
}: UseHistoricalWeatherOptions) {
  return useQuery({
    queryKey: weatherKeys.historical(latitude, longitude, startDate, endDate),
    queryFn: () =>
      getHistoricalWeather({
        data: {
          latitude,
          longitude,
          start_date: startDate,
          end_date: endDate,
          daily: variables,
          timezone,
        },
      }),
    // 📚 Historical data is immutable - cache for 24 hours
    staleTime: CACHE_TIMES.HISTORICAL,
    gcTime: GC_TIMES.HISTORICAL,
    enabled: enabled && !!latitude && !!longitude && !!startDate && !!endDate,
  })
}

// ============================================================================
// Weather Forecast Query
// ============================================================================

export interface UseForecastOptions {
  /** 📍 Latitude coordinate */
  latitude: number
  /** 📍 Longitude coordinate */
  longitude: number
  /** 📆 Number of forecast days (1-16) */
  forecastDays?: number
  /** 🌍 Timezone */
  timezone?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 🔮 Fetch weather forecast with moderate caching
 * Forecast updates throughout the day but not constantly
 */
export function useForecast({
  latitude,
  longitude,
  forecastDays = 7,
  timezone = 'auto',
  enabled = true,
}: UseForecastOptions) {
  return useQuery({
    queryKey: weatherKeys.forecast(latitude, longitude),
    queryFn: () =>
      getWeatherForecast({
        data: {
          latitude,
          longitude,
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'wind_speed_10m_max',
            'sunrise',
            'sunset',
          ],
          forecast_days: forecastDays,
          timezone,
        },
      }),
    // 🔄 Forecast data - refresh every 10 minutes
    staleTime: CACHE_TIMES.FORECAST,
    gcTime: GC_TIMES.FORECAST,
    enabled: enabled && !!latitude && !!longitude,
  })
}

// ============================================================================
// Prefetch Helpers
// ============================================================================

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * 🚀 Hook to prefetch weather data on hover/focus
 * Improves perceived performance by loading data before user clicks
 */
export function usePrefetchWeather() {
  const queryClient = useQueryClient()

  const prefetchForecast = useCallback(
    (latitude: number, longitude: number) => {
      queryClient.prefetchQuery({
        queryKey: weatherKeys.forecast(latitude, longitude),
        queryFn: () =>
          getWeatherForecast({
            data: {
              latitude,
              longitude,
              daily: [
                'weather_code',
                'temperature_2m_max',
                'temperature_2m_min',
                'precipitation_sum',
              ],
              forecast_days: 7,
              timezone: 'auto',
            },
          }),
        staleTime: CACHE_TIMES.FORECAST,
      })
    },
    [queryClient],
  )

  const prefetchHistorical = useCallback(
    (
      latitude: number,
      longitude: number,
      startDate: string,
      endDate: string,
    ) => {
      queryClient.prefetchQuery({
        queryKey: weatherKeys.historical(
          latitude,
          longitude,
          startDate,
          endDate,
        ),
        queryFn: () =>
          getHistoricalWeather({
            data: {
              latitude,
              longitude,
              start_date: startDate,
              end_date: endDate,
              daily: ['temperature_2m_mean', 'precipitation_sum'],
              timezone: 'auto',
            },
          }),
        staleTime: CACHE_TIMES.HISTORICAL,
      })
    },
    [queryClient],
  )

  return { prefetchForecast, prefetchHistorical }
}
