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
 * Schema for year-over-year comparison (full year)
 */
const yearOverYearSchema = coordinatesSchema.extend({
  /** Years to compare */
  years: z.array(z.number().int().min(1940)),
  /** Variable to compare */
  variable: z.string().optional(),
  /** Start month-day (MM-DD format), optional - defaults to full year */
  startMonthDay: z
    .string()
    .regex(/^\d{2}-\d{2}$/)
    .optional(),
  /** End month-day (MM-DD format), optional - defaults to full year */
  endMonthDay: z
    .string()
    .regex(/^\d{2}-\d{2}$/)
    .optional(),
})

/**
 * 📊 Year comparison data point
 */
interface YearComparisonDataPoint {
  dayOfYear: number
  value: number | null
}

/**
 * 📊 Year comparison result
 */
interface YearComparisonResult {
  year: number
  data: YearComparisonDataPoint[]
}

/**
 * Compare weather patterns for a full year across multiple years
 * Useful for climate trend analysis
 *
 * @example
 * ```ts
 * const comparison = await getYearOverYearComparison({
 *   data: {
 *     latitude: 48.8566,
 *     longitude: 2.3522,
 *     years: [2022, 2023, 2024],
 *     variable: 'temperature_2m_mean',
 *   }
 * })
 * ```
 */
export const getYearOverYearComparison = createServerFn({ method: 'GET' })
  .inputValidator(yearOverYearSchema)
  .handler(async ({ data }): Promise<YearComparisonResult[]> => {
    const variable = data.variable || 'temperature_2m_mean'
    const startMonth = data.startMonthDay || '01-01'
    const endMonth = data.endMonthDay || '12-31'

    const results = await Promise.all(
      data.years.map(async (year) => {
        const currentYear = new Date().getFullYear()
        // 📅 Adjust end date if current year and future date
        let endDate = `${year}-${endMonth}`
        if (year === currentYear) {
          const today = new Date()
          today.setDate(today.getDate() - 5) // Account for data delay
          const todayStr = formatDate(today)
          if (endDate > todayStr) {
            endDate = todayStr
          }
        }

        const url = buildUrl(API_ENDPOINTS.historical, {
          latitude: data.latitude,
          longitude: data.longitude,
          start_date: `${year}-${startMonth}`,
          end_date: endDate,
          daily: [variable],
          timezone: DEFAULT_TIMEZONE,
        })

        const weather = await fetchFromApi<WeatherResponse>(url)

        // 📊 Transform to day-of-year format
        const dailyData: YearComparisonDataPoint[] = []
        if (weather.daily?.time) {
          const times = weather.daily.time as string[]
          const values = (weather.daily as Record<string, unknown>)[
            variable
          ] as (number | null)[]

          for (let i = 0; i < times.length; i++) {
            const date = new Date(times[i])
            const startOfYear = new Date(date.getFullYear(), 0, 0)
            const diff = date.getTime() - startOfYear.getTime()
            const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

            dailyData.push({
              dayOfYear,
              value: values?.[i] ?? null,
            })
          }
        }

        return { year, data: dailyData }
      }),
    )

    return results
  })
