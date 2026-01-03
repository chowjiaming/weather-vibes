/**
 * 🌍 Default Location Detection
 * Maps browser timezone to regional default cities
 * Provides immediate weather data on first load
 */

export interface DefaultLocation {
  name: string
  lat: number
  lon: number
  country: string
  timezone: string
}

/**
 * 🗺️ Timezone to city mapping
 * Covers major timezones with their primary cities
 */
const TIMEZONE_DEFAULTS: Record<string, DefaultLocation> = {
  // 🇺🇸 North America - US
  'America/New_York': {
    name: 'New York',
    lat: 40.7128,
    lon: -74.006,
    country: 'United States',
    timezone: 'America/New_York',
  },
  'America/Chicago': {
    name: 'Chicago',
    lat: 41.8781,
    lon: -87.6298,
    country: 'United States',
    timezone: 'America/Chicago',
  },
  'America/Denver': {
    name: 'Denver',
    lat: 39.7392,
    lon: -104.9903,
    country: 'United States',
    timezone: 'America/Denver',
  },
  'America/Los_Angeles': {
    name: 'Los Angeles',
    lat: 34.0522,
    lon: -118.2437,
    country: 'United States',
    timezone: 'America/Los_Angeles',
  },
  'America/Phoenix': {
    name: 'Phoenix',
    lat: 33.4484,
    lon: -112.074,
    country: 'United States',
    timezone: 'America/Phoenix',
  },
  'America/Anchorage': {
    name: 'Anchorage',
    lat: 61.2181,
    lon: -149.9003,
    country: 'United States',
    timezone: 'America/Anchorage',
  },
  'Pacific/Honolulu': {
    name: 'Honolulu',
    lat: 21.3069,
    lon: -157.8583,
    country: 'United States',
    timezone: 'Pacific/Honolulu',
  },

  // 🇨🇦 Canada
  'America/Toronto': {
    name: 'Toronto',
    lat: 43.6532,
    lon: -79.3832,
    country: 'Canada',
    timezone: 'America/Toronto',
  },
  'America/Vancouver': {
    name: 'Vancouver',
    lat: 49.2827,
    lon: -123.1207,
    country: 'Canada',
    timezone: 'America/Vancouver',
  },
  'America/Edmonton': {
    name: 'Edmonton',
    lat: 53.5461,
    lon: -113.4938,
    country: 'Canada',
    timezone: 'America/Edmonton',
  },

  // 🇲🇽 Mexico & Latin America
  'America/Mexico_City': {
    name: 'Mexico City',
    lat: 19.4326,
    lon: -99.1332,
    country: 'Mexico',
    timezone: 'America/Mexico_City',
  },
  'America/Sao_Paulo': {
    name: 'São Paulo',
    lat: -23.5505,
    lon: -46.6333,
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
  },
  'America/Buenos_Aires': {
    name: 'Buenos Aires',
    lat: -34.6037,
    lon: -58.3816,
    country: 'Argentina',
    timezone: 'America/Buenos_Aires',
  },
  'America/Lima': {
    name: 'Lima',
    lat: -12.0464,
    lon: -77.0428,
    country: 'Peru',
    timezone: 'America/Lima',
  },
  'America/Bogota': {
    name: 'Bogotá',
    lat: 4.711,
    lon: -74.0721,
    country: 'Colombia',
    timezone: 'America/Bogota',
  },

  // 🇬🇧 Europe - UK & Ireland
  'Europe/London': {
    name: 'London',
    lat: 51.5074,
    lon: -0.1278,
    country: 'United Kingdom',
    timezone: 'Europe/London',
  },
  'Europe/Dublin': {
    name: 'Dublin',
    lat: 53.3498,
    lon: -6.2603,
    country: 'Ireland',
    timezone: 'Europe/Dublin',
  },

  // 🇪🇺 Europe - Central
  'Europe/Paris': {
    name: 'Paris',
    lat: 48.8566,
    lon: 2.3522,
    country: 'France',
    timezone: 'Europe/Paris',
  },
  'Europe/Berlin': {
    name: 'Berlin',
    lat: 52.52,
    lon: 13.405,
    country: 'Germany',
    timezone: 'Europe/Berlin',
  },
  'Europe/Amsterdam': {
    name: 'Amsterdam',
    lat: 52.3676,
    lon: 4.9041,
    country: 'Netherlands',
    timezone: 'Europe/Amsterdam',
  },
  'Europe/Rome': {
    name: 'Rome',
    lat: 41.9028,
    lon: 12.4964,
    country: 'Italy',
    timezone: 'Europe/Rome',
  },
  'Europe/Madrid': {
    name: 'Madrid',
    lat: 40.4168,
    lon: -3.7038,
    country: 'Spain',
    timezone: 'Europe/Madrid',
  },
  'Europe/Zurich': {
    name: 'Zurich',
    lat: 47.3769,
    lon: 8.5417,
    country: 'Switzerland',
    timezone: 'Europe/Zurich',
  },
  'Europe/Vienna': {
    name: 'Vienna',
    lat: 48.2082,
    lon: 16.3738,
    country: 'Austria',
    timezone: 'Europe/Vienna',
  },
  'Europe/Stockholm': {
    name: 'Stockholm',
    lat: 59.3293,
    lon: 18.0686,
    country: 'Sweden',
    timezone: 'Europe/Stockholm',
  },
  'Europe/Copenhagen': {
    name: 'Copenhagen',
    lat: 55.6761,
    lon: 12.5683,
    country: 'Denmark',
    timezone: 'Europe/Copenhagen',
  },
  'Europe/Oslo': {
    name: 'Oslo',
    lat: 59.9139,
    lon: 10.7522,
    country: 'Norway',
    timezone: 'Europe/Oslo',
  },
  'Europe/Helsinki': {
    name: 'Helsinki',
    lat: 60.1699,
    lon: 24.9384,
    country: 'Finland',
    timezone: 'Europe/Helsinki',
  },

  // 🇷🇺 Eastern Europe
  'Europe/Moscow': {
    name: 'Moscow',
    lat: 55.7558,
    lon: 37.6173,
    country: 'Russia',
    timezone: 'Europe/Moscow',
  },
  'Europe/Warsaw': {
    name: 'Warsaw',
    lat: 52.2297,
    lon: 21.0122,
    country: 'Poland',
    timezone: 'Europe/Warsaw',
  },
  'Europe/Prague': {
    name: 'Prague',
    lat: 50.0755,
    lon: 14.4378,
    country: 'Czech Republic',
    timezone: 'Europe/Prague',
  },
  'Europe/Athens': {
    name: 'Athens',
    lat: 37.9838,
    lon: 23.7275,
    country: 'Greece',
    timezone: 'Europe/Athens',
  },
  'Europe/Istanbul': {
    name: 'Istanbul',
    lat: 41.0082,
    lon: 28.9784,
    country: 'Turkey',
    timezone: 'Europe/Istanbul',
  },

  // 🌏 Asia
  'Asia/Tokyo': {
    name: 'Tokyo',
    lat: 35.6762,
    lon: 139.6503,
    country: 'Japan',
    timezone: 'Asia/Tokyo',
  },
  'Asia/Seoul': {
    name: 'Seoul',
    lat: 37.5665,
    lon: 126.978,
    country: 'South Korea',
    timezone: 'Asia/Seoul',
  },
  'Asia/Shanghai': {
    name: 'Shanghai',
    lat: 31.2304,
    lon: 121.4737,
    country: 'China',
    timezone: 'Asia/Shanghai',
  },
  'Asia/Hong_Kong': {
    name: 'Hong Kong',
    lat: 22.3193,
    lon: 114.1694,
    country: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
  },
  'Asia/Taipei': {
    name: 'Taipei',
    lat: 25.033,
    lon: 121.5654,
    country: 'Taiwan',
    timezone: 'Asia/Taipei',
  },
  'Asia/Singapore': {
    name: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    country: 'Singapore',
    timezone: 'Asia/Singapore',
  },
  'Asia/Bangkok': {
    name: 'Bangkok',
    lat: 13.7563,
    lon: 100.5018,
    country: 'Thailand',
    timezone: 'Asia/Bangkok',
  },
  'Asia/Ho_Chi_Minh': {
    name: 'Ho Chi Minh City',
    lat: 10.8231,
    lon: 106.6297,
    country: 'Vietnam',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  'Asia/Jakarta': {
    name: 'Jakarta',
    lat: -6.2088,
    lon: 106.8456,
    country: 'Indonesia',
    timezone: 'Asia/Jakarta',
  },
  'Asia/Manila': {
    name: 'Manila',
    lat: 14.5995,
    lon: 120.9842,
    country: 'Philippines',
    timezone: 'Asia/Manila',
  },
  'Asia/Kolkata': {
    name: 'Mumbai',
    lat: 19.076,
    lon: 72.8777,
    country: 'India',
    timezone: 'Asia/Kolkata',
  },
  'Asia/Dubai': {
    name: 'Dubai',
    lat: 25.2048,
    lon: 55.2708,
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
  },
  'Asia/Riyadh': {
    name: 'Riyadh',
    lat: 24.7136,
    lon: 46.6753,
    country: 'Saudi Arabia',
    timezone: 'Asia/Riyadh',
  },
  'Asia/Jerusalem': {
    name: 'Tel Aviv',
    lat: 32.0853,
    lon: 34.7818,
    country: 'Israel',
    timezone: 'Asia/Jerusalem',
  },

  // 🇦🇺 Oceania
  'Australia/Sydney': {
    name: 'Sydney',
    lat: -33.8688,
    lon: 151.2093,
    country: 'Australia',
    timezone: 'Australia/Sydney',
  },
  'Australia/Melbourne': {
    name: 'Melbourne',
    lat: -37.8136,
    lon: 144.9631,
    country: 'Australia',
    timezone: 'Australia/Melbourne',
  },
  'Australia/Brisbane': {
    name: 'Brisbane',
    lat: -27.4698,
    lon: 153.0251,
    country: 'Australia',
    timezone: 'Australia/Brisbane',
  },
  'Australia/Perth': {
    name: 'Perth',
    lat: -31.9505,
    lon: 115.8605,
    country: 'Australia',
    timezone: 'Australia/Perth',
  },
  'Pacific/Auckland': {
    name: 'Auckland',
    lat: -36.8485,
    lon: 174.7633,
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
  },

  // 🌍 Africa & Middle East
  'Africa/Cairo': {
    name: 'Cairo',
    lat: 30.0444,
    lon: 31.2357,
    country: 'Egypt',
    timezone: 'Africa/Cairo',
  },
  'Africa/Johannesburg': {
    name: 'Johannesburg',
    lat: -26.2041,
    lon: 28.0473,
    country: 'South Africa',
    timezone: 'Africa/Johannesburg',
  },
  'Africa/Lagos': {
    name: 'Lagos',
    lat: 6.5244,
    lon: 3.3792,
    country: 'Nigeria',
    timezone: 'Africa/Lagos',
  },
  'Africa/Nairobi': {
    name: 'Nairobi',
    lat: -1.2921,
    lon: 36.8219,
    country: 'Kenya',
    timezone: 'Africa/Nairobi',
  },
}

/**
 * 🏠 Fallback default when timezone is not recognized
 * Using London as a neutral, globally recognizable default
 */
const FALLBACK_DEFAULT: DefaultLocation = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'United Kingdom',
  timezone: 'Europe/London',
}

/**
 * 🔍 Get the default location based on user's timezone
 * Falls back to London if timezone is not recognized
 */
export function getDefaultLocation(): DefaultLocation {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return FALLBACK_DEFAULT
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_DEFAULTS[timezone] ?? FALLBACK_DEFAULT
  } catch {
    return FALLBACK_DEFAULT
  }
}

/**
 * 📋 Get all available default locations
 * Useful for displaying a list of popular cities
 */
export function getAllDefaultLocations(): DefaultLocation[] {
  return Object.values(TIMEZONE_DEFAULTS)
}

/**
 * 🎯 Check if a timezone has a mapped default location
 */
export function hasDefaultForTimezone(timezone: string): boolean {
  return timezone in TIMEZONE_DEFAULTS
}
