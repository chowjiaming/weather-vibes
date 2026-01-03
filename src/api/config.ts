/**
 * 🌐 Open-Meteo API Configuration
 * Base URLs and default settings for all Open-Meteo API endpoints
 */

export const API_ENDPOINTS = {
  /** Weather forecast API */
  forecast: 'https://api.open-meteo.com/v1/forecast',
  /** Historical weather archive API */
  historical: 'https://archive-api.open-meteo.com/v1/archive',
  /** Ensemble weather forecasts */
  ensemble: 'https://ensemble-api.open-meteo.com/v1/ensemble',
  /** Seasonal forecasts */
  seasonal: 'https://seasonal-api.open-meteo.com/v1/seasonal',
  /** Marine weather */
  marine: 'https://marine-api.open-meteo.com/v1/marine',
  /** Air quality */
  airQuality: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  /** Flood/river discharge */
  flood: 'https://flood-api.open-meteo.com/v1/flood',
  /** Geocoding search */
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  /** Elevation lookup */
  elevation: 'https://api.open-meteo.com/v1/elevation',
} as const

/**
 * Default timezone setting
 * 'auto' resolves timezone from coordinates
 */
export const DEFAULT_TIMEZONE = 'auto'

/**
 * Default time format
 */
export const DEFAULT_TIME_FORMAT = 'iso8601'

/**
 * Default temperature unit
 */
export const DEFAULT_TEMPERATURE_UNIT = 'celsius'

/**
 * Default wind speed unit
 */
export const DEFAULT_WIND_SPEED_UNIT = 'kmh'

/**
 * Default precipitation unit
 */
export const DEFAULT_PRECIPITATION_UNIT = 'mm'

/**
 * Rate limiting info (for reference)
 * Free tier limits:
 * - ~600 calls/minute
 * - ~5,000 calls/hour
 * - ~10,000 calls/day
 * - ~300,000 calls/month
 */
export const RATE_LIMITS = {
  perMinute: 600,
  perHour: 5000,
  perDay: 10000,
  perMonth: 300000,
} as const
