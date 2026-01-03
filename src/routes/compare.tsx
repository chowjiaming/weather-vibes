/**
 * 📊 Compare Route
 * Multi-location and historical year comparison
 *
 * 🔄 Performance: Uses TanStack Query for client-side caching
 * 🌍 Default: Auto-detects user region via timezone
 */
import { useQueries } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { z } from 'zod'

import { getHistoricalWeather } from '@/api'
import type { HistoricalDailyWeatherVariable } from '@/api/types'
import { LazyMapCanvas, MapMarker } from '@/components/map'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getDefaultLocation } from '@/lib/default-locations'
import { CACHE_TIMES, weatherKeys } from '@/lib/query-client'

// 🎨 Color palette for comparison lines
const comparisonColors = [
  '#14b8a6', // teal
  '#f97316', // orange
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#22c55e', // green
  '#eab308', // yellow
]

// 📅 Available years for comparison
const currentYear = new Date().getFullYear()
const availableYears = Array.from({ length: 30 }, (_, i) => currentYear - i)

// 🌡️ Available weather variables
const weatherVariableValues = [
  'temperature_2m_mean',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'wind_speed_10m_max',
] as const

type WeatherVariableValue = (typeof weatherVariableValues)[number]

const weatherVariables: ReadonlyArray<{
  value: WeatherVariableValue
  label: string
}> = [
  { value: 'temperature_2m_mean', label: 'Temperature (Mean)' },
  { value: 'temperature_2m_max', label: 'Temperature (Max)' },
  { value: 'temperature_2m_min', label: 'Temperature (Min)' },
  { value: 'precipitation_sum', label: 'Precipitation' },
  { value: 'wind_speed_10m_max', label: 'Wind Speed (Max)' },
]

// 🔍 Search params schema
const compareSearchSchema = z.object({
  locations: z.string().optional(), // comma-separated lat,lon pairs
  years: z.string().optional(), // comma-separated years
  variable: z
    .enum(weatherVariableValues)
    .optional()
    .default('temperature_2m_mean'),
})

interface CompareLocation {
  name: string
  lat: number
  lon: number
}

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

