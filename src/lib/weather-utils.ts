/**
 * 🌦️ Weather Data Utilities
 * Transformations and helpers for weather data
 */

import {
  differenceInDays,
  eachDayOfInterval,
  format as fnsFormat,
  parseISO,
} from 'date-fns'
import type { WeatherVariable } from './search-params'

/**
 * 📅 Format a date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return fnsFormat(date, 'yyyy-MM-dd')
}

/**
 * 📊 Chart data point type (compatible with Recharts)
 */
export interface ChartDataPoint {
  date: string
  formattedDate?: string
  fullDate?: string
  [key: string]: string | number | null | undefined
}

/**
 * 🏙️ Create a URL-safe slug from city name
 */
export function createCitySlug(
  name: string,
  country?: string,
  admin1?: string,
): string {
  const parts = [name, admin1, country].filter(Boolean)
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 🔍 Parse city slug back to search-friendly name
 */
export function parseCitySlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 📅 Format date for API requests
 */
export function formatApiDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return fnsFormat(d, 'yyyy-MM-dd')
}

/**
 * 📅 Format date for display
 */
export function formatDisplayDate(
  date: Date | string,
  formatStr: string = 'MMM d, yyyy',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return fnsFormat(d, formatStr)
}

/**
 * 📊 Transform API response to chart-friendly format
 */
export function transformWeatherData(
  response: {
    daily?: {
      time: string[]
      [key: string]: (number | null)[] | string[]
    }
  },
  variables: WeatherVariable[],
): ChartDataPoint[] {
  if (!response.daily?.time) return []

  const { time, ...data } = response.daily

  return (time as string[]).map((date, index) => {
    const row: ChartDataPoint = {
      date,
      formattedDate: formatDisplayDate(date, 'MMM d'),
      fullDate: formatDisplayDate(date, 'MMMM d, yyyy'),
    }

    for (const variable of variables) {
      const values = data[variable]
      if (Array.isArray(values)) {
        row[variable] = values[index] as number | null
      }
    }

    return row
  })
}

/**
 * 📊 Group weather data by month for aggregation
 */
export function groupByMonth(
  data: Array<{ date: string; [key: string]: unknown }>,
): Map<string, Array<{ date: string; [key: string]: unknown }>> {
  const groups = new Map<
    string,
    Array<{ date: string; [key: string]: unknown }>
  >()

  for (const row of data) {
    const monthKey = fnsFormat(parseISO(row.date), 'yyyy-MM')
    const existing = groups.get(monthKey) || []
    existing.push(row)
    groups.set(monthKey, existing)
  }

  return groups
}

/**
 * 📊 Calculate monthly averages
 */
export function calculateMonthlyAverages(
  data: Array<{ date: string; [key: string]: unknown }>,
  variables: WeatherVariable[],
): Array<{ month: string; [key: string]: number | string }> {
  const groups = groupByMonth(data)
  const result: Array<{ month: string; [key: string]: number | string }> = []

  for (const [monthKey, rows] of groups) {
    const row: { month: string; [key: string]: number | string } = {
      month: fnsFormat(parseISO(`${monthKey}-01`), 'MMM yyyy'),
    }

    for (const variable of variables) {
      const values = rows
        .map((r) => r[variable])
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

      if (values.length > 0) {
        row[variable] = values.reduce((a, b) => a + b, 0) / values.length
      }
    }

    result.push(row)
  }

  return result
}

/**
 * 🔄 Calculate year-over-year comparison data
 */
