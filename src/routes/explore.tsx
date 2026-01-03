/**
 * 🔍 Explore Route
 * Main historical weather explorer with search, filters, and charts
 */

import { createFileRoute } from '@tanstack/react-router'
import { Calendar, MapPin, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { getHistoricalWeather } from '@/api'
import type { DailyWeatherVariable } from '@/api/types'
import type { ChartDataPoint } from '@/components/charts'
import {
  ChartControls,
  exportChartToCsv,
  exportChartToPng,
  PrecipitationChart,
  TemperatureChart,
  WeatherChart,
} from '@/components/charts'
import { WeatherStats, WeatherTable } from '@/components/data'
import { Container } from '@/components/layout'
import {
  CitySearch,
  DateRangePicker,
  VariableSelector,
} from '@/components/search'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateStats, getDefaultDateRange } from '@/lib/chart-config'
import type { ChartType, WeatherVariable } from '@/lib/search-params'
import { exploreSearchSchema, serializeSearchParams } from '@/lib/search-params'
import { formatDisplayDate, transformWeatherData } from '@/lib/weather-utils'

export const Route = createFileRoute('/explore')({
  validateSearch: exploreSearchSchema,

  head: () => ({
    meta: [
      { title: 'Explore Weather | Weather Vibes' },
      {
        name: 'description',
        content:
          'Explore historical weather patterns. View temperature trends, precipitation data, and climate analysis from 1940 to present.',
      },
    ],
  }),

  loader: async ({ location }) => {
    // Parse search params manually since loader doesn't get validated search
    const searchParams = new URLSearchParams(location.search)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const varsStr = searchParams.get('vars')

    // 📍 Only fetch if we have coordinates
    if (!lat || !lon) {
      return { data: null, hasLocation: false }
    }

    // 📅 Use default date range if not specified
    const defaultRange = getDefaultDateRange()
    const startDate = start || defaultRange.start
    const endDate = end || defaultRange.end

    // 📊 Parse variables
    const vars = varsStr
      ? varsStr.split(',').filter(Boolean)
      : [
          'temperature_2m_max',
          'temperature_2m_min',
          'temperature_2m_mean',
          'precipitation_sum',
        ]

    // 📊 Fetch historical weather data
    const response = await getHistoricalWeather({
      data: {
        latitude: Number.parseFloat(lat),
        longitude: Number.parseFloat(lon),
        start_date: startDate,
        end_date: endDate,
        daily: vars as DailyWeatherVariable[],
        timezone: 'auto',
      },
    })

    return {
      data: response,
      hasLocation: true,
      dateRange: { start: startDate, end: endDate },
    }
  },

  pendingComponent: ExplorePending,
  component: ExploreComponent,
})

function ExplorePending() {
  return (
    <Container className="py-8">
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    </Container>
  )
}

