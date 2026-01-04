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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompareWorkspaceData } from '@/hooks/queries'
import { useDefaultLocation } from '@/hooks/use-default-location'
import { calculateStats } from '@/lib/chart-config'
import {
  aggregateSeries,
  normalizeCompareView,
  serializeYAxisMap,
} from '@/lib/compare-workspace'
import {
  type CompareSearchParams,
  compareSearchSchema,
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
    return search.locations?.length
      ? search.locations.map((l) => `${l.name},${l.lat},${l.lon}`).join(';')
      : undefined
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

    const merged = mergeByDate(
      [...historicalPoints, ...forecastPoints],
      view.vars,
    )
    return aggregateSeries(merged, view.vars, view.agg)
  }, [historical, forecast, view.vars, view.agg])

  // 📌 Restore brush selection from URL zoomStart/zoomEnd
  const brushRange = useMemo(() => {
    const zoomStart = view.zoomStart
    const zoomEnd = view.zoomEnd
    if (!zoomStart || !zoomEnd || chartData.length === 0) return undefined

    const startIdx = chartData.findIndex((d) => d.date && d.date >= zoomStart)
    const endIdx =
      chartData.length -
      1 -
      [...chartData].reverse().findIndex((d) => d.date && d.date <= zoomEnd)

    if (startIdx < 0 || endIdx < 0) return undefined
    return { startIndex: startIdx, endIndex: Math.max(startIdx, endIdx) }
  }, [view.zoomStart, view.zoomEnd, chartData])

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

  // 🔄 Update search params
  const handleYearToggle = useCallback(
    (year: number) => {
      const newYears = years.includes(year)
        ? years.filter((y) => y !== year)
        : [...years, year].slice(0, 6) // Max 6 years

      navigate({
        to: '/compare',
        search: serializeSearchParams({
          // ⚠️ Link/navigate typings expect the URL input shape (strings) for transformed Zod schemas
          locations: locationsParam,
          years: newYears,
          vars,
          variable: vars[0],
          source: view.source,
          agg: view.agg,
          stats: view.stats,
          smooth: view.smoothDays,
          start: view.start,
          end: view.end,
          zoomStart: view.zoomStart,
          zoomEnd: view.zoomEnd,
          yAxes: serializeYAxisMap(view.yAxes),
        }),
      })
    },
    [years, navigate, locationsParam, vars, view],
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
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                <span className="font-medium">{locations[0].name}</span>
                {!hasExplicitLocation && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>

              <div className="flex-1" />

              <CompareWorkspaceControls
                vars={vars}
                onVarsChange={(nextVars) => {
                  navigate({
                    to: '/compare',
                    search: serializeSearchParams({
                      locations: locationsParam,
                      years,
                      vars: nextVars,
                      variable: nextVars[0],
                      source: view.source,
                      agg: view.agg,
                      stats: view.stats,
                      smooth: view.smoothDays,
                      start: view.start,
                      end: view.end,
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(view.yAxes),
                    }),
                  })
                }}
                yAxes={view.yAxes}
                onAxisChange={(nextAxes) => {
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
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(nextAxes),
                    }),
                  })
                }}
                source={view.source}
                onSourceChange={(nextSource) => {
                  navigate({
                    to: '/compare',
                    search: serializeSearchParams({
                      locations: locationsParam,
                      years,
                      vars,
                      variable: vars[0],
                      source: nextSource,
                      agg: view.agg,
                      stats: view.stats,
                      smooth: view.smoothDays,
                      start: view.start,
                      end: view.end,
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(view.yAxes),
                    }),
                  })
                }}
                agg={view.agg}
                onAggChange={(nextAgg) => {
                  navigate({
                    to: '/compare',
                    search: serializeSearchParams({
                      locations: locationsParam,
                      years,
                      vars,
                      variable: vars[0],
                      source: view.source,
                      agg: nextAgg,
                      stats: view.stats,
                      smooth: view.smoothDays,
                      start: view.start,
                      end: view.end,
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(view.yAxes),
                    }),
                  })
                }}
                stats={view.stats}
                onStatsChange={(nextStats) => {
                  navigate({
                    to: '/compare',
                    search: serializeSearchParams({
                      locations: locationsParam,
                      years,
                      vars,
                      variable: vars[0],
                      source: view.source,
                      agg: view.agg,
                      stats: nextStats,
                      smooth: view.smoothDays,
                      start: view.start,
                      end: view.end,
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(view.yAxes),
                    }),
                  })
                }}
                smoothDays={view.smoothDays}
                onSmoothDaysChange={(nextDays) => {
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
                      smooth: nextDays,
                      start: view.start,
                      end: view.end,
                      zoomStart: view.zoomStart,
                      zoomEnd: view.zoomEnd,
                      yAxes: serializeYAxisMap(view.yAxes),
                    }),
                  })
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

            {/* 📅 Year selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {availableYears.slice(0, 10).map((year) => (
                <Badge
                  key={year}
                  variant={years.includes(year) ? 'default' : 'outline'}
                  size="lg"
                  interactive
                  className="cursor-pointer"
                  onClick={() => handleYearToggle(year)}
                >
                  {year}
                </Badge>
              ))}
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
                  brush={{
                    enabled: true,
                    startIndex: brushRange?.startIndex,
                    endIndex: brushRange?.endIndex,
                    onChange: ({ startIndex, endIndex }) => {
                      if (
                        startIndex === undefined ||
                        endIndex === undefined ||
                        chartData.length === 0
                      ) {
                        return
                      }

                      const start = chartData[startIndex]?.date
                      const end = chartData[endIndex]?.date
                      if (!start || !end) return

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
                          zoomStart: start,
                          zoomEnd: end,
                          yAxes: serializeYAxisMap(view.yAxes),
                        }),
                      })
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <p className="mt-4">
                    {isLoading
                      ? 'Loading workspace data...'
                      : 'No data for this selection.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      </motion.div>
    </div>
  )
}
