/**
 * 🧭 Compare Workspace Query Hook
 * Fetches forecast + historical (and optional baseline years) for `/compare`.
 *
 * This is intentionally a thin orchestration layer:
 * - Query keys include all relevant deps (coords, range, variables)
 * - Heavy transforms live in `src/lib/compare-workspace.ts`
 */
import { useQueries, useQuery } from '@tanstack/react-query'
import { isValid, parseISO, setYear } from 'date-fns'

import { getHistoricalWeather, getWeatherForecast } from '@/api'
import type {
  DailyWeatherVariable,
  HistoricalDailyWeatherVariable,
} from '@/api/types'
import type { CompareWorkspaceView } from '@/lib/compare-workspace'
import { CACHE_TIMES, GC_TIMES, weatherKeys } from '@/lib/query-client'

type ForecastDailyFromWorkspace = Extract<
  CompareWorkspaceView['vars'][number],
  DailyWeatherVariable
>

const FORECAST_DAILY_VARIABLES: ReadonlySet<ForecastDailyFromWorkspace> =
  new Set([
    'temperature_2m_max',
    'temperature_2m_min',
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
  ])

function isForecastDailyVariable(v: string): v is ForecastDailyFromWorkspace {
  return (FORECAST_DAILY_VARIABLES as ReadonlySet<string>).has(v)
}

function replaceYearSafe(dateStr: string, year: number): string {
  const d = parseISO(dateStr)
  if (!isValid(d)) return dateStr
  // `setYear` handles most cases; Feb 29 may roll over depending on timezone parsing.
  const updated = setYear(d, year)
  return updated.toISOString().split('T')[0]
}

export function useCompareWorkspaceData(view: CompareWorkspaceView) {
  const { location, vars, source, start, end, years } = view

  const canQueryHistorical =
    !!start && !!end && (source === 'historical' || source === 'both')
  const historicalRange = start && end ? { start, end } : null

  const forecastVars = vars.filter((v): v is ForecastDailyFromWorkspace =>
    isForecastDailyVariable(v),
  )
  const canQueryForecast =
    (source === 'forecast' || source === 'both') && forecastVars.length > 0

  // 🔮 Forecast (daily) – limited by API (up to 16 days); caller should set range accordingly.
  const forecastQuery = useQuery({
    queryKey: weatherKeys.forecast(location.lat, location.lon, {
      daily: forecastVars as DailyWeatherVariable[],
      forecastDays: 16,
      timezone: 'auto',
    }),
    queryFn: () =>
      getWeatherForecast({
        data: {
          latitude: location.lat,
          longitude: location.lon,
          daily: forecastVars as DailyWeatherVariable[],
          forecast_days: 16,
          timezone: 'auto',
        },
      }),
    staleTime: CACHE_TIMES.FORECAST,
    gcTime: GC_TIMES.FORECAST,
    enabled: canQueryForecast,
  })

  // 📚 Historical window (daily)
  const historicalQuery = useQuery({
    queryKey: weatherKeys.historical(
      location.lat,
      location.lon,
      historicalRange?.start,
      historicalRange?.end,
      {
        daily: vars,
        timezone: 'auto',
      },
    ),
    queryFn: () =>
      getHistoricalWeather({
        data: {
          latitude: location.lat,
          longitude: location.lon,
          start_date: historicalRange?.start ?? '',
          end_date: historicalRange?.end ?? '',
          daily: vars as HistoricalDailyWeatherVariable[],
          timezone: 'auto',
        },
      }),
    staleTime: CACHE_TIMES.HISTORICAL,
    gcTime: GC_TIMES.HISTORICAL,
    enabled: canQueryHistorical,
  })

  // 📊 Baseline years (same month/day range across years)
  const baselineQueries = useQueries({
    queries:
      canQueryHistorical && historicalRange && years && years.length > 0
        ? years.slice(0, 6).map((year) => {
            const startForYear = replaceYearSafe(historicalRange.start, year)
            const endForYear = replaceYearSafe(historicalRange.end, year)

            return {
              queryKey: weatherKeys.historical(
                location.lat,
                location.lon,
                startForYear,
                endForYear,
                { daily: vars, timezone: 'auto' },
              ),
              queryFn: () =>
                getHistoricalWeather({
                  data: {
                    latitude: location.lat,
                    longitude: location.lon,
                    start_date: startForYear,
                    end_date: endForYear,
                    daily: vars as HistoricalDailyWeatherVariable[],
                    timezone: 'auto',
                  },
                }),
              staleTime: CACHE_TIMES.HISTORICAL,
              gcTime: GC_TIMES.HISTORICAL,
              enabled: canQueryHistorical,
            }
          })
        : [],
  })

  const isLoading =
    forecastQuery.isFetching ||
    historicalQuery.isFetching ||
    baselineQueries.some((q) => q.isFetching)

  return {
    isLoading,
    forecast: forecastQuery.data,
    historical: historicalQuery.data,
    baselines: baselineQueries
      .map((q, idx) => ({
        year: years?.[idx],
        data: q.data,
      }))
      .filter(
        (
          x,
        ): x is {
          year: number
          data: NonNullable<typeof historicalQuery.data>
        } => typeof x.year === 'number' && x.data !== undefined,
      ),
    errors: [
      forecastQuery.error,
      historicalQuery.error,
      ...baselineQueries.map((q) => q.error),
    ].filter(Boolean),
  }
}
