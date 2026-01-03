/**
 * 🌍 Geocoding Query Hook
 * TanStack Query wrapper for location search with aggressive caching
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { type GeocodingResult, searchLocations } from '@/api'
import { CACHE_TIMES, GC_TIMES, geocodingKeys } from '@/lib/query-client'

// ============================================================================
// Geocoding Search Query
// ============================================================================

export interface UseGeocodingSearchOptions {
  /** 🔍 Search query string */
  query: string
  /** 📊 Maximum number of results */
  count?: number
  /** 🌐 Language for results */
  language?: string
  /** ⏸️ Disable the query */
  enabled?: boolean
}

/**
 * 📍 Search for locations by name with caching
 * Location data is very stable - cache for 1 hour
 */
export function useGeocodingSearch({
  query,
  count = 10,
  language = 'en',
  enabled = true,
}: UseGeocodingSearchOptions) {
  // ✨ Only search if query is at least 2 characters
  const shouldSearch = enabled && query.length >= 2

  return useQuery({
    queryKey: geocodingKeys.search(query),
    queryFn: async () => {
      const results = await searchLocations({
        data: {
          name: query,
          count,
          language,
        },
      })
      return results
    },
    // 📍 Location data is very stable - cache for 1 hour
    staleTime: CACHE_TIMES.GEOCODING,
    gcTime: GC_TIMES.GEOCODING,
    enabled: shouldSearch,
    // 🔄 Placeholder data while loading new search
    placeholderData: (previousData) => previousData,
  })
}

// ============================================================================
// Prefetch Geocoding
// ============================================================================

/**
 * 🚀 Hook to prefetch geocoding results
 * Useful for autocomplete scenarios where we want to prefetch on focus
 */
export function usePrefetchGeocoding() {
  const queryClient = useQueryClient()

  const prefetchSearch = useCallback(
    (query: string) => {
      if (query.length < 2) return

      queryClient.prefetchQuery({
        queryKey: geocodingKeys.search(query),
        queryFn: () =>
          searchLocations({
            data: {
              name: query,
              count: 10,
              language: 'en',
            },
          }),
        staleTime: CACHE_TIMES.GEOCODING,
      })
    },
    [queryClient],
  )

  return { prefetchSearch }
}

// ============================================================================
// Helper: Format location for display
// ============================================================================

/**
 * 📝 Format a geocoding result for display
 */
export function formatLocationName(result: GeocodingResult): string {
  const parts = [result.name]
  if (result.admin1) parts.push(result.admin1)
  if (result.country) parts.push(result.country)
  return parts.join(', ')
}

/**
 * 🔗 Create a URL-safe slug from location
 */
export function createLocationSlug(result: GeocodingResult): string {
  const parts = [result.name]
  if (result.country) parts.push(result.country)
  if (result.admin1) parts.push(result.admin1)

  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