function ExploreComponent() {
  const loaderData = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const chartRef = useRef<HTMLDivElement>(null)

  // Extract loader data with fallbacks
  const data = loaderData?.data ?? null
  const hasLocation = loaderData?.hasLocation ?? false
  const dateRange = loaderData?.dateRange

  // Get variables from search (with defaults)
  const selectedVars: WeatherVariable[] = search.vars || [
    'temperature_2m_max',
    'temperature_2m_min',
  ]

  // 📊 Transform data for charts
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!data?.daily) return []
    return transformWeatherData(data, selectedVars)
  }, [data, selectedVars])

  // 📊 Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const tempMax = chartData
      .map((d) => d.temperature_2m_max as number)
      .filter((v) => v !== null && v !== undefined)
    const tempMin = chartData
      .map((d) => d.temperature_2m_min as number)
      .filter((v) => v !== null && v !== undefined)
    const precip = chartData
      .map((d) => d.precipitation_sum as number)
      .filter((v) => v !== null && v !== undefined)

    return {
      avgTemp:
        tempMax.length > 0 && tempMin.length > 0
          ? (calculateStats(tempMax).mean + calculateStats(tempMin).mean) / 2
          : undefined,
      maxTemp: tempMax.length > 0 ? calculateStats(tempMax).max : undefined,
      minTemp: tempMin.length > 0 ? calculateStats(tempMin).min : undefined,
      totalPrecip:
        precip.length > 0 ? precip.reduce((a, b) => a + b, 0) : undefined,
      rainyDays:
        precip.length > 0 ? precip.filter((v) => v > 0).length : undefined,
    }
  }, [chartData])

  // 🔄 Update handlers - serialize params properly
  const handleLocationSelect = useCallback(
    (result: { name: string; latitude: number; longitude: number }) => {
      navigate({
        search: serializeSearchParams({
          ...search,
          q: result.name,
          lat: result.latitude,
          lon: result.longitude,
        }),
      })
    },
    [navigate, search],
  )

  const handleDateChange = useCallback(
    (range: { start: string; end: string }) => {
      navigate({
        search: serializeSearchParams({
          ...search,
          start: range.start,
          end: range.end,
        }),
      })
    },
    [navigate, search],
  )

  const handleVariablesChange = useCallback(
    (vars: WeatherVariable[]) => {
      navigate({
        search: serializeSearchParams({
          ...search,
          vars,
        }),
      })
    },
    [navigate, search],
  )

  const handleChartTypeChange = useCallback(
    (chart: ChartType) => {
      navigate({
        search: serializeSearchParams({
          ...search,
          chart,
        }),
      })
    },
    [navigate, search],
  )

  const handleExport = useCallback(
    (format: 'png' | 'csv') => {
      if (format === 'csv') {
        exportChartToCsv(
          chartData,
          selectedVars,
          `weather-data-${search.q || 'location'}`,
        )
        toast.success('CSV exported successfully')
      } else {
        exportChartToPng(
          chartRef.current,
          `weather-chart-${search.q || 'location'}`,
        )
        toast.success('Chart exported successfully')
      }
    },
    [chartData, selectedVars, search.q],
  )

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }, [])

  return (
    <Container className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 🔍 Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 🏙️ City Search */}
            <div className="flex-1 max-w-md">
              <CitySearch
                placeholder="Search for a city..."
                defaultValue={search.q}
                onSelect={handleLocationSelect}
                size="lg"
              />
            </div>

            {/* 🔧 Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 📅 Filters */}
          <div className="flex flex-wrap gap-3">
            <DateRangePicker
              value={{
                start: search.start || dateRange?.start,
                end: search.end || dateRange?.end,
              }}
              onChange={handleDateChange}
            />
            <VariableSelector
              value={selectedVars}
              onChange={handleVariablesChange}
              className="w-[200px]"
            />
            <ChartControls
              chartType={search.chart || 'line'}
              onChartTypeChange={handleChartTypeChange}
              onExport={handleExport}
              compact
            />
          </div>
        </div>

        {/* 📊 Content */}
        {!hasLocation ? (
          // 🎯 Empty state
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Select a Location to Explore
              </h2>
              <p className="text-muted-foreground max-w-md">
                Search for a city above to view historical weather data, trends,
                and climate analysis from 1940 to present.
              </p>
            </CardContent>
          </Card>
        ) : (
          // 📊 Weather data
          <div className="space-y-6">
            {/* 📍 Location header */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium text-foreground">{search.q}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>
                {dateRange &&
                  `${formatDisplayDate(dateRange.start)} - ${formatDisplayDate(dateRange.end)}`}
              </span>
            </div>

            {/* 📊 Stats cards */}
            {stats && (
              <WeatherStats
                avgTemp={stats.avgTemp}
                maxTemp={stats.maxTemp}
                minTemp={stats.minTemp}
                totalPrecip={stats.totalPrecip}
                rainyDays={stats.rainyDays}
              />
            )}

            {/* 📈 Charts */}
            <Tabs defaultValue="temperature" className="space-y-4">
              <TabsList>
                <TabsTrigger value="temperature">🌡️ Temperature</TabsTrigger>
                <TabsTrigger value="precipitation">🌧️ Precipitation</TabsTrigger>
                <TabsTrigger value="custom">📊 Custom</TabsTrigger>
                <TabsTrigger value="table">📋 Table</TabsTrigger>
              </TabsList>

              <div ref={chartRef}>
                <TabsContent value="temperature">
                  <TemperatureChart
                    data={chartData}
                    height={400}
                    showRange
                    showFreezingLine
                  />
                </TabsContent>

                <TabsContent value="precipitation">
                  <PrecipitationChart data={chartData} height={400} />
                </TabsContent>

                <TabsContent value="custom">
                  <WeatherChart
                    data={chartData}
                    variables={selectedVars}
                    chartType={search.chart || 'line'}
                    height={400}
                    title="Custom Chart"
                  />
                </TabsContent>
              </div>

              <TabsContent value="table">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weather Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeatherTable
                      data={chartData}
                      variables={selectedVars}
                      maxRows={30}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>
    </Container>
  )
}
