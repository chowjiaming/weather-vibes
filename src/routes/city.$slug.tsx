/**
 * 🏙️ City Detail Route
 * Historical weather data for a specific city
 */

import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowLeft, Calendar, MapPin, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { getHistoricalWeather, searchLocation } from '@/api'
import type { HistoricalDailyWeatherVariable } from '@/api/types'
import type { ChartDataPoint } from '@/components/charts'
import {
  ChartControls,
  exportChartToCsv,
  exportChartToPng,
  PrecipitationChart,
  TemperatureChart,
} from '@/components/charts'
import { WeatherStats, WeatherTable } from '@/components/data'
import { Container } from '@/components/layout'
import { DateRangePicker, VariableSelector } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateStats, getDefaultDateRange } from '@/lib/chart-config'
import type { ChartType, WeatherVariable } from '@/lib/search-params'
import {
  chartTypes,
  serializeSearchParams,
  weatherVariables,
} from '@/lib/search-params'
import {
  formatDisplayDate,
  parseCitySlug,
  transformWeatherData,
} from '@/lib/weather-utils'

// 🔍 City search params schema
const citySearchSchema = z.object({
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  vars: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(z.enum(weatherVariables)))
    .optional()
    .catch(['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum']),
  chart: z.enum(chartTypes).optional().default('line'),
})

type CitySearch = z.infer<typeof citySearchSchema>

export const Route = createFileRoute('/city/$slug')({
  validateSearch: citySearchSchema,

  loader: async ({ params, location }) => {
    const cityName = parseCitySlug(params.slug)

    // Parse search params from URL
    const searchParams = new URLSearchParams(location.search)
    const latStr = searchParams.get('lat')
    const lonStr = searchParams.get('lon')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const varsStr = searchParams.get('vars')

    // 📍 Get coordinates from search or geocode
    let lat = latStr ? Number.parseFloat(latStr) : undefined
    let lon = lonStr ? Number.parseFloat(lonStr) : undefined
    let locationInfo: {
      name: string
      country?: string
      admin1?: string
      population?: number
      timezone?: string
    } = { name: cityName }

    if (lat === undefined || lon === undefined) {
      // 🔍 Geocode the city name
      const geocodedLocation = await searchLocation({
        data: { name: cityName, count: 1 },
      })

      if (!geocodedLocation) {
        throw notFound()
      }

      lat = geocodedLocation.latitude
      lon = geocodedLocation.longitude
      locationInfo = {
        name: geocodedLocation.name,
        country: geocodedLocation.country,
        admin1: geocodedLocation.admin1,
        population: geocodedLocation.population,
        timezone: geocodedLocation.timezone,
      }
    }

    // 📅 Get date range
    const defaultRange = getDefaultDateRange()
    const startDate = start || defaultRange.start
    const endDate = end || defaultRange.end

    // Parse variables
    const vars = varsStr
      ? varsStr.split(',').filter(Boolean)
      : [
          'temperature_2m_max',
          'temperature_2m_min',
          'temperature_2m_mean',
          'precipitation_sum',
          'wind_speed_10m_max',
        ]

    // 📊 Fetch historical data
    const response = await getHistoricalWeather({
      data: {
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
        daily: vars as HistoricalDailyWeatherVariable[],
        timezone: 'auto',
      },
    })

    return {
      slug: params.slug,
      data: response,
      location: locationInfo,
      coordinates: { lat, lon },
      dateRange: { start: startDate, end: endDate },
    }
  },

  // 🔄 Loader is declared above so `head` can be properly typed from `loaderData` 💡
  head: ({ loaderData }) => {
    const slug = loaderData?.slug ?? ''
    const name =
      loaderData?.location?.name ?? (slug ? parseCitySlug(slug) : 'City')
    const country = loaderData?.location?.country
    const place = country ? `${name}, ${country}` : name

    const start = loaderData?.dateRange?.start
    const end = loaderData?.dateRange?.end
    const rangeText = start && end ? ` (${start} to ${end})` : ''

    const canonical = slug
      ? `https://weathervibes.xyz/city/${slug}`
      : `https://weathervibes.xyz/city`

    const description = `Explore historical weather patterns for ${place}${rangeText}. View temperature trends, precipitation, and climate analysis from 1940 to present.`

    return {
      meta: [
        { title: `${place} Weather History | Weather Vibes` },
        { name: 'description', content: description },

        // 🔗 Canonical sharing hints
        { property: 'og:title', content: `${place} Weather History` },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { name: 'twitter:title', content: `${place} Weather History` },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: canonical }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: place,
            geo: loaderData?.coordinates
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: loaderData.coordinates.lat,
                  longitude: loaderData.coordinates.lon,
                }
              : undefined,
            containedInPlace: country
              ? { '@type': 'Country', name: country }
              : undefined,
            url: canonical,
          }),
        },
      ],
    }
  },

  component: CityComponent,
  notFoundComponent: CityNotFound,
})

