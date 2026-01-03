/**
 * 🌊 Flood API Server Functions
 * Get river discharge and flood forecast data
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import { API_ENDPOINTS } from './config'
import { coordinatesSchema, floodSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch flood/river discharge data for a location
 *
 * @example
 * ```ts
 * const flood = await getFloodData({
 *   data: {
 *     latitude: 59.91,
 *     longitude: 10.75,
 *     daily: ['river_discharge', 'river_discharge_mean'],
 *     forecast_days: 92,
 *   }
 * })
 * ```
 */
export const getFloodData = createServerFn({ method: 'GET' })
  .inputValidator(floodSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.flood, {
      latitude: data.latitude,
      longitude: data.longitude,
      daily: data.daily,
      timeformat: data.timeformat,
      past_days: data.past_days,
      forecast_days: data.forecast_days,
      start_date: data.start_date,
      end_date: data.end_date,
      ensemble: data.ensemble,
      models: data.models,
      cell_selection: data.cell_selection,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for river discharge query
 */
const riverDischargeSchema = coordinatesSchema.extend({
  /** Number of forecast days (max 210) */
  forecast_days: z.number().int().min(1).max(210).default(92),
  /** Include all ensemble members */
  ensemble: z.boolean().optional(),
})

/**
 * Get river discharge forecast
 * Simplified function for flood monitoring
 *
 * @example
 * ```ts
 * const discharge = await getRiverDischarge({
 *   data: { latitude: 48.85, longitude: 2.35, forecast_days: 30 }
 * })
 * ```
 */
export const getRiverDischarge = createServerFn({ method: 'GET' })
  .inputValidator(riverDischargeSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.flood, {
      latitude: data.latitude,
      longitude: data.longitude,
      daily: [
        'river_discharge',
        'river_discharge_mean',
        'river_discharge_median',
        'river_discharge_max',
        'river_discharge_min',
        'river_discharge_p25',
        'river_discharge_p75',
      ],
      forecast_days: data.forecast_days,
      ensemble: data.ensemble,
      models: 'glofas_v4_seamless',
      cell_selection: 'nearest',
    })

    return fetchFromApi<WeatherResponse>(url)
  })
