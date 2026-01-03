/**
 * 🌦️ Open-Meteo API Type Definitions
 * Shared types for all weather API endpoints
 */

// ============================================================================
// Common Types
// ============================================================================

/** Geographic coordinates */
export interface Coordinates {
  latitude: number
  longitude: number
}

/** Temperature units */
export type TemperatureUnit = 'celsius' | 'fahrenheit'

/** Wind speed units */
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph' | 'kn'

/** Precipitation units */
export type PrecipitationUnit = 'mm' | 'inch'

/** Time format options */
export type TimeFormat = 'iso8601' | 'unixtime'

/** Cell selection for grid data */
export type CellSelection = 'land' | 'sea' | 'nearest'

/** Wave height units for marine API */
export type WaveHeightUnit = 'm' | 'ft'

// ============================================================================
// API Response Base
// ============================================================================

/** Common response metadata */
export interface ApiResponseMetadata {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation?: number
}

/** Common error response */
export interface ApiErrorResponse {
  error: true
  reason: string
}

// ============================================================================
// Weather Variables
// ============================================================================

/** Common hourly weather variables */
export type HourlyWeatherVariable =
  | 'temperature_2m'
  | 'relative_humidity_2m'
  | 'dew_point_2m'
  | 'apparent_temperature'
  | 'precipitation'
  | 'rain'
  | 'showers'
  | 'snowfall'
  | 'snow_depth'
  | 'weather_code'
  | 'pressure_msl'
  | 'surface_pressure'
  | 'cloud_cover'
  | 'cloud_cover_low'
  | 'cloud_cover_mid'
  | 'cloud_cover_high'
  | 'visibility'
  | 'evapotranspiration'
  | 'et0_fao_evapotranspiration'
  | 'vapour_pressure_deficit'
  | 'wind_speed_10m'
  | 'wind_speed_80m'
  | 'wind_speed_120m'
  | 'wind_speed_180m'
  | 'wind_direction_10m'
  | 'wind_direction_80m'
  | 'wind_direction_120m'
  | 'wind_direction_180m'
  | 'wind_gusts_10m'
  | 'soil_temperature_0cm'
  | 'soil_temperature_6cm'
  | 'soil_temperature_18cm'
  | 'soil_temperature_54cm'
  | 'soil_moisture_0_to_1cm'
  | 'soil_moisture_1_to_3cm'
  | 'soil_moisture_3_to_9cm'
  | 'soil_moisture_9_to_27cm'
  | 'soil_moisture_27_to_81cm'
  | 'shortwave_radiation'
  | 'direct_radiation'
  | 'diffuse_radiation'
  | 'direct_normal_irradiance'
  | 'global_tilted_irradiance'
  | 'terrestrial_radiation'
  | 'is_day'
  | 'sunshine_duration'
  | 'cape'
  | 'lifted_index'
  | 'convective_inhibition'

/** Common daily weather variables (Forecast API) */
export type DailyWeatherVariable =
  | 'weather_code'
  | 'temperature_2m_max'
  | 'temperature_2m_min'
  | 'apparent_temperature_max'
  | 'apparent_temperature_min'
  | 'sunrise'
  | 'sunset'
  | 'daylight_duration'
  | 'sunshine_duration'
  | 'uv_index_max'
  | 'uv_index_clear_sky_max'
  | 'precipitation_sum'
  | 'rain_sum'
  | 'showers_sum'
  | 'snowfall_sum'
  | 'precipitation_hours'
  | 'precipitation_probability_max'
  | 'wind_speed_10m_max'
  | 'wind_gusts_10m_max'
  | 'wind_direction_10m_dominant'
  | 'shortwave_radiation_sum'
  | 'et0_fao_evapotranspiration'

/** Historical daily weather variables (includes additional aggregates) */
export type HistoricalDailyWeatherVariable =
  | 'weather_code'
  | 'temperature_2m_max'
  | 'temperature_2m_min'
  | 'temperature_2m_mean' // Historical API only
  | 'apparent_temperature_max'
  | 'apparent_temperature_min'
  | 'apparent_temperature_mean' // Historical API only
  | 'sunrise'
  | 'sunset'
  | 'daylight_duration'
  | 'sunshine_duration'
  | 'uv_index_max'
  | 'uv_index_clear_sky_max'
  | 'precipitation_sum'
  | 'rain_sum'
  | 'showers_sum'
  | 'snowfall_sum'
  | 'precipitation_hours'
  | 'wind_speed_10m_max'
  | 'wind_gusts_10m_max'
  | 'wind_direction_10m_dominant'
  | 'shortwave_radiation_sum'
  | 'et0_fao_evapotranspiration'

/** Current weather variables */
export type CurrentWeatherVariable =
  | 'temperature_2m'
  | 'relative_humidity_2m'
  | 'apparent_temperature'
  | 'is_day'
  | 'precipitation'
  | 'rain'
  | 'showers'
  | 'snowfall'
  | 'weather_code'
  | 'cloud_cover'
  | 'pressure_msl'
  | 'surface_pressure'
  | 'wind_speed_10m'
  | 'wind_direction_10m'
  | 'wind_gusts_10m'

// ============================================================================
// Geocoding Types
// ============================================================================

/** Location result from geocoding API */
export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  feature_code: string
  country_code: string
  admin1_id?: number
  admin2_id?: number
  admin3_id?: number
  admin4_id?: number
  timezone: string
  population?: number
  postcodes?: string[]
  country_id: number
  country: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
}