function CityNotFound() {
  return (
    <Container className="py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">City Not Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't find the city you're looking for.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Container>
  )
}

function CityComponent() {
  const loaderData = Route.useLoaderData()
  const search = Route.useSearch() as CitySearch
  const params = Route.useParams()
  const navigate = useNavigate()
  const chartRef = useRef<HTMLDivElement>(null)

  // Extract loader data with type safety
  const data = loaderData?.data ?? null
  const location = loaderData?.location ?? { name: 'Unknown' }
  const coordinates = loaderData?.coordinates ?? { lat: 0, lon: 0 }
  const dateRange = loaderData?.dateRange ?? { start: '', end: '' }

  // Get variables from search with defaults
  const selectedVars: WeatherVariable[] = search.vars || [
    'temperature_2m_max',
    'temperature_2m_min',
  ]

  // 📊 Transform data
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
    const wind = chartData
      .map((d) => d.wind_speed_10m_max as number)
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
      avgWind: wind.length > 0 ? calculateStats(wind).mean : undefined,
    }
  }, [chartData])

  // 🔄 Handlers
  const handleDateChange = useCallback(
    (range: { start: string; end: string }) => {
      navigate({
        to: '/city/$slug',
        params: { slug: params.slug },
        search: serializeSearchParams({
          ...search,
          start: range.start,
          end: range.end,
        }),
      })
    },
    [navigate, search, params.slug],
  )

  const handleVariablesChange = useCallback(
    (vars: WeatherVariable[]) => {
      navigate({
        to: '/city/$slug',
        params: { slug: params.slug },
        search: serializeSearchParams({
          ...search,
          vars,
        }),
      })
    },
    [navigate, search, params.slug],
  )

  const handleChartTypeChange = useCallback(
    (chart: ChartType) => {
      navigate({
        to: '/city/$slug',
        params: { slug: params.slug },
        search: serializeSearchParams({
          ...search,
          chart,
        }),
      })
    },
    [navigate, search, params.slug],
  )

  const handleExport = useCallback(
    (format: 'png' | 'csv') => {
      if (format === 'csv') {
        exportChartToCsv(chartData, selectedVars, `weather-${location.name}`)
        toast.success('CSV exported')
      } else {
        exportChartToPng(chartRef.current, `weather-${location.name}`)
        toast.success('Chart exported')
      }
    },
    [chartData, selectedVars, location.name],
  )

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }, [])

  return (
    <Container className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 🏙️ Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl font-bold">{location.name}</h1>
              {location.country && (
                <Badge variant="secondary">{location.country}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {coordinates.lat.toFixed(2)}°, {coordinates.lon.toFixed(2)}°
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDisplayDate(dateRange.start)} -{' '}
                {formatDisplayDate(dateRange.end)}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* 🔧 Filters */}
        <div className="flex flex-wrap gap-3">
          <DateRangePicker value={dateRange} onChange={handleDateChange} />
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

        {/* 📊 Stats */}
        {stats && (
          <WeatherStats
            avgTemp={stats.avgTemp}
            maxTemp={stats.maxTemp}
            minTemp={stats.minTemp}
            totalPrecip={stats.totalPrecip}
            rainyDays={stats.rainyDays}
            avgWind={stats.avgWind}
          />
        )}

        {/* 📈 Charts */}
        <div ref={chartRef}>
          <Tabs defaultValue="temperature" className="space-y-4">
            <TabsList>
              <TabsTrigger value="temperature">🌡️ Temperature</TabsTrigger>
              <TabsTrigger value="precipitation">🌧️ Precipitation</TabsTrigger>
              <TabsTrigger value="table">📋 Data</TabsTrigger>
            </TabsList>

            <TabsContent value="temperature">
              <TemperatureChart
                data={chartData}
                title={`${location.name} Temperature`}
                height={400}
                showRange
                showMean
              />
            </TabsContent>

            <TabsContent value="precipitation">
              <PrecipitationChart
                data={chartData}
                title={`${location.name} Precipitation`}
                height={400}
              />
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Daily Weather Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeatherTable data={chartData} variables={selectedVars} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </Container>
  )
}
