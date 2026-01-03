/**
 * 🌦️ Open-Meteo API - Main Export
 * All server functions for weather data access
 */

// ============================================================================
// Server Functions - Air Quality
// ============================================================================
export {
  getAirQuality,
  getCurrentAirQuality,
  getPollenForecast,
} from './air-quality'
// Client utilities
export {
  buildQueryString,
  buildUrl,
  fetchFromApi,
  formatDate,
  getDaysAgo,
  getDaysFromNow,
  OpenMeteoError,
  validateDateRange,
} from './client'
// Configuration
export { API_ENDPOINTS, RATE_LIMITS } from './config'
// ============================================================================
// Server Functions - Ensemble Forecasts
// ============================================================================
export { getEnsembleForecast, getPrecipitationProbability } from './ensemble'
// ============================================================================
// Server Functions - Flood/River Discharge
// ============================================================================
export { getFloodData, getRiverDischarge } from './flood'
// ============================================================================
// Server Functions - Weather Forecast
// ============================================================================
export {
  getCurrentWeather,
  getHourlyForecast,
  getWeatherForecast,
  getWeeklyForecast,
} from './forecast'
// ============================================================================
// Server Functions - Geocoding
// ============================================================================
export { searchLocation, searchLocations } from './geocoding'

// ============================================================================
// Server Functions - Historical Weather
// ============================================================================
export {
  compareHistoricalDates,
  getHistoricalWeather,
  getRecentHistoricalWeather,
  getYearOverYearComparison,
} from './historical'
// ============================================================================
// Server Functions - Marine Weather
// ============================================================================
export { getMarineWeather, getSurfConditions } from './marine'
// Schema inferred types
export type {
  AirQualityInput,
  ElevationInput,
  EnsembleInput,
  FloodInput,
  ForecastInput,
  GeocodingSearchInput,
  HistoricalWeatherInput,
  MarineWeatherInput,
  SeasonalInput,
} from './schemas'
// Schemas (for client-side validation if needed)
export {
  airQualitySchema,
  coordinatesSchema,
  dateSchema,
  ensembleSchema,
  floodSchema,
  forecastSchema,
  geocodingSearchSchema,
  historicalWeatherSchema,
  marineWeatherSchema,
  seasonalSchema,
} from './schemas'
// ============================================================================
// Server Functions - Seasonal Forecasts
// ============================================================================
export { getSeasonalForecast, getSeasonalOutlook } from './seasonal'
// Types
export type {
  AirQualityVariable,
  ApiErrorResponse,
  ApiResponseMetadata,
  CellSelection,
  Coordinates,
  CurrentData,
  CurrentWeatherVariable,
  DailyData,
  DailyWeatherVariable,
  EnsembleModel,
  FloodModel,
  FloodVariable,
  GeocodingResponse,
  GeocodingResult,
  HistoricalModel,
  HistoricalWeatherParams,
  HourlyData,
  HourlyWeatherVariable,
  MarineDailyVariable,
  MarineHourlyVariable,
  PrecipitationUnit,
  SeasonalDailyVariable,
  SeasonalModel,
  TemperatureUnit,
  TimeFormat,
  UnitsMap,
  WaveHeightUnit,
  WeatherResponse,
  WindSpeedUnit,
} from './types'
