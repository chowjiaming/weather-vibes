/**
 * 🔄 Query Hooks
 * TanStack Query wrappers for all API calls with optimized caching
 */

// 💨 Air Quality
export {
  type AirQualityData,
  extractAirQualityData,
  type UseAirQualityOptions,
  useAirQuality,
} from './use-air-quality-query'

// 🌍 Geocoding
export {
  createLocationSlug,
  formatLocationName,
  type UseGeocodingSearchOptions,
  useGeocodingSearch,
  usePrefetchGeocoding,
} from './use-geocoding-query'

// 🌊 Marine & Flood
export {
  extractFloodData,
  extractMarineData,
  type FloodData,
  type MarineData,
  type UseFloodDataOptions,
  type UseMarineWeatherOptions,
  useFloodData,
  useMarineWeather,
} from './use-marine-query'

// 🌡️ Weather
export {
  type UseForecastOptions,
  type UseHistoricalWeatherOptions,
  useForecast,
  useHistoricalWeather,
  usePrefetchWeather,
} from './use-weather-queries'
