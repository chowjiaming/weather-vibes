/**
 * 🌍 Geocoding API Server Functions
 * Search for locations and get coordinates
 */

import { createServerFn } from '@tanstack/react-start'
import { buildUrl, fetchFromApi } from './client'
import { API_ENDPOINTS } from './config'
import { geocodingSearchSchema } from './schemas'
import type { GeocodingResponse, GeocodingResult } from './types'

/**
 * Search for locations by name
 *
 * @example
 * ```ts
 * const results = await searchLocations({ data: { name: 'Berlin' } })
 * // Returns array of matching locations with coordinates
 * ```
 */
export const searchLocations = createServerFn({ method: 'GET' })
  .inputValidator(geocodingSearchSchema)
  .handler(async ({ data }): Promise<GeocodingResult[]> => {
    const url = buildUrl(API_ENDPOINTS.geocoding, {
      name: data.name,
      count: data.count,
      language: data.language,
      format: 'json',
    })

    const response = await fetchFromApi<GeocodingResponse>(url)
    return response.results ?? []
  })

/**
 * Search for a single location (returns first match)
 *
 * @example
 * ```ts
 * const location = await searchLocation({ data: { name: 'New York' } })
 * // Returns the best matching location or null
 * ```
 */
export const searchLocation = createServerFn({ method: 'GET' })
  .inputValidator(geocodingSearchSchema)
  .handler(async ({ data }): Promise<GeocodingResult | null> => {
    const url = buildUrl(API_ENDPOINTS.geocoding, {
      name: data.name,
      count: 1,
      language: data.language,
      format: 'json',
    })

    const response = await fetchFromApi<GeocodingResponse>(url)
    return response.results?.[0] ?? null
  })
