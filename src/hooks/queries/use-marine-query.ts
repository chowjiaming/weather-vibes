/**
 * 🌊 Marine & Flood Query Hooks
 * TanStack Query wrappers for marine and flood APIs
 */
import { useQuery } from '@tanstack/react-query'

import {
  getFloodData,
  getMarineWeather,
  type MarineHourlyVariable,
} from '@/api'
import {
  CACHE_TIMES,
  floodKeys,
  GC_TIMES,
  marineKeys,
} from '@/lib/query-client'

// ============================================================================
// Marine Weather Query
// ============================================================================

/** Common marine variables */
const MARINE_VARIABLES: MarineHourlyVariable[] = [
  'wave_height',
  'wave_period',
  'wave_direction',
  'ocean_current_velocity',
  'ocean_current_direction',
]

export interface UseMarineWeatherOptions {
  /** 📍 Latitude coordinate */
  latitude: number
  /** 📍 Longitude coordinate */
  longitude: number
  /** 📊 Hourly variables to fetch */
  variables?: MarineHourlyVariable[]
  /** 🌍 Timezone */
  timezone?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 🌊 Fetch marine weather data with caching
 * Only relevant for coastal locations
 */
export function useMarineWeather({
  latitude,
  longitude,
  variables = MARINE_VARIABLES,
  timezone = 'auto',
  enabled = true,
}: UseMarineWeatherOptions) {
  return useQuery({
    queryKey: marineKeys.current(latitude, longitude),
    queryFn: () =>
      getMarineWeather({
        data: {
          latitude,
          longitude,
          hourly: variables,
          timezone,
        },
      }),
    // 🌊 Marine data - refresh every 15 minutes
    staleTime: CACHE_TIMES.MARINE,
    gcTime: GC_TIMES.MARINE,
    enabled: enabled && !!latitude && !!longitude,
  })
}

// ============================================================================
// Flood Data Query
// ============================================================================

export interface UseFloodDataOptions {
  /** 📍 Latitude coordinate */
  latitude: number
  /** 📍 Longitude coordinate */
  longitude: number
  /** 🌍 Timezone */
  timezone?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 🌊 Fetch flood/river discharge data with caching
 * Only relevant for locations near rivers
 */
export function useFloodData({
  latitude,
  longitude,
  enabled = true,
}: UseFloodDataOptions) {
  return useQuery({
    queryKey: floodKeys.current(latitude, longitude),
    queryFn: () =>
      getFloodData({
        data: {
          latitude,
          longitude,
          daily: [
            'river_discharge',
            'river_discharge_max',
            'river_discharge_mean',
          ],
          forecast_days: 7,
          // Note: timezone is not supported by flood API
        },
      }),
    // 🌊 Flood data - refresh every 15 minutes
    staleTime: CACHE_TIMES.MARINE,
    gcTime: GC_TIMES.MARINE,
    enabled: enabled && !!latitude && !!longitude,
  })
}

// ============================================================================
// Helper: Extract marine data from response
// ============================================================================

export interface MarineData {
  waveHeight?: number
  wavePeriod?: number
  waveDirection?: number
  currentSpeed?: number
  currentDirection?: number
}

/**
 * 🔧 Transform marine API response into a simplified data shape
 */
export function extractMarineData(
  hourly: Record<string, number[] | string[]> | undefined,
): MarineData | null {
  if (!hourly) return null

  const getFirst = (
    arr: number[] | string[] | undefined,
  ): number | undefined => (arr?.[0] != null ? Number(arr[0]) : undefined)

  return {
    waveHeight: getFirst(hourly.wave_height),
    wavePeriod: getFirst(hourly.wave_period),
    waveDirection: getFirst(hourly.wave_direction),
    currentSpeed: getFirst(hourly.ocean_current_velocity),
    currentDirection: getFirst(hourly.ocean_current_direction),
  }
}

// ============================================================================
// Helper: Extract flood data from response
// ============================================================================

export interface FloodData {
  riverDischarge?: number
  riverDischargeMax?: number
  riverDischargeMean?: number
}

/**
 * 🔧 Transform flood API response into a simplified data shape
 */
export function extractFloodData(
  daily: Record<string, number[] | string[]> | undefined,
): FloodData | null {
  if (!daily) return null

  const getFirst = (
    arr: number[] | string[] | undefined,
  ): number | undefined => (arr?.[0] != null ? Number(arr[0]) : undefined)

  return {
    riverDischarge: getFirst(daily.river_discharge),
    riverDischargeMax: getFirst(daily.river_discharge_max),
    riverDischargeMean: getFirst(daily.river_discharge_mean),
  }
}
