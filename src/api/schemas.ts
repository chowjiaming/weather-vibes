/**
 * 📋 Zod Schemas for Open-Meteo API Validation
 * Input validation for all API endpoints
 */

import { z } from 'zod'

// ============================================================================
// Base Schemas
// ============================================================================

/** Coordinates schema */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

/** Date string schema (YYYY-MM-DD) */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

/** Temperature unit schema */
export const temperatureUnitSchema = z.enum(['celsius', 'fahrenheit'])

/** Wind speed unit schema */
export const windSpeedUnitSchema = z.enum(['kmh', 'ms', 'mph', 'kn'])

/** Precipitation unit schema */
export const precipitationUnitSchema = z.enum(['mm', 'inch'])

/** Time format schema */
export const timeFormatSchema = z.enum(['iso8601', 'unixtime'])

/** Cell selection schema */
export const cellSelectionSchema = z.enum(['land', 'sea', 'nearest'])

/** Wave height unit schema */
export const waveHeightUnitSchema = z.enum(['m', 'ft'])

// ============================================================================
// Common Options Schema
// ============================================================================

/** Common unit options */
export const unitOptionsSchema = z.object({
  temperature_unit: temperatureUnitSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  precipitation_unit: precipitationUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
})

// ============================================================================
// Geocoding Schemas
// ============================================================================

/** Geocoding search parameters */
export const geocodingSearchSchema = z.object({
  name: z.string().min(1).max(200),
  count: z.number().int().min(1).max(100).optional().default(10),
  language: z.string().length(2).optional(),
  format: z.enum(['json', 'csv', 'xlsx']).optional(),
})

// ============================================================================
// Forecast API Schemas
// ============================================================================

/** Hourly weather variables */
export const hourlyVariablesSchema = z.array(
  z.enum([
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'snow_depth',
    'weather_code',
    'pressure_msl',
    'surface_pressure',
    'cloud_cover',
    'cloud_cover_low',
    'cloud_cover_mid',
    'cloud_cover_high',
    'visibility',
    'evapotranspiration',
    'et0_fao_evapotranspiration',
    'vapour_pressure_deficit',
    'wind_speed_10m',
    'wind_speed_80m',
    'wind_speed_120m',
    'wind_speed_180m',
    'wind_direction_10m',
    'wind_direction_80m',
    'wind_direction_120m',
    'wind_direction_180m',
    'wind_gusts_10m',
    'soil_temperature_0cm',
    'soil_temperature_6cm',
    'soil_temperature_18cm',
    'soil_temperature_54cm',
    'soil_moisture_0_to_1cm',
    'soil_moisture_1_to_3cm',
    'soil_moisture_3_to_9cm',
    'soil_moisture_9_to_27cm',
    'soil_moisture_27_to_81cm',
    'shortwave_radiation',
    'direct_radiation',
    'diffuse_radiation',
    'direct_normal_irradiance',
    'global_tilted_irradiance',
    'terrestrial_radiation',
    'is_day',
    'sunshine_duration',
    'cape',
    'lifted_index',
    'convective_inhibition',
  ]),
)

/** Daily weather variables */
export const dailyVariablesSchema = z.array(
  z.enum([
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'daylight_duration',
    'sunshine_duration',
    'uv_index_max',
    'uv_index_clear_sky_max',
    'precipitation_sum',
    'rain_sum',
    'showers_sum',
    'snowfall_sum',
    'precipitation_hours',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
    'shortwave_radiation_sum',
    'et0_fao_evapotranspiration',
  ]),
)

/** Current weather variables */
export const currentVariablesSchema = z.array(
  z.enum([
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
  ]),
)

/** Forecast request schema */
export const forecastSchema = coordinatesSchema.extend({
  hourly: hourlyVariablesSchema.optional(),
  daily: dailyVariablesSchema.optional(),
  current: currentVariablesSchema.optional(),
  temperature_unit: temperatureUnitSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  precipitation_unit: precipitationUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
  past_days: z.number().int().min(0).max(92).optional(),
  forecast_days: z.number().int().min(0).max(16).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  models: z.string().optional(),
  cell_selection: cellSelectionSchema.optional(),
})

// ============================================================================
// Historical Weather Schemas
// ============================================================================

/** Historical model options */
export const historicalModelSchema = z.enum([
  'best_match',
  'ecmwf_ifs',
  'era5',
  'era5_land',
  'era5_ensemble',
  'cerra',
])

/** Historical weather request schema */
export const historicalWeatherSchema = coordinatesSchema.extend({
  start_date: dateSchema,
  end_date: dateSchema,
  hourly: hourlyVariablesSchema.optional(),
  daily: dailyVariablesSchema.optional(),
  temperature_unit: temperatureUnitSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  precipitation_unit: precipitationUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
  models: z
    .union([historicalModelSchema, z.array(historicalModelSchema)])
    .optional(),
})

// ============================================================================
// Marine Weather Schemas
// ============================================================================

/** Marine hourly variables */
export const marineHourlyVariablesSchema = z.array(
  z.enum([
    'wave_height',
    'wave_direction',
    'wave_period',
    'wind_wave_height',
    'wind_wave_direction',
    'wind_wave_period',
    'wind_wave_peak_period',
    'swell_wave_height',
    'swell_wave_direction',
    'swell_wave_period',
    'swell_wave_peak_period',
    'ocean_current_velocity',
    'ocean_current_direction',
  ]),
)

