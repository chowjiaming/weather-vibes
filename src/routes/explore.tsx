/**
 * 🧭 Explore Route
 * Spatial map-first experience with weather data panels
 * Includes contextual panels (marine, flood) based on location
 */
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { z } from 'zod'

import {
  getAirQuality,
  getFloodData,
  getHistoricalWeather,
  getMarineWeather,
  getWeatherForecast,
} from '@/api'
import type { HistoricalDailyWeatherVariable } from '@/api/types'
import { MapCanvas, type MapCanvasHandle, MapMarker } from '@/components/map'
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
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    // 📍 If we have coordinates, fetch weather data
    if (search.lat && search.lon) {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 7) // Last 7 days

      const isCoastal = isCoastalLocation(search.lat, search.lon)
      const isRiverine = isRiverineLocation(search.lat, search.lon)

      try {
        // Base data fetches
        const basePromises = [
          getHistoricalWeather({
            data: {
              latitude: search.lat,
              longitude: search.lon,
              start_date: formatDate(startDate),
              end_date: formatDate(today),
              daily: [
                'temperature_2m_max',
                'temperature_2m_min',
                'temperature_2m_mean',
                'precipitation_sum',
                'wind_speed_10m_max',
              ] as HistoricalDailyWeatherVariable[],
              timezone: 'auto',
            },
          }),
          getWeatherForecast({
            data: {
              latitude: search.lat,
              longitude: search.lon,
              daily: [
                'temperature_2m_max',
                'temperature_2m_min',
                'weather_code',
                'precipitation_sum',
              ],
              timezone: 'auto',
            },
          }),
          getAirQuality({
            data: {
              latitude: search.lat,
              longitude: search.lon,
              current: [
                'european_aqi',
                'pm2_5',
                'pm10',
                'nitrogen_dioxide',
                'ozone',
              ],
            },
          }),
        ]

        // Contextual data fetches
        const marinePromise = isCoastal
          ? getMarineWeather({
              data: {
                latitude: search.lat,
                longitude: search.lon,
                hourly: [
                  'wave_height',
                  'wave_period',
                  'wave_direction',
                  'ocean_current_velocity',
                  'ocean_current_direction',
                ],
                daily: ['wave_height_max', 'wave_period_max'],
              },
            }).catch(() => null)
          : Promise.resolve(null)

        const floodPromise = isRiverine
          ? getFloodData({
              data: {
                latitude: search.lat,
                longitude: search.lon,
                daily: [
                  'river_discharge',
                  'river_discharge_max',
                  'river_discharge_mean',
                ],
              },
            }).catch(() => null)
          : Promise.resolve(null)

        const [historical, forecast, airQuality, marine, flood] =
          await Promise.all([...basePromises, marinePromise, floodPromise])

        return {
          location: search.q,
          coordinates: { lat: search.lat, lon: search.lon },
          historical,
          forecast,
          airQuality,
          marine,
          flood,
          isCoastal,
          isRiverine,
        }
      } catch {
        return {
          location: search.q,
          coordinates: { lat: search.lat, lon: search.lon },
          historical: null,
          forecast: null,
          airQuality: null,
          marine: null,
          flood: null,
          isCoastal,
          isRiverine,
        }
      }
    }

    return {
      location: null,
      coordinates: null,
      historical: null,
      forecast: null,
      airQuality: null,
      marine: null,
      flood: null,
      isCoastal: false,
      isRiverine: false,
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
  const {
    location,
    coordinates,
    historical,
    forecast,
    airQuality,
    marine,
    flood,
    isCoastal,
    isRiverine,
  } = Route.useLoaderData()
  const mapRef = useRef<MapCanvasHandle>(null)
  const [selectedLocation, setSelectedLocation] = useState(coordinates)

  // 🎯 Handle map location selection
  const handleLocationSelect = useCallback(
    (loc: { lng: number; lat: number }) => {
      setSelectedLocation({ lat: loc.lat, lon: loc.lng })
    },
    [],
  )

  // 📊 Prepare weather data (ensure numeric types)
  const currentWeather = historical?.daily
    ? {
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
    : undefined

  const forecastData = forecast?.daily?.time?.map((date, i) => ({
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

  const airQualityData = airQuality?.current
    ? {
        aqi: Number(airQuality.current.european_aqi ?? 0),
        pm25:
          airQuality.current.pm2_5 !== undefined
            ? Number(airQuality.current.pm2_5)
            : undefined,
        pm10:
          airQuality.current.pm10 !== undefined
            ? Number(airQuality.current.pm10)
            : undefined,
        no2:
          airQuality.current.nitrogen_dioxide !== undefined
            ? Number(airQuality.current.nitrogen_dioxide)
            : undefined,
        o3:
          airQuality.current.ozone !== undefined
            ? Number(airQuality.current.ozone)
            : undefined,
      }
    : undefined

  // 🌊 Marine data
  const marineData = marine?.hourly
    ? {
        waveHeight:
          marine.hourly.wave_height?.[0] !== undefined
            ? Number(marine.hourly.wave_height[0])
            : undefined,
        wavePeriod:
          marine.hourly.wave_period?.[0] !== undefined
            ? Number(marine.hourly.wave_period[0])
            : undefined,
        waveDirection:
          marine.hourly.wave_direction?.[0] !== undefined
            ? Number(marine.hourly.wave_direction[0])
            : undefined,
        currentSpeed:
          marine.hourly.ocean_current_velocity?.[0] !== undefined
            ? Number(marine.hourly.ocean_current_velocity[0])
            : undefined,
        currentDirection:
          marine.hourly.ocean_current_direction?.[0] !== undefined
            ? Number(marine.hourly.ocean_current_direction[0])
            : undefined,
      }
    : undefined

  // 🌊 Flood data
  const floodData = flood?.daily
    ? {
        riverDischarge:
          flood.daily.river_discharge?.[0] !== undefined
            ? Number(flood.daily.river_discharge[0])
            : undefined,
        riverDischargeMax:
          flood.daily.river_discharge_max?.[0] !== undefined
            ? Number(flood.daily.river_discharge_max[0])
            : undefined,
        riverDischargeMean:
          flood.daily.river_discharge_mean?.[0] !== undefined
            ? Number(flood.daily.river_discharge_mean[0])
            : undefined,
      }
    : undefined

  // 📊 Calculate stats from historical data
  const chartData = historical?.daily
    ? transformWeatherData(historical, [
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'precipitation_sum',
        'wind_speed_10m_max',
      ])
    : []
  const stats =
    chartData.length > 0
      ? calculateStats(chartData, 'temperature_2m_mean')
      : null

  return (
    <div className="relative h-full w-full">
      {/* 🗺️ Map canvas (full-screen background) */}
      <MapCanvas
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
      </MapCanvas>

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
              isLoading={!historical}
              colSpan={3}
              animationDelay={0}
            />

            {/* 🌬️ Air quality */}
            <AirQualityPanel
              data={airQualityData}
              isLoading={!airQuality}
              colSpan={3}
              animationDelay={1}
            />

            {/* 📅 Forecast */}
            <ForecastPanel
              data={forecastData}
              isLoading={!forecast}
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
              data={marineData}
              isLoading={!marine && isCoastal}
              visible={isCoastal}
              colSpan={3}
              animationDelay={4}
            />

            {/* 🌊 Flood panel (riverine locations only) */}
            <FloodPanel
              data={floodData}
              isLoading={!flood && isRiverine}
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
