/**
 * 🌫️ Air Quality API Server Functions
 * Get air quality forecasts and pollution data
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import { API_ENDPOINTS, DEFAULT_TIMEZONE } from './config'
import { airQualitySchema, coordinatesSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch air quality data for a location
 *
 * @example
 * ```ts
 * const airQuality = await getAirQuality({
 *   data: {
 *     latitude: 52.52,
 *     longitude: 13.41,
 *     hourly: ['pm10', 'pm2_5', 'european_aqi', 'us_aqi'],
 *   }
 * })
 * ```
 */
export const getAirQuality = createServerFn({ method: 'GET' })
  .inputValidator(airQualitySchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.airQuality, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: data.hourly,
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
 * Schema for current air quality
 */
const currentAirQualitySchema = coordinatesSchema

/**
 * Get current air quality with all major indices
 * Simplified function for current AQI
 *
 * @example
 * ```ts
 * const current = await getCurrentAirQuality({
 *   data: { latitude: 40.7128, longitude: -74.006 }
 * })
 * ```
 */
export const getCurrentAirQuality = createServerFn({ method: 'GET' })
  .inputValidator(currentAirQualitySchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.airQuality, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: [
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'uv_index',
        'european_aqi',
        'us_aqi',
      ],
      timezone: DEFAULT_TIMEZONE,
      forecast_days: 1,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for pollen forecast
 */
const pollenForecastSchema = coordinatesSchema.extend({
  /** Number of forecast days (max 7) */
  forecast_days: z.number().int().min(1).max(7).default(5),
})

/**
 * Get pollen forecast
 * Useful for allergy sufferers
 *
 * @example
 * ```ts
 * const pollen = await getPollenForecast({
 *   data: { latitude: 51.5074, longitude: -0.1278, forecast_days: 5 }
 * })
 * ```
 */
export const getPollenForecast = createServerFn({ method: 'GET' })
  .inputValidator(pollenForecastSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.airQuality, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: [
        'alder_pollen',
        'birch_pollen',
        'grass_pollen',
        'mugwort_pollen',
        'olive_pollen',
        'ragweed_pollen',
      ],
      timezone: DEFAULT_TIMEZONE,
      forecast_days: data.forecast_days,
    })

    return fetchFromApi<WeatherResponse>(url)
  })
