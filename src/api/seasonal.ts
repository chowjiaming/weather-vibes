/**
 * 📅 Seasonal Forecast API Server Functions
 * Get long-range weather outlooks up to 7 months ahead
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import {
  API_ENDPOINTS,
  DEFAULT_TEMPERATURE_UNIT,
  DEFAULT_TIMEZONE,
} from './config'
import { coordinatesSchema, seasonalSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch seasonal forecast data
 * Note: ~36km resolution, not bias-corrected
 * Best used for regional trend indication
 *
 * @example
 * ```ts
 * const seasonal = await getSeasonalForecast({
 *   data: {
 *     latitude: 52.52,
 *     longitude: 13.41,
 *     models: 'ecmwf_seasonal_seamless',
 *     daily: ['temperature_2m_max', 'precipitation_sum'],
 *   }
 * })
 * ```
 */
export const getSeasonalForecast = createServerFn({ method: 'GET' })
  .inputValidator(seasonalSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.seasonal, {
      latitude: data.latitude,
      longitude: data.longitude,
      models: data.models,
      daily: data.daily,
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timeformat: data.timeformat,
      timezone: data.timezone ?? DEFAULT_TIMEZONE,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for seasonal temperature outlook
 */
const seasonalOutlookSchema = coordinatesSchema.extend({
  temperature_unit: z.enum(['celsius', 'fahrenheit']).optional(),
})

/**
 * Get seasonal temperature and precipitation outlook
 * Simplified function for long-range trends
 *
 * @example
 * ```ts
 * const outlook = await getSeasonalOutlook({
 *   data: { latitude: 51.5074, longitude: -0.1278 }
 * })
 * ```
 */
export const getSeasonalOutlook = createServerFn({ method: 'GET' })
  .inputValidator(seasonalOutlookSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.seasonal, {
      latitude: data.latitude,
      longitude: data.longitude,
      models: 'ecmwf_seasonal_seamless',
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
      ],
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      timezone: DEFAULT_TIMEZONE,
    })

    return fetchFromApi<WeatherResponse>(url)
  })
