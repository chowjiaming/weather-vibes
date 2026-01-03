/**
 * 🔍 URL Search Params Schemas
 * Zod validation for shareable URL state
 */

import { z } from 'zod'

// 📊 Available weather variables for historical data
export const weatherVariables = [
  'temperature_2m_max',
  'temperature_2m_min',
  'temperature_2m_mean',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'precipitation_sum',
  'rain_sum',
  'snowfall_sum',
  'precipitation_hours',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
  'shortwave_radiation_sum',
  'et0_fao_evapotranspiration',
] as const

export type WeatherVariable = (typeof weatherVariables)[number]

// 📈 Chart type options
export const chartTypes = ['line', 'bar', 'area', 'scatter'] as const
export type ChartType = (typeof chartTypes)[number]

// 🌡️ Temperature unit options
export const temperatureUnits = ['celsius', 'fahrenheit'] as const
export type TemperatureUnit = (typeof temperatureUnits)[number]

// 💨 Wind speed unit options
export const windSpeedUnits = ['kmh', 'mph', 'ms', 'kn'] as const
export type WindSpeedUnit = (typeof windSpeedUnits)[number]

// 🌧️ Precipitation unit options
export const precipitationUnits = ['mm', 'inch'] as const
export type PrecipitationUnit = (typeof precipitationUnits)[number]

/**
 * 🗺️ Explore page search params schema
 */
export const exploreSearchSchema = z.object({
  // 🔍 Search query
  q: z.string().optional(),

  // 📍 Location coordinates
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),

  // 📅 Date range (YYYY-MM-DD format)
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  // 📊 Weather variables to display
  vars: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(z.enum(weatherVariables)))
    .optional()
    .catch(['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum']),

  // 📈 Chart configuration
  chart: z.enum(chartTypes).optional().default('line'),

  // 🔢 Years to compare (comma-separated)
  years: z
    .string()
    .transform((v) =>
      v
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    )
    .pipe(z.array(z.number().min(1940).max(new Date().getFullYear())))
    .optional(),

  // 📊 Overlay multiple datasets
  overlay: z
    .string()
    .transform((v) => v === 'true')
    .optional()
    .catch(false),

  // ⚙️ Unit preferences
  tempUnit: z.enum(temperatureUnits).optional().default('celsius'),
  windUnit: z.enum(windSpeedUnits).optional().default('kmh'),
  precipUnit: z.enum(precipitationUnits).optional().default('mm'),
})

export type ExploreSearchParams = z.infer<typeof exploreSearchSchema>

/**
 * 🏙️ City detail page search params schema
 */
export const citySearchSchema = z.object({
  // 📅 Date range
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  // 📊 Weather variables
  vars: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(z.enum(weatherVariables)))
    .optional()
    .catch(['temperature_2m_max', 'temperature_2m_min']),

  // 📈 Chart type
  chart: z.enum(chartTypes).optional().default('line'),

  // 🔢 Compare years
  years: z
    .string()
    .transform((v) =>
      v
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    )
    .pipe(z.array(z.number().min(1940).max(new Date().getFullYear())))
    .optional(),

  // ⚙️ Units
  tempUnit: z.enum(temperatureUnits).optional().default('celsius'),
})

export type CitySearchParams = z.infer<typeof citySearchSchema>

/**
 * 🔄 Compare page search params schema
 */
export const compareSearchSchema = z.object({
  // 📍 Locations to compare (comma-separated slugs)
  locations: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .optional(),

  // 🔢 Years to compare
  years: z
    .string()
    .transform((v) =>
      v
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    )
    .pipe(z.array(z.number().min(1940).max(new Date().getFullYear())))
    .optional()
    .catch([new Date().getFullYear() - 1, new Date().getFullYear()]),

  // 📊 Variable to compare
  variable: z.enum(weatherVariables).optional().default('temperature_2m_mean'),

  // 📈 Chart type
  chart: z.enum(chartTypes).optional().default('line'),

  // ⚙️ Units
  tempUnit: z.enum(temperatureUnits).optional().default('celsius'),
})

export type CompareSearchParams = z.infer<typeof compareSearchSchema>

/**
 * 🏠 Home page search params (for quick search)
 */
export const homeSearchSchema = z.object({
  q: z.string().optional(),
})

export type HomeSearchParams = z.infer<typeof homeSearchSchema>

/**
 * 🛠️ Helper to serialize search params back to URL string
 */
export function serializeSearchParams<T extends Record<string, unknown>>(
  params: T,
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      if (value.length > 0) {
        result[key] = value.join(',')
      }
    } else if (typeof value === 'boolean') {
      result[key] = value.toString()
    } else if (typeof value === 'number') {
      result[key] = value.toString()
    } else if (typeof value === 'string' && value !== '') {
      result[key] = value
    }
  }

  return result
}