export function calculateYearOverYear(
  datasets: Array<{
    year: number
    data: Array<{ date: string; [key: string]: unknown }>
  }>,
  variable: WeatherVariable,
): Array<{ dayOfYear: number; [key: string]: number | null }> {
  // 📅 Get all unique days of year (1-366)
  const allDays = new Set<number>()
  for (const { data } of datasets) {
    for (const row of data) {
      const date = parseISO(row.date)
      const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24),
      )
      allDays.add(dayOfYear)
    }
  }

  // 📊 Build comparison data
  const result: Array<{ dayOfYear: number; [key: string]: number | null }> = []

  for (const day of Array.from(allDays).sort((a, b) => a - b)) {
    const row: { dayOfYear: number; [key: string]: number | null } = {
      dayOfYear: day,
    }

    for (const { year, data } of datasets) {
      const matching = data.find((d) => {
        const date = parseISO(d.date)
        const dayOfYear = Math.floor(
          (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        return dayOfYear === day
      })

      row[`year_${year}`] =
        matching && typeof matching[variable] === 'number'
          ? (matching[variable] as number)
          : null
    }

    result.push(row)
  }

  return result
}

/**
 * 🌡️ Get weather condition based on temperature
 */
export function getTemperatureCondition(tempCelsius: number): {
  label: string
  emoji: string
  severity:
    | 'extreme-cold'
    | 'cold'
    | 'cool'
    | 'mild'
    | 'warm'
    | 'hot'
    | 'extreme-hot'
} {
  if (tempCelsius <= -20) {
    return { label: 'Extreme Cold', emoji: '🥶', severity: 'extreme-cold' }
  }
  if (tempCelsius <= 0) {
    return { label: 'Freezing', emoji: '❄️', severity: 'cold' }
  }
  if (tempCelsius <= 10) {
    return { label: 'Cold', emoji: '🧊', severity: 'cool' }
  }
  if (tempCelsius <= 20) {
    return { label: 'Mild', emoji: '🌤️', severity: 'mild' }
  }
  if (tempCelsius <= 30) {
    return { label: 'Warm', emoji: '☀️', severity: 'warm' }
  }
  if (tempCelsius <= 40) {
    return { label: 'Hot', emoji: '🔥', severity: 'hot' }
  }
  return { label: 'Extreme Heat', emoji: '🌡️', severity: 'extreme-hot' }
}

/**
 * 🌧️ Get precipitation condition
 */
export function getPrecipitationCondition(mmPerDay: number): {
  label: string
  emoji: string
  severity: 'none' | 'light' | 'moderate' | 'heavy' | 'extreme'
} {
  if (mmPerDay === 0) {
    return { label: 'Dry', emoji: '☀️', severity: 'none' }
  }
  if (mmPerDay < 2.5) {
    return { label: 'Light Rain', emoji: '🌦️', severity: 'light' }
  }
  if (mmPerDay < 7.6) {
    return { label: 'Moderate Rain', emoji: '🌧️', severity: 'moderate' }
  }
  if (mmPerDay < 50) {
    return { label: 'Heavy Rain', emoji: '⛈️', severity: 'heavy' }
  }
  return { label: 'Extreme Rain', emoji: '🌊', severity: 'extreme' }
}

/**
 * 📈 Calculate trend direction
 */
export function calculateTrend(values: number[]): {
  direction: 'up' | 'down' | 'stable'
  change: number
  percentChange: number
} {
  if (values.length < 2) {
    return { direction: 'stable', change: 0, percentChange: 0 }
  }

  // 📊 Simple linear regression
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((acc, v, i) => acc + i * v, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  const first = values[0]
  const last = values[values.length - 1]
  const change = last - first
  const percentChange = first !== 0 ? (change / first) * 100 : 0

  // 🎯 Threshold for "stable" is 5% change
  const direction =
    Math.abs(percentChange) < 5 ? 'stable' : slope > 0 ? 'up' : 'down'

  return { direction, change, percentChange }
}

/**
 * 📅 Get available years for historical data (1940 to present)
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []

  for (let year = currentYear; year >= 1940; year--) {
    years.push(year)
  }

  return years
}

/**
 * 🔢 Generate date range for a specific period
 */
export function getDateRangeForPeriod(
  period: 'week' | 'month' | 'quarter' | 'year',
): { start: string; end: string } {
  const end = new Date()
  end.setDate(end.getDate() - 5) // Account for data delay

  const start = new Date(end)

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(start.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      break
  }

  return {
    start: formatApiDate(start),
    end: formatApiDate(end),
  }
}

/**
 * 📏 Get the number of days in a date range
 */
export function getDaysInRange(start: string, end: string): number {
  return differenceInDays(parseISO(end), parseISO(start)) + 1
}

/**
 * 📅 Get all dates in a range
 */
export function getDatesInRange(start: string, end: string): Date[] {
  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  })
}

/**
 * 📊 Calculate statistics from chart data
 */
export function calculateStats(
  data: ChartDataPoint[],
  variable: string,
): { avg: number; min: number; max: number; sum: number; count: number } {
  const values = data
    .map((d) => d[variable])
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, sum: 0, count: 0 }
  }

  const sum = values.reduce((a, b) => a + b, 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = sum / values.length

  return { avg, min, max, sum, count: values.length }
}
