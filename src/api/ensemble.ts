/**
 * 🎲 Ensemble Weather API Server Functions
 * Get probabilistic weather forecasts from multiple ensemble members
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import {
  API_ENDPOINTS,
  DEFAULT_TEMPERATURE_UNIT,
  DEFAULT_TIMEZONE,
} from './config'
import { coordinatesSchema, ensembleSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch ensemble weather forecast data
 *
 * @example
 * ```ts
 * const ensemble = await getEnsembleForecast({
 *   data: {
 *     latitude: 52.52,
 *     longitude: 13.41,
 *     models: 'icon_seamless',
 *     hourly: ['temperature_2m', 'precipitation'],
 *   }
 * })
 * ```
 */
export const getEnsembleForecast = createServerFn({ method: 'GET' })
  .inputValidator(ensembleSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.ensemble, {
      latitude: data.latitude,
      longitude: data.longitude,
      models: data.models,
      hourly: data.hourly,
      daily: data.daily,
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timeformat: data.timeformat,
      timezone: data.timezone ?? DEFAULT_TIMEZONE,
      past_days: data.past_days,
      forecast_days: data.forecast_days,
      start_date: data.start_date,
      end_date: data.end_date,
      cell_selection: data.cell_selection,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for precipitation probability
 */
const precipitationProbabilitySchema = coordinatesSchema.extend({
  /** Number of forecast days */
  forecast_days: z.number().int().min(1).max(16).default(7),
  temperature_unit: z.enum(['celsius', 'fahrenheit']).optional(),
})

/**
 * Get precipitation probability from ensemble
 * Useful for rain chance predictions
 *
 * @example
 * ```ts
 * const rainChance = await getPrecipitationProbability({
 *   data: { latitude: 40.7128, longitude: -74.006, forecast_days: 7 }
 * })
 * ```
 */
export const getPrecipitationProbability = createServerFn({ method: 'GET' })
  .inputValidator(precipitationProbabilitySchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.ensemble, {
      latitude: data.latitude,
      longitude: data.longitude,
      models: 'icon_seamless',
      hourly: ['precipitation', 'temperature_2m'],
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      timezone: DEFAULT_TIMEZONE,
      forecast_days: data.forecast_days,
    })

    return fetchFromApi<WeatherResponse>(url)
  })
