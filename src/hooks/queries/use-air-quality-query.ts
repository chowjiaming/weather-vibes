/**
 * 💨 Air Quality Query Hook
 * TanStack Query wrapper for air quality API with caching
 */
import { useQuery } from '@tanstack/react-query'

import { type AirQualityVariable, getAirQuality } from '@/api'
import { airQualityKeys, CACHE_TIMES, GC_TIMES } from '@/lib/query-client'

// ============================================================================
// Air Quality Query
// ============================================================================

/** Current air quality variables commonly used */
const CURRENT_AQ_VARIABLES = [
  'european_aqi',
  'pm2_5',
  'pm10',
  'nitrogen_dioxide',
  'ozone',
] as const

export interface UseAirQualityOptions {
  /** 📍 Latitude coordinate */
  latitude: number
  /** 📍 Longitude coordinate */
  longitude: number
  /** 📊 Hourly variables to fetch */
  hourlyVariables?: AirQualityVariable[]
  /** 📊 Current variables to fetch */
  currentVariables?: (typeof CURRENT_AQ_VARIABLES)[number][]
  /** 🌍 Timezone */
  timezone?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 🌫️ Fetch air quality data with caching
 * Air quality changes frequently but not instantly
 */
export function useAirQuality({
  latitude,
  longitude,
  hourlyVariables,
  currentVariables = [...CURRENT_AQ_VARIABLES],
  timezone = 'auto',
  enabled = true,
}: UseAirQualityOptions) {
  return useQuery({
    queryKey: airQualityKeys.current(latitude, longitude),
    queryFn: () =>
      getAirQuality({
        data: {
          latitude,
          longitude,
          hourly: hourlyVariables,
          current: currentVariables,
          timezone,
        },
      }),
    // 🌡️ Air quality - refresh every 5 minutes
    staleTime: CACHE_TIMES.WEATHER,
    gcTime: GC_TIMES.WEATHER,
    enabled: enabled && !!latitude && !!longitude,
  })
}

// ============================================================================
// Helper: Extract current AQI from response
// ============================================================================

export interface AirQualityData {
  aqi: number
  pm25?: number
  pm10?: number
  no2?: number
  o3?: number
}

/**
 * 🔧 Transform API response into a simplified data shape
 */
export function extractAirQualityData(
  current: Record<string, string | number> | undefined,
): AirQualityData | null {
  if (!current) return null

  return {
    aqi: Number(current.european_aqi ?? 0),
    pm25: current.pm2_5 != null ? Number(current.pm2_5) : undefined,
    pm10: current.pm10 != null ? Number(current.pm10) : undefined,
    no2:
      current.nitrogen_dioxide != null
        ? Number(current.nitrogen_dioxide)
        : undefined,
    o3: current.ozone != null ? Number(current.ozone) : undefined,
  }
}
