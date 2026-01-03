/**
 * 🌊 Marine Weather API Server Functions
 * Get wave, swell, and ocean current data
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import { API_ENDPOINTS, DEFAULT_TIMEZONE } from './config'
import { coordinatesSchema, marineWeatherSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch marine weather data for a location
 *
 * @example
 * ```ts
 * const marine = await getMarineWeather({
 *   data: {
 *     latitude: 54.32,
 *     longitude: 10.13,
 *     hourly: ['wave_height', 'wave_period', 'wave_direction'],
 *   }
 * })
 * ```
 */
export const getMarineWeather = createServerFn({ method: 'GET' })
  .inputValidator(marineWeatherSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.marine, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: data.hourly,
      daily: data.daily,
      wind_speed_unit: data.wind_speed_unit,
      wave_height_unit: data.wave_height_unit,
      timeformat: data.timeformat,
      timezone: data.timezone ?? DEFAULT_TIMEZONE,
      past_days: data.past_days,
      forecast_days: data.forecast_days,
      start_date: data.start_date,
      end_date: data.end_date,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for surf conditions
 */
const surfConditionsSchema = coordinatesSchema.extend({
  /** Number of forecast days */
  forecast_days: z.number().int().min(1).max(16).default(7),
  wave_height_unit: z.enum(['m', 'ft']).optional(),
})

/**
 * Get surf and wave conditions
 * Optimized for surfers and water sports
 *
 * @example
 * ```ts
 * const surf = await getSurfConditions({
 *   data: { latitude: 33.87, longitude: -118.38, forecast_days: 5 }
 * })
 * ```
 */
export const getSurfConditions = createServerFn({ method: 'GET' })
  .inputValidator(surfConditionsSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.marine, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'wind_wave_height',
        'wind_wave_direction',
        'wind_wave_period',
        'swell_wave_height',
        'swell_wave_direction',
        'swell_wave_period',
      ],
      daily: [
        'wave_height_max',
        'wave_direction_dominant',
        'wave_period_max',
        'swell_wave_height_max',
        'swell_wave_direction_dominant',
      ],
      wave_height_unit: data.wave_height_unit,
      timezone: DEFAULT_TIMEZONE,
      forecast_days: data.forecast_days,
    })

    return fetchFromApi<WeatherResponse>(url)
  })