/** Marine daily variables */
export const marineDailyVariablesSchema = z.array(
  z.enum([
    'wave_height_max',
    'wave_direction_dominant',
    'wave_period_max',
    'wind_wave_height_max',
    'wind_wave_direction_dominant',
    'wind_wave_period_max',
    'wind_wave_peak_period_max',
    'swell_wave_height_max',
    'swell_wave_direction_dominant',
    'swell_wave_period_max',
    'swell_wave_peak_period_max',
  ]),
)

/** Marine weather request schema */
export const marineWeatherSchema = coordinatesSchema.extend({
  hourly: marineHourlyVariablesSchema.optional(),
  daily: marineDailyVariablesSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  wave_height_unit: waveHeightUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
  past_days: z.number().int().min(0).max(92).optional(),
  forecast_days: z.number().int().min(0).max(16).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
})

// ============================================================================
// Air Quality Schemas
// ============================================================================

/** Air quality variables */
export const airQualityVariablesSchema = z.array(
  z.enum([
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
    'aerosol_optical_depth',
    'dust',
    'uv_index',
    'uv_index_clear_sky',
    'ammonia',
    'alder_pollen',
    'birch_pollen',
    'grass_pollen',
    'mugwort_pollen',
    'olive_pollen',
    'ragweed_pollen',
    'european_aqi',
    'us_aqi',
    'european_aqi_pm2_5',
    'european_aqi_pm10',
    'european_aqi_nitrogen_dioxide',
    'european_aqi_ozone',
    'european_aqi_sulphur_dioxide',
    'us_aqi_pm2_5',
    'us_aqi_pm10',
    'us_aqi_nitrogen_dioxide',
    'us_aqi_ozone',
    'us_aqi_sulphur_dioxide',
    'us_aqi_carbon_monoxide',
  ]),
)

/** Air quality request schema */
export const airQualitySchema = coordinatesSchema.extend({
  hourly: airQualityVariablesSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
  past_days: z.number().int().min(0).max(92).optional(),
  forecast_days: z.number().int().min(0).max(7).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
})

// ============================================================================
// Flood API Schemas
// ============================================================================

/** Flood variables */
export const floodVariablesSchema = z.array(
  z.enum([
    'river_discharge',
    'river_discharge_mean',
    'river_discharge_median',
    'river_discharge_max',
    'river_discharge_min',
    'river_discharge_p25',
    'river_discharge_p75',
  ]),
)

/** Flood model options */
export const floodModelSchema = z.enum([
  'glofas_v4_seamless',
  'glofas_v4_forecast',
  'glofas_v4_consolidated',
  'glofas_v3_seamless',
  'glofas_v3_forecast',
  'glofas_v3_consolidated',
])

/** Flood request schema */
export const floodSchema = coordinatesSchema.extend({
  daily: floodVariablesSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  past_days: z.number().int().min(0).optional(),
  forecast_days: z.number().int().min(0).max(210).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  ensemble: z.boolean().optional(),
  models: z.union([floodModelSchema, z.array(floodModelSchema)]).optional(),
  cell_selection: cellSelectionSchema.optional(),
})

// ============================================================================
// Ensemble API Schemas
// ============================================================================

/** Ensemble model options */
export const ensembleModelSchema = z.enum([
  'icon_seamless',
  'icon_global',
  'icon_eu',
  'icon_d2',
  'gfs_seamless',
  'gfs025',
  'gfs05',
  'ecmwf_ifs025_ensemble',
  'ecmwf_ifs04_ensemble',
  'gem_global_ensemble',
  'bom_access_global_ensemble',
])

/** Ensemble request schema */
export const ensembleSchema = coordinatesSchema.extend({
  models: z.union([ensembleModelSchema, z.array(ensembleModelSchema)]),
  hourly: hourlyVariablesSchema.optional(),
  daily: dailyVariablesSchema.optional(),
  temperature_unit: temperatureUnitSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  precipitation_unit: precipitationUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
  past_days: z.number().int().min(0).optional(),
  forecast_days: z.number().int().min(0).max(35).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  cell_selection: cellSelectionSchema.optional(),
})

// ============================================================================
// Seasonal API Schemas
// ============================================================================

/** Seasonal model options */
export const seasonalModelSchema = z.enum([
  'ecmwf_seasonal_seamless',
  'ecmwf_seas5',
  'ecmwf_ec46',
])

/** Seasonal daily variables */
export const seasonalDailyVariablesSchema = z.array(
  z.enum([
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'wind_speed_10m_max',
  ]),
)

/** Seasonal request schema */
export const seasonalSchema = coordinatesSchema.extend({
  models: z
    .union([seasonalModelSchema, z.array(seasonalModelSchema)])
    .optional(),
  daily: seasonalDailyVariablesSchema.optional(),
  temperature_unit: temperatureUnitSchema.optional(),
  wind_speed_unit: windSpeedUnitSchema.optional(),
  precipitation_unit: precipitationUnitSchema.optional(),
  timeformat: timeFormatSchema.optional(),
  timezone: z.string().optional(),
})

// ============================================================================
// Elevation API Schemas
// ============================================================================

/** Elevation request schema */
export const elevationSchema = coordinatesSchema

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type GeocodingSearchInput = z.infer<typeof geocodingSearchSchema>
export type ForecastInput = z.infer<typeof forecastSchema>
export type HistoricalWeatherInput = z.infer<typeof historicalWeatherSchema>
export type MarineWeatherInput = z.infer<typeof marineWeatherSchema>
export type AirQualityInput = z.infer<typeof airQualitySchema>
export type FloodInput = z.infer<typeof floodSchema>
export type EnsembleInput = z.infer<typeof ensembleSchema>
export type SeasonalInput = z.infer<typeof seasonalSchema>
export type ElevationInput = z.infer<typeof elevationSchema>