/** Geocoding API response */
export interface GeocodingResponse {
  results?: GeocodingResult[]
  generationtime_ms: number
}

// ============================================================================
// Weather Response Types
// ============================================================================

/** Hourly weather data */
export interface HourlyData {
  time: string[]
  [key: string]: number[] | string[]
}

/** Daily weather data */
export interface DailyData {
  time: string[]
  [key: string]: number[] | string[]
}

/** Current weather data */
export interface CurrentData {
  time: string
  interval: number
  [key: string]: number | string
}

/** Units object for variables */
export interface UnitsMap {
  [key: string]: string
}

/** Generic weather response */
export interface WeatherResponse extends ApiResponseMetadata {
  hourly?: HourlyData
  hourly_units?: UnitsMap
  daily?: DailyData
  daily_units?: UnitsMap
  current?: CurrentData
  current_units?: UnitsMap
}

// ============================================================================
// Historical Weather Types
// ============================================================================

/** Historical weather model options */
export type HistoricalModel =
  | 'best_match'
  | 'ecmwf_ifs'
  | 'era5'
  | 'era5_land'
  | 'era5_ensemble'
  | 'cerra'

/** Historical weather request parameters */
export interface HistoricalWeatherParams extends Coordinates {
  start_date: string
  end_date: string
  hourly?: HourlyWeatherVariable[]
  daily?: DailyWeatherVariable[]
  temperature_unit?: TemperatureUnit
  wind_speed_unit?: WindSpeedUnit
  precipitation_unit?: PrecipitationUnit
  timeformat?: TimeFormat
  timezone?: string
  models?: HistoricalModel | HistoricalModel[]
}

// ============================================================================
// Marine Weather Types
// ============================================================================

/** Marine hourly variables */
export type MarineHourlyVariable =
  | 'wave_height'
  | 'wave_direction'
  | 'wave_period'
  | 'wind_wave_height'
  | 'wind_wave_direction'
  | 'wind_wave_period'
  | 'wind_wave_peak_period'
  | 'swell_wave_height'
  | 'swell_wave_direction'
  | 'swell_wave_period'
  | 'swell_wave_peak_period'
  | 'ocean_current_velocity'
  | 'ocean_current_direction'

/** Marine daily variables */
export type MarineDailyVariable =
  | 'wave_height_max'
  | 'wave_direction_dominant'
  | 'wave_period_max'
  | 'wind_wave_height_max'
  | 'wind_wave_direction_dominant'
  | 'wind_wave_period_max'
  | 'wind_wave_peak_period_max'
  | 'swell_wave_height_max'
  | 'swell_wave_direction_dominant'
  | 'swell_wave_period_max'
  | 'swell_wave_peak_period_max'

// ============================================================================
// Air Quality Types
// ============================================================================

/** Air quality hourly variables */
export type AirQualityVariable =
  | 'pm10'
  | 'pm2_5'
  | 'carbon_monoxide'
  | 'nitrogen_dioxide'
  | 'sulphur_dioxide'
  | 'ozone'
  | 'aerosol_optical_depth'
  | 'dust'
  | 'uv_index'
  | 'uv_index_clear_sky'
  | 'ammonia'
  | 'alder_pollen'
  | 'birch_pollen'
  | 'grass_pollen'
  | 'mugwort_pollen'
  | 'olive_pollen'
  | 'ragweed_pollen'
  | 'european_aqi'
  | 'us_aqi'
  | 'european_aqi_pm2_5'
  | 'european_aqi_pm10'
  | 'european_aqi_nitrogen_dioxide'
  | 'european_aqi_ozone'
  | 'european_aqi_sulphur_dioxide'
  | 'us_aqi_pm2_5'
  | 'us_aqi_pm10'
  | 'us_aqi_nitrogen_dioxide'
  | 'us_aqi_ozone'
  | 'us_aqi_sulphur_dioxide'
  | 'us_aqi_carbon_monoxide'

// ============================================================================
// Flood API Types
// ============================================================================

/** Flood/river discharge variables */
export type FloodVariable =
  | 'river_discharge'
  | 'river_discharge_mean'
  | 'river_discharge_median'
  | 'river_discharge_max'
  | 'river_discharge_min'
  | 'river_discharge_p25'
  | 'river_discharge_p75'

/** Flood model options */
export type FloodModel =
  | 'glofas_v4_seamless'
  | 'glofas_v4_forecast'
  | 'glofas_v4_consolidated'
  | 'glofas_v3_seamless'
  | 'glofas_v3_forecast'
  | 'glofas_v3_consolidated'

// ============================================================================
// Ensemble API Types
// ============================================================================

/** Ensemble model options */
export type EnsembleModel =
  | 'icon_seamless'
  | 'icon_global'
  | 'icon_eu'
  | 'icon_d2'
  | 'gfs_seamless'
  | 'gfs025'
  | 'gfs05'
  | 'ecmwf_ifs025_ensemble'
  | 'ecmwf_ifs04_ensemble'
  | 'gem_global_ensemble'
  | 'bom_access_global_ensemble'

// ============================================================================
// Seasonal API Types
// ============================================================================

/** Seasonal forecast model options */
export type SeasonalModel =
  | 'ecmwf_seasonal_seamless'
  | 'ecmwf_seas5'
  | 'ecmwf_ec46'

/** Seasonal daily variables */
export type SeasonalDailyVariable =
  | 'temperature_2m_max'
  | 'temperature_2m_min'
  | 'precipitation_sum'
  | 'wind_speed_10m_max'
