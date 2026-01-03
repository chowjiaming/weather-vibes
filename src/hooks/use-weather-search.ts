/**
 * 🔍 Weather Search Hook
 * Manages URL search params state for weather exploration
 */

import { useCallback, useMemo } from 'react'
import type { ExploreSearchParams, WeatherVariable } from '@/lib/search-params'
import { serializeSearchParams } from '@/lib/search-params'

/**
 * 🔍 Hook to manage explore page search state
 * Returns helpers for working with URL search params
 */
export function useExploreSearch(
  currentSearch: Partial<ExploreSearchParams>,
  navigateFn: (options: {
    search: Record<string, string>
    replace?: boolean
  }) => void,
) {
  /**
   * 🔄 Update search params while preserving existing ones
   */
  const updateSearch = useCallback(
    (updates: Partial<ExploreSearchParams>) => {
      const merged = { ...currentSearch, ...updates }
      navigateFn({
        search: serializeSearchParams(merged as Record<string, unknown>),
        replace: true,
      })
    },
    [currentSearch, navigateFn],
  )

  /**
   * 📍 Set location coordinates
   */
  const setLocation = useCallback(
    (lat: number, lon: number, query?: string) => {
      updateSearch({
        lat,
        lon,
        q: query,
      })
    },
    [updateSearch],
  )

  /**
   * 📅 Set date range
   */
  const setDateRange = useCallback(
    (start: string, end: string) => {
      updateSearch({ start, end })
    },
    [updateSearch],
  )

  /**
   * 📊 Set weather variables
   */
  const setVariables = useCallback(
    (vars: WeatherVariable[]) => {
      updateSearch({ vars })
    },
    [updateSearch],
  )

  /**
   * 📈 Set chart type
   */
  const setChartType = useCallback(
    (chart: ExploreSearchParams['chart']) => {
      updateSearch({ chart })
    },
    [updateSearch],
  )

  /**
   * 🔢 Set comparison years
   */
  const setYears = useCallback(
    (years: number[]) => {
      updateSearch({ years })
    },
    [updateSearch],
  )

  /**
   * 📊 Toggle overlay mode
   */
  const toggleOverlay = useCallback(() => {
    updateSearch({ overlay: !currentSearch.overlay })
  }, [currentSearch.overlay, updateSearch])

  /**
   * 🔄 Reset all filters
   */
  const resetFilters = useCallback(() => {
    navigateFn({
      search: {},
      replace: true,
    })
  }, [navigateFn])

  /**
   * 📋 Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      currentSearch.q ||
      currentSearch.lat ||
      currentSearch.lon ||
      currentSearch.start ||
      currentSearch.end ||
      (currentSearch.vars && currentSearch.vars.length > 0) ||
      (currentSearch.years && currentSearch.years.length > 0)
    )
  }, [currentSearch])

  /**
   * 🔗 Get shareable URL for current state
   */
  const getShareableUrl = useCallback(() => {
    const params = serializeSearchParams(
      currentSearch as Record<string, unknown>,
    )
    const searchString = new URLSearchParams(params).toString()
    return `${window.location.origin}/explore${searchString ? `?${searchString}` : ''}`
  }, [currentSearch])

  return {
    // 📦 Current search state
    search: currentSearch,

    // 🔧 Update functions
    updateSearch,
    setLocation,
    setDateRange,
    setVariables,
    setChartType,
    setYears,
    toggleOverlay,
    resetFilters,

    // 📊 Computed values
    hasActiveFilters,
    getShareableUrl,
  }
}

/**
 * 🏙️ Hook to manage city detail page search state
 */
export function useCitySearch(
  currentSearch: Record<string, unknown>,
  navigateFn: (options: {
    search: Record<string, string>
    replace?: boolean
  }) => void,
) {
  const updateSearch = useCallback(
    (updates: Record<string, unknown>) => {
      const merged = { ...currentSearch, ...updates }
      navigateFn({
        search: serializeSearchParams(merged),
        replace: true,
      })
    },
    [currentSearch, navigateFn],
  )

  return {
    search: currentSearch,
    updateSearch,
  }
}

/**
 * 🔄 Hook to manage compare page search state
 */
export function useCompareSearch(
  currentSearch: {
    locations?: string[]
    years?: number[]
    [key: string]: unknown
  },
  navigateFn: (options: {
    search: Record<string, string>
    replace?: boolean
  }) => void,
) {
  const updateSearch = useCallback(
    (updates: Record<string, unknown>) => {
      const merged = { ...currentSearch, ...updates }
      navigateFn({
        search: serializeSearchParams(merged),
        replace: true,
      })
    },
    [currentSearch, navigateFn],
  )

  /**
   * ➕ Add a location to compare
   */
  const addLocation = useCallback(
    (slug: string) => {
      const current = currentSearch.locations || []
      if (!current.includes(slug)) {
        updateSearch({ locations: [...current, slug] })
      }
    },
    [currentSearch.locations, updateSearch],
  )

  /**
   * ➖ Remove a location from comparison
   */
  const removeLocation = useCallback(
    (slug: string) => {
      const current = currentSearch.locations || []
      updateSearch({ locations: current.filter((l) => l !== slug) })
    },
    [currentSearch.locations, updateSearch],
  )

  /**
   * 🔢 Toggle a year for comparison
   */
  const toggleYear = useCallback(
    (year: number) => {
      const current = currentSearch.years || []
      if (current.includes(year)) {
        updateSearch({ years: current.filter((y) => y !== year) })
      } else {
        updateSearch({ years: [...current, year].sort((a, b) => a - b) })
      }
    },
    [currentSearch.years, updateSearch],
  )

  return {
    search: currentSearch,
    updateSearch,
    addLocation,
    removeLocation,
    toggleYear,
  }
}
