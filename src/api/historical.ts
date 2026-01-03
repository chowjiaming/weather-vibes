/**
 * 📜 Historical Weather API Server Functions
 * Access weather data from 1940 to present
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { buildUrl, fetchFromApi, formatDate, getDaysAgo } from './client'
import {
  API_ENDPOINTS,
  DEFAULT_TEMPERATURE_UNIT,
  DEFAULT_TIMEZONE,
} from './config'
import { coordinatesSchema, historicalWeatherSchema } from './schemas'
import type { WeatherResponse } from './types'

/**
 * Fetch historical weather data for a location
 *
 * @example
 * ```ts
 * const weather = await getHistoricalWeather({
 *   data: {
 *     latitude: 52.52,
 *     longitude: 13.41,
 *     start_date: '2024-01-01',
 *     end_date: '2024-01-31',
 *     hourly: ['temperature_2m', 'precipitation'],
 *   }
 * })
 * ```
 */
export const getHistoricalWeather = createServerFn({ method: 'GET' })
  .inputValidator(historicalWeatherSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const url = buildUrl(API_ENDPOINTS.historical, {
      latitude: data.latitude,
      longitude: data.longitude,
      start_date: data.start_date,
      end_date: data.end_date,
      hourly: data.hourly,
      daily: data.daily,
      temperature_unit: data.temperature_unit ?? DEFAULT_TEMPERATURE_UNIT,
      wind_speed_unit: data.wind_speed_unit,
      precipitation_unit: data.precipitation_unit,
      timeformat: data.timeformat,
      timezone: data.timezone ?? DEFAULT_TIMEZONE,
      models: data.models,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for comparing weather across years
 */
const historicalComparisonSchema = coordinatesSchema.extend({
  /** Month and day to compare (MM-DD format) */
  monthDay: z.string().regex(/^\d{2}-\d{2}$/, {
    message: 'Month/day must be in MM-DD format',
  }),
  /** Years to compare */
  years: z.array(z.number().int().min(1940).max(new Date().getFullYear())),
  /** Variables to fetch */
  daily: z.array(z.string()).optional(),
})

/**
 * Compare weather on the same date across multiple years
 * Useful for historical pattern analysis
 *
 * @example
 * ```ts
 * const comparison = await compareHistoricalDates({
 *   data: {
 *     latitude: 40.7128,
 *     longitude: -74.006,
 *     monthDay: '07-04',
 *     years: [2020, 2021, 2022, 2023, 2024],
 *     daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
 *   }
 * })
 * ```
 */
export const compareHistoricalDates = createServerFn({ method: 'GET' })
  .inputValidator(historicalComparisonSchema)
  .handler(
    async ({ data }): Promise<{ year: number; weather: WeatherResponse }[]> => {
      const results = await Promise.all(
        data.years.map(async (year) => {
          const date = `${year}-${data.monthDay}`
          const url = buildUrl(API_ENDPOINTS.historical, {
            latitude: data.latitude,
            longitude: data.longitude,
            start_date: date,
            end_date: date,
            daily: data.daily ?? [
              'temperature_2m_max',
              'temperature_2m_min',
              'precipitation_sum',
              'weather_code',
            ],
            timezone: DEFAULT_TIMEZONE,
          })

          const weather = await fetchFromApi<WeatherResponse>(url)
          return { year, weather }
        }),
      )

      return results
    },
  )

/**
 * Schema for historical range query
 */
const historicalRangeSchema = coordinatesSchema.extend({
  /** Number of days to look back */
  days: z.number().int().min(1).max(365).default(30),
  /** Variables to fetch */
  daily: z.array(z.string()).optional(),
  hourly: z.array(z.string()).optional(),
})

/**
 * Get historical weather for the past N days
 * Convenience function for recent historical data
 *
 * @example
 * ```ts
 * const pastMonth = await getRecentHistoricalWeather({
 *   data: {
 *     latitude: 51.5074,
 *     longitude: -0.1278,
 *     days: 30,
 *     daily: ['temperature_2m_max', 'precipitation_sum'],
 *   }
 * })
 * ```
 */
export const getRecentHistoricalWeather = createServerFn({ method: 'GET' })
  .inputValidator(historicalRangeSchema)
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const endDate = formatDate(new Date())
    const startDate = getDaysAgo(data.days)

    const url = buildUrl(API_ENDPOINTS.historical, {
      latitude: data.latitude,
      longitude: data.longitude,
      start_date: startDate,
      end_date: endDate,
      daily: data.daily,
      hourly: data.hourly,
      timezone: DEFAULT_TIMEZONE,
    })

    return fetchFromApi<WeatherResponse>(url)
  })

/**
 * Schema for year-over-year comparison
 */
const yearOverYearSchema = coordinatesSchema.extend({
  /** Start month-day (MM-DD format) */
  startMonthDay: z.string().regex(/^\d{2}-\d{2}$/),
  /** End month-day (MM-DD format) */
  endMonthDay: z.string().regex(/^\d{2}-\d{2}$/),
  /** Years to compare */
  years: z.array(z.number().int().min(1940)),
  /** Daily variables to fetch */
  daily: z.array(z.string()).optional(),
})

/**
 * Compare weather patterns for a date range across multiple years
 * Useful for seasonal pattern analysis
 *
 * @example
 * ```ts
 * const summers = await getYearOverYearComparison({
 *   data: {
 *     latitude: 48.8566,
 *     longitude: 2.3522,
 *     startMonthDay: '06-01',
 *     endMonthDay: '08-31',
 *     years: [2019, 2020, 2021, 2022, 2023],
 *     daily: ['temperature_2m_max', 'precipitation_sum'],
 *   }
 * })
 * ```
 */
export const getYearOverYearComparison = createServerFn({ method: 'GET' })
  .inputValidator(yearOverYearSchema)
  .handler(
    async ({ data }): Promise<{ year: number; weather: WeatherResponse }[]> => {
      const results = await Promise.all(
        data.years.map(async (year) => {
          const startDate = `${year}-${data.startMonthDay}`
          const endDate = `${year}-${data.endMonthDay}`

          const url = buildUrl(API_ENDPOINTS.historical, {
            latitude: data.latitude,
            longitude: data.longitude,
            start_date: startDate,
            end_date: endDate,
            daily: data.daily ?? [
              'temperature_2m_max',
              'temperature_2m_min',
              'precipitation_sum',
              'weather_code',
            ],
            timezone: DEFAULT_TIMEZONE,
          })

          const weather = await fetchFromApi<WeatherResponse>(url)
          return { year, weather }
        }),
      )

      return results
    },
  )
