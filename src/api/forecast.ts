/**
 * 🌤️ Weather Forecast API Server Functions
 * Get weather forecasts up to 16 days ahead
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi } from './client'
import {
  API_ENDPOINTS,
  DEFAULT_TEMPERATURE_UNIT,
  DEFAULT_TIMEZONE,
} from './config'
import { coordinatesSchema, forecastSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch weather forecast for a location
 *
 * @example
 * ```ts
 * const forecast = await getWeatherForecast({
 *   data: {
 *     latitude: 52.52,
 *     longitude: 13.41,
 *     hourly: ['temperature_2m', 'precipitation'],
 *     daily: ['temperature_2m_max', 'temperature_2m_min'],
 *     forecast_days: 7,
 *   }
 * })
 * ```
 */
export const getWeatherForecast = createServerFn({ method: 'GET' })
  .inputValidator(forecastSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.forecast, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: data.hourly,
      daily: data.daily,
      current: data.current,
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timeformat: data.timeformat,
      timezone: data.timezone ?? DEFAULT_TIMEZONE,
      past_days: data.past_days,
      forecast_days: data.forecast_days,
      start_date: data.start_date,
      end_date: data.end_date,
      models: data.models,
      cell_selection: data.cell_selection,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for current weather request
 */
const currentWeatherSchema = coordinatesSchema.extend({
  temperature_unit: z.enum(['celsius', 'fahrenheit']).optional(),
  wind_speed_unit: z.enum(['kmh', 'ms', 'mph', 'kn']).optional(),
  precipitation_unit: z.enum(['mm', 'inch']).optional(),
})

/**
 * Get current weather conditions
 * Simplified function for just current conditions
 *
 * @example
 * ```ts
 * const current = await getCurrentWeather({
 *   data: { latitude: 40.7128, longitude: -74.006 }
 * })
 * ```
 */
export const getCurrentWeather = createServerFn({ method: 'GET' })
  .inputValidator(currentWeatherSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.forecast, {
      latitude: data.latitude,
      longitude: data.longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ],
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timezone: DEFAULT_TIMEZONE,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for weekly forecast
 */
const weeklyForecastSchema = coordinatesSchema.extend({
  temperature_unit: z.enum(['celsius', 'fahrenheit']).optional(),
  wind_speed_unit: z.enum(['kmh', 'ms', 'mph', 'kn']).optional(),
  precipitation_unit: z.enum(['mm', 'inch']).optional(),
})

/**
 * Get 7-day weather forecast
 * Simplified function for weekly forecast
 *
 * @example
 * ```ts
 * const weekly = await getWeeklyForecast({
 *   data: { latitude: 51.5074, longitude: -0.1278 }
 * })
 * ```
 */
export const getWeeklyForecast = createServerFn({ method: 'GET' })
  .inputValidator(weeklyForecastSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.forecast, {
      latitude: data.latitude,
      longitude: data.longitude,
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'uv_index_max',
      ],
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timezone: DEFAULT_TIMEZONE,
      forecast_days: 7,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for hourly forecast
 */
const hourlyForecastSchema = coordinatesSchema.extend({
  /** Number of hours to forecast (max 384 = 16 days) */
  hours: z.number().int().min(1).max(384).default(48),
  temperature_unit: z.enum(['celsius', 'fahrenheit']).optional(),
  wind_speed_unit: z.enum(['kmh', 'ms', 'mph', 'kn']).optional(),
  precipitation_unit: z.enum(['mm', 'inch']).optional(),
})

/**
 * Get hourly weather forecast
 * Detailed hourly data for the next N hours
 *
 * @example
 * ```ts
 * const hourly = await getHourlyForecast({
 *   data: { latitude: 48.8566, longitude: 2.3522, hours: 24 }
 * })
 * ```
 */
export const getHourlyForecast = createServerFn({ method: 'GET' })
  .inputValidator(hourlyForecastSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const forecastDays = Math.ceil(data.hours / 24)

    const url = buildUrl(API_ENDPOINTS.forecast, {
      latitude: data.latitude,
      longitude: data.longitude,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'precipitation_probability',
        'weather_code',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'is_day',
      ],
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timezone: DEFAULT_TIMEZONE,
      forecast_days: forecastDays,
    })

    return fetchFromApi<WeatherResponse>(url)
  })
