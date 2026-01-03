/**
 * 🧭 Explore Route
 * Spatial map-first experience with weather data panels
 * Includes contextual panels (marine, flood) based on location
 *
 * 🔄 Performance: Uses TanStack Query for client-side caching
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import type { HistoricalDailyWeatherVariable } from '@/api/types'
import {
  LazyMapCanvas,
  type MapCanvasHandle,
  MapMarker,
} from '@/components/map'
import {
  AirQualityPanel,
  BentoGrid,
  FloodPanel,
  ForecastPanel,
  MarinePanel,
  StatsPanel,
  WeatherPanel,
} from '@/components/panels'
import {
  extractAirQualityData,
  extractFloodData,
  extractMarineData,
  useAirQuality,
  useFloodData,
  useForecast,
  useHistoricalWeather,
  useMarineWeather,
} from '@/hooks/queries'
import {
  calculateStats,
  formatDate,
  transformWeatherData,
} from '@/lib/weather-utils'

// 🔍 Search params schema
const exploreSearchSchema = z.object({
  q: z.string().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
})

// 🌊 Check if location is coastal (simple heuristic based on proximity to known coastal areas)
function isCoastalLocation(lat: number, lon: number): boolean {
  // Simplified: locations near major coasts
  // In production, this would use a proper coastline dataset
  const coastalRegions = [
    { latMin: 25, latMax: 50, lonMin: -130, lonMax: -115 }, // US West Coast
    { latMin: 25, latMax: 48, lonMin: -82, lonMax: -65 }, // US East Coast
    { latMin: -45, latMax: -10, lonMin: 110, lonMax: 155 }, // Australia
    { latMin: 50, latMax: 60, lonMin: -10, lonMax: 5 }, // UK
    { latMin: 30, latMax: 45, lonMin: 125, lonMax: 145 }, // Japan
  ]

  return coastalRegions.some(
    (r) =>
      lat >= r.latMin && lat <= r.latMax && lon >= r.lonMin && lon <= r.lonMax,
  )
}

// 🏞️ Check if location is near a major river
function isRiverineLocation(lat: number, lon: number): boolean {
  // Simplified: locations near major river systems
  const riverRegions = [
    { latMin: 29, latMax: 50, lonMin: -95, lonMax: -88 }, // Mississippi
    { latMin: 45, latMax: 55, lonMin: -5, lonMax: 15 }, // Rhine/Danube region
    { latMin: 20, latMax: 35, lonMin: 75, lonMax: 95 }, // Ganges/Brahmaputra
    { latMin: 25, latMax: 45, lonMin: 100, lonMax: 125 }, // Yangtze/Yellow River
  ]

  return riverRegions.some(
    (r) =>
      lat >= r.latMin && lat <= r.latMax && lon >= r.lonMin && lon <= r.lonMax,
  )
}

export const Route = createFileRoute('/explore')({
  validateSearch: exploreSearchSchema,

  // 🔄 Loader to make search params available in head
  loader: ({ location }) => {
    const searchParams = new URLSearchParams(location.search)
    return {
      location: searchParams.get('q') || null,
    }
  },

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.location
          ? `${loaderData.location} Weather | Weather Vibes`
          : 'Explore | Weather Vibes',
      },
      {
        name: 'description',
        content: loaderData?.location
          ? `Explore weather data for ${loaderData.location}`
          : 'Explore weather patterns and climate data for any location',
      },
    ],
  }),

  component: ExplorePage,
})

function ExplorePage() {
  const { q: location, lat, lon } = Route.useSearch()
  const navigate = useNavigate()
  const mapRef = useRef<MapCanvasHandle>(null)

  // 📍 Derived state for coordinates
  const coordinates = lat && lon ? { lat, lon } : null
  const [selectedLocation, setSelectedLocation] = useState(coordinates)

  // 🌊 Determine location type for contextual data
  const isCoastal = lat && lon ? isCoastalLocation(lat, lon) : false
  const isRiverine = lat && lon ? isRiverineLocation(lat, lon) : false

  // 📅 Date range for historical data (last 7 days)
  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 7)
    return {
      startDate: formatDate(start),
      endDate: formatDate(today),
    }
  }, [])

  // 🔄 TanStack Query hooks with caching
  const { data: historical, isLoading: historicalLoading } =
    useHistoricalWeather({
      latitude: lat ?? 0,
      longitude: lon ?? 0,
      startDate,
      endDate,
      variables: [
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'precipitation_sum',
        'wind_speed_10m_max',
      ] as HistoricalDailyWeatherVariable[],
      enabled: !!lat && !!lon,
    })

  const { data: forecast, isLoading: forecastLoading } = useForecast({
    latitude: lat ?? 0,
    longitude: lon ?? 0,
    enabled: !!lat && !!lon,
  })

  const { data: airQuality, isLoading: airQualityLoading } = useAirQuality({
    latitude: lat ?? 0,
    longitude: lon ?? 0,
    enabled: !!lat && !!lon,
  })

  const { data: marine, isLoading: marineLoading } = useMarineWeather({
    latitude: lat ?? 0,
    longitude: lon ?? 0,
    enabled: !!lat && !!lon && isCoastal,
  })

  const { data: flood, isLoading: floodLoading } = useFloodData({
    latitude: lat ?? 0,
    longitude: lon ?? 0,
    enabled: !!lat && !!lon && isRiverine,
  })

  // 🎯 Handle map location selection - navigate to update URL
  const handleLocationSelect = useCallback(
    (loc: { lng: number; lat: number }) => {
      setSelectedLocation({ lat: loc.lat, lon: loc.lng })
      navigate({
        to: '/explore',
        search: { lat: loc.lat, lon: loc.lng },
      })
    },
    [navigate],
  )

  // 📊 Prepare weather data (ensure numeric types)
  const currentWeather = useMemo(() => {
    if (!historical?.daily) return undefined
    return {
      temperature: Number(historical.daily.temperature_2m_mean?.[0] ?? 0),
      apparentTemperature:
        historical.daily.temperature_2m_max?.[0] !== undefined
          ? Number(historical.daily.temperature_2m_max[0])
          : undefined,
      humidity: undefined,
      windSpeed:
        historical.daily.wind_speed_10m_max?.[0] !== undefined
          ? Number(historical.daily.wind_speed_10m_max[0])
          : undefined,
      precipitation:
        historical.daily.precipitation_sum?.[0] !== undefined
          ? Number(historical.daily.precipitation_sum[0])
          : undefined,
    }
  }, [historical])

  const forecastData = useMemo(() => {
    return forecast?.daily?.time?.map((date, i) => ({
      date: String(date),
      tempMax: Number(forecast.daily?.temperature_2m_max?.[i] ?? 0),
      tempMin: Number(forecast.daily?.temperature_2m_min?.[i] ?? 0),
      weatherCode:
        forecast.daily?.weather_code?.[i] !== undefined
          ? Number(forecast.daily.weather_code[i])
          : undefined,
      precipitation:
        forecast.daily?.precipitation_sum?.[i] !== undefined
          ? Number(forecast.daily.precipitation_sum[i])
          : undefined,
    }))
  }, [forecast])

  // 💨 Air quality data (extracted via helper)
  const airQualityData = useMemo(
    () => extractAirQualityData(airQuality?.current),
    [airQuality],
  )

  // 🌊 Marine data (extracted via helper)
  const marineData = useMemo(() => extractMarineData(marine?.hourly), [marine])

  // 🌊 Flood data (extracted via helper)
  const floodData = useMemo(() => extractFloodData(flood?.daily), [flood])

  // 📊 Calculate stats from historical data
  const stats = useMemo(() => {
    const data = historical?.daily
      ? transformWeatherData(historical, [
          'temperature_2m_max',
          'temperature_2m_min',
          'temperature_2m_mean',
          'precipitation_sum',
          'wind_speed_10m_max',
        ])
      : []
    return data.length > 0 ? calculateStats(data, 'temperature_2m_mean') : null
  }, [historical])

  return (
    <div className="relative h-full w-full">
      {/* 🗺️ Map canvas (full-screen background) */}
      <LazyMapCanvas
        ref={mapRef}
        center={coordinates ? [coordinates.lon, coordinates.lat] : undefined}
        zoom={coordinates ? 10 : 4}
        onLocationSelect={handleLocationSelect}
      >
        {/* 📍 Selected location marker */}
        {selectedLocation && (
          <MapMarker
            longitude={selectedLocation.lon}
            latitude={selectedLocation.lat}
            label={location ?? undefined}
            variant="selected"
            size="lg"
          />
        )}
      </LazyMapCanvas>

      {/* 📊 Bento panel overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute bottom-4 left-4 right-4 z-10"
      >
        {coordinates ? (
          <BentoGrid columns={12} gap="md" className="max-w-7xl mx-auto">
            {/* 🌡️ Current weather */}
            <WeatherPanel
              location={location ?? 'Selected Location'}
              data={currentWeather}
              isLoading={historicalLoading}
              colSpan={3}
              animationDelay={0}
            />

            {/* 🌬️ Air quality */}
            <AirQualityPanel
              data={airQualityData ?? undefined}
              isLoading={airQualityLoading}
              colSpan={3}
              animationDelay={1}
            />

            {/* 📅 Forecast */}
            <ForecastPanel
              data={forecastData}
              isLoading={forecastLoading}
              colSpan="half"
              animationDelay={2}
            />

            {/* 📊 Stats */}
            {stats && (
              <StatsPanel
                title="7-Day Summary"
                stats={[
                  {
                    label: 'Avg Temp',
                    value: stats.avg.toFixed(1),
                    unit: '°C',
                  },
                  { label: 'Max', value: stats.max.toFixed(1), unit: '°C' },
                  { label: 'Min', value: stats.min.toFixed(1), unit: '°C' },
                  {
                    label: 'Range',
                    value: (stats.max - stats.min).toFixed(1),
                    unit: '°C',
                  },
                ]}
                colSpan={isCoastal || isRiverine ? 3 : 4}
                columns={isCoastal || isRiverine ? 2 : 4}
                animationDelay={3}
              />
            )}

            {/* 🌊 Marine panel (coastal locations only) */}
            <MarinePanel
              data={marineData ?? undefined}
              isLoading={marineLoading}
              visible={isCoastal}
              colSpan={3}
              animationDelay={4}
            />

            {/* 🌊 Flood panel (riverine locations only) */}
            <FloodPanel
              data={floodData ?? undefined}
              isLoading={floodLoading}
              visible={isRiverine}
              colSpan={3}
              animationDelay={5}
            />
          </BentoGrid>
        ) : (
          // 🏠 Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md mx-auto text-center"
          >
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Explore Weather Data
            </h2>
            <p className="text-muted-foreground mb-4">
              Search for a city or click anywhere on the map to explore weather
              patterns and climate data.
            </p>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>{' '}
              to search
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
