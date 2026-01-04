/**
 * 📊 Compare Route
 * Multi-variable comparison workspace (URL-state driven)
 *
 * 🔄 Performance: Uses TanStack Query for client-side caching
 * 🌍 Default: Auto-detects user region via timezone
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format, parseISO, subDays } from 'date-fns'
import { MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'

import {
  CompareWorkspaceControls,
  exportChartToPng,
  exportWorkspaceToCsv,
  WeatherChart,
} from '@/components/charts'
import { LazyMapCanvas, MapMarker } from '@/components/map'
import { DateRangePicker } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompareWorkspaceData } from '@/hooks/queries'
import { useDefaultLocation } from '@/hooks/use-default-location'
import { calculateStats } from '@/lib/chart-config'
import {
  aggregateSeries,
  downsampleTimeSeries,
  normalizeCompareView,
  serializeYAxisMap,
} from '@/lib/compare-workspace'
import {
  type CompareSearchParams,
  compareSearchSchema,
  serializeCompareLocations,
  serializeSearchParams,
  type WeatherVariable,
} from '@/lib/search-params'
import type { ChartDataPoint } from '@/lib/weather-utils'
import { transformWeatherData } from '@/lib/weather-utils'

// 📅 Available years for comparison
const currentYear = new Date().getFullYear()
const availableYears = Array.from({ length: 30 }, (_, i) => currentYear - i)

export const Route = createFileRoute('/compare')({
  validateSearch: compareSearchSchema,

  head: () => ({
    meta: [
      { title: 'Compare | Weather Vibes' },
      {
        name: 'description',
        content: 'Compare weather patterns across years and locations',
      },
    ],
  }),

  component: ComparePage,
})

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.floor((sorted.length - 1) * p)
  return sorted[idx] ?? sorted[sorted.length - 1] ?? 0
}

function mergeByDate(
  points: ChartDataPoint[],
  vars: WeatherVariable[],
): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>()
  for (const p of points) {
    if (!p.date) continue
    const prev = map.get(p.date)
    map.set(p.date, prev ? { ...prev, ...p } : p)
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const ad = a.date ? parseISO(a.date).getTime() : 0
    const bd = b.date ? parseISO(b.date).getTime() : 0
    return ad - bd
  })

  // Ensure stable keys across merged sources
  return merged.map((row) => {
    const out: ChartDataPoint = { ...row }
    for (const v of vars) {
      if (out[v] === undefined) out[v] = null
    }
    return out
  })
}

function ComparePage() {
  const navigate = useNavigate()
  const search = Route.useSearch() as CompareSearchParams

  // 🌍 Get regional default based on user's timezone
  const defaultLocation = useDefaultLocation()

  // 📍 Parse locations from search params, or use default
  const locations = useMemo(() => {
    if (search.locations && search.locations.length > 0) {
      return search.locations
    }

    // 🏠 Use default location when none specified
    return [
      {
        name: `${defaultLocation.name}, ${defaultLocation.country}`,
        lat: defaultLocation.lat,
        lon: defaultLocation.lon,
      },
    ]
  }, [search.locations, defaultLocation])

  const years = useMemo(() => {
    if (search.years && search.years.length > 0) return search.years
    // ⚠️ Default to previous two complete years (not current year which may lack data)
    return [currentYear - 2, currentYear - 1]
  }, [search.years])

  const vars = useMemo(() => {
    if (search.vars && search.vars.length > 0) return search.vars
    return [(search.variable ?? 'temperature_2m_mean') as WeatherVariable]
  }, [search.vars, search.variable])

  const locationsParam = useMemo(() => {
    return serializeCompareLocations(search.locations)
  }, [search.locations])

  // 📅 Default to “last 90 days” unless specified (good for brush + baseline)
  const defaultStart = useMemo(
    () => format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    [],
  )
  const defaultEnd = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const fallbackLocation = useMemo(
    () => ({
      name: `${defaultLocation.name}, ${defaultLocation.country}`,
      lat: defaultLocation.lat,
      lon: defaultLocation.lon,
    }),
    [defaultLocation],
  )

  const view = useMemo(() => {
    return normalizeCompareView(
      {
        ...search,
        years,
        vars,
        start: search.start ?? defaultStart,
        end: search.end ?? defaultEnd,
      },
      locations[0] ?? fallbackLocation,
    )
  }, [
    search,
    years,
    vars,
    defaultStart,
    defaultEnd,
    locations,
    fallbackLocation,
  ])

  const { historical, forecast, isLoading } = useCompareWorkspaceData(view)

  const chartData = useMemo(() => {
    const historicalPoints = historical
      ? transformWeatherData(historical, view.vars)
      : []
    const forecastVars = view.vars.filter((v) => v !== 'temperature_2m_mean')
    const forecastPoints = forecast
      ? transformWeatherData(forecast, forecastVars as WeatherVariable[])
      : []

    // 🔻 Recharts perf guard: keep charts snappy on long ranges
    const MAX_POINTS = 900
    const sampledHistorical = downsampleTimeSeries(historicalPoints, MAX_POINTS)
    const sampledForecast = downsampleTimeSeries(forecastPoints, MAX_POINTS)

    const merged = mergeByDate(
      [...sampledHistorical, ...sampledForecast],
      view.vars,
    )
    return aggregateSeries(merged, view.vars, view.agg)
  }, [historical, forecast, view.vars, view.agg])

  const referenceLines = useMemo(() => {
    const primary = view.vars[0]
    if (!primary) return []

    const values = chartData
      .map((d) => d[primary])
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

    if (values.length === 0) return []

    const stats = calculateStats(values)
    const p10 = percentile(values, 0.1)
    const p90 = percentile(values, 0.9)

    const yAxisId = view.yAxes[primary] ?? 'left'

    const lines: Array<{
      y: number
      yAxisId: 'left' | 'right'
      label: string
    }> = []
    if (view.stats.includes('min'))
      lines.push({ y: stats.min, yAxisId, label: 'min' })
    if (view.stats.includes('max'))
      lines.push({ y: stats.max, yAxisId, label: 'max' })
    if (view.stats.includes('mean'))
      lines.push({ y: stats.mean, yAxisId, label: 'mean' })
    if (view.stats.includes('median'))
      lines.push({ y: stats.median, yAxisId, label: 'median' })
    if (view.stats.includes('p10'))
      lines.push({ y: p10, yAxisId, label: 'p10' })
    if (view.stats.includes('p90'))
      lines.push({ y: p90, yAxisId, label: 'p90' })

    return lines
  }, [view.vars, view.stats, view.yAxes, chartData])

  const chartRef = useRef<HTMLDivElement | null>(null)

  // 🔁 Centralized URL updater to avoid duplicated (and drifting) search-state logic 🧭
  const updateCompareSearch = useCallback(
    (
      patch: Partial<{
        years: number[]
        vars: WeatherVariable[]
        variable: WeatherVariable | undefined
        source: CompareSearchParams['source']
        agg: CompareSearchParams['agg']
        stats: CompareSearchParams['stats']
        smooth: number
        start: string
        end: string
        yAxes: string | undefined
      }>,
    ) => {
      navigate({
        to: '/compare',
        search: serializeSearchParams({
          locations: locationsParam,
          years,
          vars,
          variable: vars[0],
          source: view.source,
          agg: view.agg,
          stats: view.stats,
          smooth: view.smoothDays,
          start: view.start,
          end: view.end,
          yAxes: serializeYAxisMap(view.yAxes),
          ...patch,
          // ✅ Brush is removed, so we ensure stale zoom params don’t linger
          zoomStart: undefined,
          zoomEnd: undefined,
        }),
      })
    },
    [navigate, locationsParam, years, vars, view],
  )

  // 🔄 Update search params
  const handleYearToggle = useCallback(
    (year: number) => {
      const newYears = years.includes(year)
        ? years.filter((y) => y !== year)
        : [...years, year].slice(0, 6) // Max 6 years

      updateCompareSearch({ years: newYears })
    },
    [years, updateCompareSearch],
  )

  // 📍 Determine if using explicit search params or default
  const hasExplicitLocation = !!search.locations

  return (
    <div className="relative h-full w-full">
      {/* 🗺️ Map canvas (background) */}
      <LazyMapCanvas
        center={[locations[0].lon, locations[0].lat]}
        zoom={hasExplicitLocation ? 8 : 6}
        interactive={false}
        className="opacity-50"
      >
        {locations.map((loc, i) => (
          <MapMarker
            key={`${loc.lat}-${loc.lon}`}
            longitude={loc.lon}
            latitude={loc.lat}
            label={loc.name}
            variant={i === 0 ? 'selected' : 'default'}
          />
        ))}
      </LazyMapCanvas>

      {/* 📊 Comparison panel overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute inset-4 top-20 z-10 flex items-start justify-center"
      >
        {/* 📊 Always show comparison panel (default location is always available) */}
        {
          <div className="glass rounded-3xl p-6 max-w-5xl w-full max-h-[calc(100vh-8rem)] overflow-auto">
            {/* 🎛️ Controls */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                <span className="font-medium">{locations[0].name}</span>
                {!hasExplicitLocation && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {/* 🎚️ Keep filters to one line on desktop (2 total lines w/ years row) 🧼 */}
              <div className="min-w-0 flex-1">
                <CompareWorkspaceControls
                  className="flex-wrap md:flex-nowrap md:overflow-x-auto md:whitespace-nowrap md:pb-1"
                  vars={vars}
                  onVarsChange={(nextVars) => {
                    updateCompareSearch({
                      vars: nextVars,
                      variable: nextVars[0],
                    })
                  }}
                  yAxes={view.yAxes}
                  onAxisChange={(nextAxes) => {
                    updateCompareSearch({ yAxes: serializeYAxisMap(nextAxes) })
                  }}
                  source={view.source}
                  onSourceChange={(nextSource) => {
                    updateCompareSearch({ source: nextSource })
                  }}
                  agg={view.agg}
                  onAggChange={(nextAgg) => {
                    updateCompareSearch({ agg: nextAgg })
                  }}
                  stats={view.stats}
                  onStatsChange={(nextStats) => {
                    updateCompareSearch({ stats: nextStats })
                  }}
                  smoothDays={view.smoothDays}
                  onSmoothDaysChange={(nextDays) => {
                    updateCompareSearch({ smooth: nextDays })
                  }}
                  onExport={(fmt) => {
                    if (fmt === 'png') {
                      exportChartToPng(chartRef.current, 'compare-workspace')
                    } else {
                      exportWorkspaceToCsv(
                        chartData,
                        view.vars,
                        view,
                        'compare-workspace',
                      )
                    }
                  }}
                />
              </div>
            </div>

            {/* 📅 Date + years row (keep compare “filters” to 2 lines on desktop) 🧭 */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
              <DateRangePicker
                className="w-full md:w-auto"
                value={{ start: view.start, end: view.end }}
                onChange={({ start, end }) => {
                  updateCompareSearch({ start, end })
                }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableYears.slice(0, 10).map((year) => (
                    <Badge
                      key={year}
                      variant={years.includes(year) ? 'default' : 'outline'}
                      size="lg"
                      interactive
                      className="cursor-pointer shrink-0"
                      onClick={() => handleYearToggle(year)}
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 📈 Chart */}
            {!isLoading && chartData.length > 0 ? (
              <div ref={chartRef} className="h-[420px] w-full">
                <WeatherChart
                  data={chartData}
                  variables={view.vars}
                  chartType={view.chart}
                  yAxes={view.yAxes}
                  referenceLines={referenceLines}
                />
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center">
                {isLoading ? (
                  <div className="w-full max-w-4xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-72" />
                      </div>
                      <Skeleton className="h-8 w-28" />
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <Skeleton className="h-[300px] w-full rounded-lg" />
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Loading comparison data… fetching archive + forecast 📡
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">No data for this selection.</p>
                    <p className="text-xs mt-1">
                      Try widening the date range or changing variables.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      </motion.div>
    </div>
  )
}
