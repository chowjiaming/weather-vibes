/**
 * 🧭 Explore Route
 * Spatial map-first experience with weather data panels
 * Includes contextual panels (marine, flood) based on location
 *
 * 🔄 Performance: Uses TanStack Query for client-side caching
 * 🌍 Default: Auto-detects user region via timezone
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import type { HistoricalDailyWeatherVariable } from '@/api/types'
import {
  LazyMapCanvas,
  LocationButton,
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
import { getDefaultLocation } from '@/lib/default-locations'
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

  // 🌍 Get regional default based on user's timezone
  const defaultLocation = useMemo(() => getDefaultLocation(), [])

  // 📍 Use URL params if provided, otherwise use regional default
  const hasUrlParams = lat !== undefined && lon !== undefined
  const effectiveLat = hasUrlParams ? lat : defaultLocation.lat
  const effectiveLon = hasUrlParams ? lon : defaultLocation.lon
  const effectiveLocation = hasUrlParams
    ? location
    : `${defaultLocation.name}, ${defaultLocation.country}`

  // 📍 Selected location state (used for marker display)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lon: number
  } | null>(hasUrlParams ? { lat, lon } : null)

  // 🔄 Initialize with default on client-side mount
  useEffect(() => {
    if (!hasUrlParams && selectedLocation === null) {
      setSelectedLocation({
        lat: defaultLocation.lat,
        lon: defaultLocation.lon,
      })
    }
  }, [hasUrlParams, selectedLocation, defaultLocation])

  // 🌊 Determine location type for contextual data
  const isCoastal = isCoastalLocation(effectiveLat, effectiveLon)
  const isRiverine = isRiverineLocation(effectiveLat, effectiveLon)

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
  // Always enabled now since we have default location
  const { data: historical, isLoading: historicalLoading } =
    useHistoricalWeather({
      latitude: effectiveLat,
      longitude: effectiveLon,
      startDate,
      endDate,
      variables: [
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'precipitation_sum',
        'wind_speed_10m_max',
      ] as HistoricalDailyWeatherVariable[],
      enabled: true, // Always fetch - we have default location
    })

  const { data: forecast, isLoading: forecastLoading } = useForecast({
    latitude: effectiveLat,
    longitude: effectiveLon,
    enabled: true,
  })

  const { data: airQuality, isLoading: airQualityLoading } = useAirQuality({
    latitude: effectiveLat,
    longitude: effectiveLon,
    enabled: true,
  })

  const { data: marine, isLoading: marineLoading } = useMarineWeather({
    latitude: effectiveLat,
    longitude: effectiveLon,
    enabled: isCoastal,
  })

  const { data: flood, isLoading: floodLoading } = useFloodData({
    latitude: effectiveLat,
    longitude: effectiveLon,
    enabled: isRiverine,
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
        center={[effectiveLon, effectiveLat]}
        zoom={hasUrlParams ? 10 : 6}
        onLocationSelect={handleLocationSelect}
      >
        {/* 📍 Location marker */}
        <MapMarker
          longitude={effectiveLon}
          latitude={effectiveLat}
          label={effectiveLocation ?? undefined}
          variant="selected"
          size="lg"
        />
      </LazyMapCanvas>

      {/* 📍 Floating geolocation button */}
      <LocationButton />

      {/* 📊 Bento panel overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute bottom-4 left-4 right-4 z-10"
      >
        <BentoGrid columns={12} gap="md" className="max-w-7xl mx-auto">
          {/* 🌡️ Current weather */}
          <WeatherPanel
            location={effectiveLocation ?? 'Loading...'}
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
      </motion.div>
    </div>
  )
}
