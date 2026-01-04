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
const axisSideSchema = z.enum(['left', 'right'])
export type AxisSide = z.infer<typeof axisSideSchema>

export type CompareLocation = {
  name: string
  lat: number
  lon: number
}

/**
 * Parse compare locations from a compact string format.
 *
 * Format:
 * - `Name,lat,lon;Name2,lat,lon`
 *
 * Example:
 * - `Berlin,52.52,13.405;Paris,48.8566,2.3522`
 */
function parseCompareLocations(input: string): CompareLocation[] {
  return input
    .split(';')
    .map((loc) => {
      const [name, lat, lon] = loc.split(',')
      const latNum = Number(lat)
      const lonNum = Number(lon)
      return {
        name: name?.trim() ?? '',
        lat: latNum,
        lon: lonNum,
      }
    })
    .filter(
      (l) =>
        l.name.length > 0 &&
        !Number.isNaN(l.lat) &&
        !Number.isNaN(l.lon) &&
        l.lat >= -90 &&
        l.lat <= 90 &&
        l.lon >= -180 &&
        l.lon <= 180,
    )
}

export const compareDataSources = ['forecast', 'historical', 'both'] as const
export type CompareDataSource = (typeof compareDataSources)[number]

export const compareAggregations = ['daily', 'weekly', 'monthly'] as const
export type CompareAggregation = (typeof compareAggregations)[number]

export const compareStats = [
  'min',
  'max',
  'mean',
  'median',
  'p10',
  'p90',
  'rolling',
] as const
export type CompareStat = (typeof compareStats)[number]

/**
 * Compare page URL-state schema.
 *
 * This is intentionally richer than other routes because `/compare` is treated as
 * a shareable “analysis workspace” whose entire configuration lives in the URL.
 */
export const compareSearchSchema = z
  .object({
    // 📍 Locations to compare (compact string form, parsed into objects)
    locations: z
      .string()
      .transform((v) => parseCompareLocations(v))
      .optional(),

    // 🔢 Years to compare (used for historical baseline / YoY views)
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

    // 📊 Primary variable for single-variable views (eg YoY chart)
    variable: z.enum(weatherVariables).optional(),

    // 📊 Multi-variable selection for workspace timeline view
    vars: z
      .string()
      .transform((v) => v.split(',').filter(Boolean))
      .pipe(z.array(z.enum(weatherVariables)))
      .optional(),

    // 🧪 Data source strategy
    source: z.enum(compareDataSources).optional().default('both'),

    // 📦 Aggregation mode for timeline view
    agg: z.enum(compareAggregations).optional().default('daily'),

    // 📅 Date range overrides (YYYY-MM-DD). If omitted, the page decides defaults.
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    // 🔍 Zoom window (YYYY-MM-DD) for Brush/zoom restoring
    zoomStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    zoomEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    // 📈 Chart type (applies to timeline view)
    chart: z.enum(chartTypes).optional().default('line'),

    // 📊 Stats overlays toggles
    stats: z
      .string()
      .transform((v) => v.split(',').filter(Boolean))
      .pipe(z.array(z.enum(compareStats)))
      .optional()
      .catch([]),

    // 📈 Rolling average window (days). Only used if `stats` includes `rolling`.
    smooth: z.coerce.number().int().min(1).max(60).optional().catch(7),

    // 🧭 Axis side assignments per variable (semicolon-separated pairs).
    // Format: `temperature_2m_mean:left;precipitation_sum:right`
    yAxes: z
      .string()
      .transform((v) => {
        const pairs = v
          .split(';')
          .map((p) => p.trim())
          .filter(Boolean)
        const result: Partial<Record<WeatherVariable, AxisSide>> = {}
        for (const pair of pairs) {
          const [rawVar, rawSide] = pair.split(':')
          if (!rawVar || !rawSide) continue
          // Only accept known vars/sides
          if ((weatherVariables as readonly string[]).includes(rawVar)) {
            const parsedSide = axisSideSchema.safeParse(rawSide)
            if (parsedSide.success) {
              result[rawVar as WeatherVariable] = parsedSide.data
            }
          }
        }
        return result
      })
      .optional()
      .catch({}),

    // ⚙️ Units
    tempUnit: z.enum(temperatureUnits).optional().default('celsius'),
    windUnit: z.enum(windSpeedUnits).optional().default('kmh'),
    precipUnit: z.enum(precipitationUnits).optional().default('mm'),
  })
  .transform((input) => {
    // 🔁 Back-compat: if `vars` missing but `variable` present, promote it.
    const vars =
      input.vars && input.vars.length > 0
        ? input.vars
        : input.variable
          ? [input.variable]
          : undefined

    // 🔁 Back-compat: if `variable` missing but `vars` present, pick first for single-var views.
    const variable =
      input.variable ?? (vars?.[0] as WeatherVariable | undefined)

    return {
      ...input,
      vars,
      variable,
    }
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
