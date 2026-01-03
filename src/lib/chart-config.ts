/**
 * 📊 Chart Configuration Utilities
 * Recharts configuration and theming
 */

import type { ChartType, WeatherVariable } from './search-params'

// 🎨 Color palette for weather data
export const chartColors = {
  // 🌡️ Temperature colors (warm spectrum)
  temperature_2m_max: '#ef4444', // red-500
  temperature_2m_min: '#3b82f6', // blue-500
  temperature_2m_mean: '#f59e0b', // amber-500
  apparent_temperature_max: '#f97316', // orange-500
  apparent_temperature_min: '#06b6d4', // cyan-500

  // 🌧️ Precipitation colors (blue spectrum)
  precipitation_sum: '#0ea5e9', // sky-500
  rain_sum: '#3b82f6', // blue-500
  snowfall_sum: '#a855f7', // purple-500
  precipitation_hours: '#6366f1', // indigo-500

  // 💨 Wind colors (green/teal spectrum)
  wind_speed_10m_max: '#10b981', // emerald-500
  wind_gusts_10m_max: '#14b8a6', // teal-500
  wind_direction_10m_dominant: '#22c55e', // green-500

  // ☀️ Radiation colors
  shortwave_radiation_sum: '#fbbf24', // amber-400
  et0_fao_evapotranspiration: '#84cc16', // lime-500
} as const

// 📏 Variable labels and units
export const variableConfig: Record<
  WeatherVariable,
  {
    label: string
    shortLabel: string
    unit: string
    category: 'temperature' | 'precipitation' | 'wind' | 'radiation'
  }
> = {
  temperature_2m_max: {
    label: 'Maximum Temperature',
    shortLabel: 'Max Temp',
    unit: '°C',
    category: 'temperature',
  },
  temperature_2m_min: {
    label: 'Minimum Temperature',
    shortLabel: 'Min Temp',
    unit: '°C',
    category: 'temperature',
  },
  temperature_2m_mean: {
    label: 'Mean Temperature',
    shortLabel: 'Mean Temp',
    unit: '°C',
    category: 'temperature',
  },
  apparent_temperature_max: {
    label: 'Maximum Feels Like',
    shortLabel: 'Max Feels Like',
    unit: '°C',
    category: 'temperature',
  },
  apparent_temperature_min: {
    label: 'Minimum Feels Like',
    shortLabel: 'Min Feels Like',
    unit: '°C',
    category: 'temperature',
  },
  precipitation_sum: {
    label: 'Total Precipitation',
    shortLabel: 'Precip',
    unit: 'mm',
    category: 'precipitation',
  },
  rain_sum: {
    label: 'Total Rain',
    shortLabel: 'Rain',
    unit: 'mm',
    category: 'precipitation',
  },
  snowfall_sum: {
    label: 'Total Snowfall',
    shortLabel: 'Snow',
    unit: 'cm',
    category: 'precipitation',
  },
  precipitation_hours: {
    label: 'Precipitation Hours',
    shortLabel: 'Precip Hours',
    unit: 'h',
    category: 'precipitation',
  },
  wind_speed_10m_max: {
    label: 'Maximum Wind Speed',
    shortLabel: 'Max Wind',
    unit: 'km/h',
    category: 'wind',
  },
  wind_gusts_10m_max: {
    label: 'Maximum Wind Gusts',
    shortLabel: 'Max Gusts',
    unit: 'km/h',
    category: 'wind',
  },
  wind_direction_10m_dominant: {
    label: 'Dominant Wind Direction',
    shortLabel: 'Wind Dir',
    unit: '°',
    category: 'wind',
  },
  shortwave_radiation_sum: {
    label: 'Solar Radiation',
    shortLabel: 'Radiation',
    unit: 'MJ/m²',
    category: 'radiation',
  },
  et0_fao_evapotranspiration: {
    label: 'Evapotranspiration',
    shortLabel: 'ET₀',
    unit: 'mm',
    category: 'radiation',
  },
}

// 🎯 Chart type configurations
export const chartTypeConfig: Record<
  ChartType,
  {
    label: string
    description: string
    icon: string
  }
> = {
  line: {
    label: 'Line Chart',
    description: 'Best for showing trends over time',
    icon: '📈',
  },
  bar: {
    label: 'Bar Chart',
    description: 'Best for comparing discrete values',
    icon: '📊',
  },
  area: {
    label: 'Area Chart',
    description: 'Best for showing cumulative data',
    icon: '📉',
  },
  scatter: {
    label: 'Scatter Plot',
    description: 'Best for showing correlations',
    icon: '⚬',
  },
}

/**
 * 🔄 Convert temperature between units
 */
export function convertTemperature(
  value: number,
  from: 'celsius' | 'fahrenheit',
  to: 'celsius' | 'fahrenheit',
): number {
  if (from === to) return value
  if (from === 'celsius' && to === 'fahrenheit') {
    return (value * 9) / 5 + 32
  }
  return ((value - 32) * 5) / 9
}

/**
 * 🔄 Convert wind speed between units
 */
export function convertWindSpeed(
  value: number,
  from: 'kmh' | 'mph' | 'ms' | 'kn',
  to: 'kmh' | 'mph' | 'ms' | 'kn',
): number {
  if (from === to) return value

  // 🔧 Convert to m/s first
  const toMs: Record<string, number> = {
    kmh: 1 / 3.6,
    mph: 0.44704,
    ms: 1,
    kn: 0.514444,
  }

  // 🔧 Then convert from m/s
  const fromMs: Record<string, number> = {
    kmh: 3.6,
    mph: 2.23694,
    ms: 1,
    kn: 1.94384,
  }

  const inMs = value * toMs[from]
  return inMs * fromMs[to]
}

/**
 * 🔄 Convert precipitation between units
 */
export function convertPrecipitation(
  value: number,
  from: 'mm' | 'inch',
  to: 'mm' | 'inch',
): number {
  if (from === to) return value
  if (from === 'mm' && to === 'inch') {
    return value / 25.4
  }
  return value * 25.4
}

/**
 * 📅 Get default date range for historical data
 */
export function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date()
  end.setDate(end.getDate() - 5) // 5 days ago (API delay)

  const start = new Date(end)
  start.setMonth(start.getMonth() - 1) // 1 month of data

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * 📊 Format chart data from API response
 */
export function formatChartData<T extends Record<string, unknown>>(
  data: T[],
  timeKey: string = 'time',
): T[] {
  return data.map((item) => ({
    ...item,
    // 📅 Format date for display
    formattedDate:
      typeof item[timeKey] === 'string'
        ? new Date(item[timeKey] as string).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : item[timeKey],
  }))
}

/**
 * 📐 Calculate statistics for a data series
 */
export function calculateStats(values: number[]): {
  min: number
  max: number
  mean: number
  median: number
  stdDev: number
} {
  const filtered = values.filter((v) => v !== null && !Number.isNaN(v))
  if (filtered.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 }
  }

  const sorted = [...filtered].sort((a, b) => a - b)
  const sum = filtered.reduce((acc, v) => acc + v, 0)
  const mean = sum / filtered.length

  const squaredDiffs = filtered.map((v) => (v - mean) ** 2)
  const variance = squaredDiffs.reduce((acc, v) => acc + v, 0) / filtered.length

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev: Math.sqrt(variance),
  }
}