function ComparePage() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  // 🌍 Get regional default based on user's timezone
  const defaultLocation = useMemo(() => getDefaultLocation(), [])

  // 📍 Parse locations from search params, or use default
  const locations: CompareLocation[] = useMemo(() => {
    if (!search.locations) {
      // 🏠 Use default location when none specified
      return [
        {
          name: `${defaultLocation.name}, ${defaultLocation.country}`,
          lat: defaultLocation.lat,
          lon: defaultLocation.lon,
        },
      ]
    }
    return search.locations
      .split(';')
      .map((loc) => {
        const [name, lat, lon] = loc.split(',')
        return { name, lat: Number(lat), lon: Number(lon) }
      })
      .filter((l) => !Number.isNaN(l.lat) && !Number.isNaN(l.lon))
  }, [search.locations, defaultLocation])

  // 📅 Parse years from search params
  // ⚠️ Default to previous two complete years (not current year which may lack data)
  const parsedYears = useMemo(() => {
    if (!search.years) return [currentYear - 2, currentYear - 1]
    return search.years
      .split(',')
      .map(Number)
      .filter((y) => !Number.isNaN(y))
  }, [search.years])

  const [selectedYears, setSelectedYears] = useState<number[]>(parsedYears)
  const [selectedVariable, setSelectedVariable] =
    useState<WeatherVariableValue>(search.variable ?? 'temperature_2m_mean')

  // 📍 Get the first location for data fetching
  const location = locations[0] ?? null

  // 🔄 TanStack Query: Fetch data for each selected year (parallel queries)
  const yearQueries = useQueries({
    queries: selectedYears.map((year) => ({
      queryKey: weatherKeys.historical(
        location?.lat ?? 0,
        location?.lon ?? 0,
        `${year}-01-01`,
        `${year}-12-31`,
      ),
      queryFn: () =>
        getHistoricalWeather({
          data: {
            latitude: location?.lat ?? 0,
            longitude: location?.lon ?? 0,
            start_date: `${year}-01-01`,
            end_date: `${year}-12-31`,
            daily: [selectedVariable] as HistoricalDailyWeatherVariable[],
            timezone: 'auto',
          },
        }),
      enabled: !!location,
      staleTime: CACHE_TIMES.HISTORICAL,
    })),
  })

  // 📊 Check loading state properly
  // ⚠️ Use isFetching instead of isPending to avoid stuck loading states
  const isFetching = yearQueries.some((q) => q.isFetching)
  const hasAllData = yearQueries.every((q) => q.data !== undefined)
  const isReady = hasAllData && !isFetching

  // 📊 Combine query results
  const data = useMemo(() => {
    // ✅ Only return null if not ready
    if (!isReady) return null

    return selectedYears.map((year, i) => ({
      year,
      response: yearQueries[i].data,
    }))
  }, [yearQueries, selectedYears, isReady]) as Array<{
    year: number
    response: NonNullable<(typeof yearQueries)[number]['data']>
  }> | null

  // 📊 Transform data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Create a map of month → year values
    const monthlyData: Record<string, Record<string, number | null>> = {}

    for (const { year, response } of data) {
      if (!response.daily?.time) continue

      for (let i = 0; i < response.daily.time.length; i++) {
        const date = response.daily.time[i]
        const monthKey = format(parseISO(String(date)), 'MMM')
        const values =
          response.daily[selectedVariable as keyof typeof response.daily]
        const value = Array.isArray(values) ? values[i] : null

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey as unknown as number }
        }

        // Average values for the month
        const currentVal = monthlyData[monthKey][`year_${year}`] as
          | number
          | null
        if (typeof value === 'number') {
          if (currentVal === null || currentVal === undefined) {
            monthlyData[monthKey][`year_${year}`] = value
          } else {
            monthlyData[monthKey][`year_${year}`] = (currentVal + value) / 2
          }
        }
      }
    }

    // Convert to array and sort by month
    const monthOrder = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return monthOrder
      .filter((m) => monthlyData[m])
      .map((m) => ({ month: m, ...monthlyData[m] }))
  }, [data, selectedVariable])

  // 🔄 Update search params
  const handleYearToggle = useCallback(
    (year: number) => {
      const newYears = selectedYears.includes(year)
        ? selectedYears.filter((y) => y !== year)
        : [...selectedYears, year].slice(0, 6) // Max 6 years

      setSelectedYears(newYears)
      navigate({
        to: '/compare',
        search: {
          ...search,
          years: newYears.join(','),
        },
      })
    },
    [selectedYears, navigate, search],
  )

  const handleVariableChange = useCallback(
    (newVariable: WeatherVariableValue | null) => {
      if (!newVariable) return
      setSelectedVariable(newVariable)
      navigate({
        to: '/compare',
        search: {
          ...search,
          variable: newVariable,
        },
      })
    },
    [navigate, search],
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

              {/* 📊 Variable selector */}
              <Select
                value={selectedVariable}
                onValueChange={handleVariableChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weatherVariables.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 📅 Year selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {availableYears.slice(0, 10).map((year) => (
                <Badge
                  key={year}
                  variant={selectedYears.includes(year) ? 'default' : 'outline'}
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
            {data && chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickFormatter={(v) => `${v.toFixed(0)}°`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    {selectedYears.map((year, i) => (
                      <Line
                        key={year}
                        type="monotone"
                        dataKey={`year_${year}`}
                        name={String(year)}
                        stroke={comparisonColors[i % comparisonColors.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <p className="mt-4">Loading comparison data...</p>
                </div>
              </div>
            )}
          </div>
        }
      </motion.div>
    </div>
  )
}
