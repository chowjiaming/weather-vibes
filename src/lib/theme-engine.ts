/**
 * 🎨 Adaptive Theme Engine
 * Dynamically adjusts theme based on time of day and weather conditions
 */

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'

/**
 * 🕐 Get time of day based on current hour
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours()

  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 18) return 'day'
  if (hour >= 18 && hour < 21) return 'dusk'
  return 'night'
}

/**
 * 🌤️ Get weather condition from weather code
 * Based on WMO Weather interpretation codes
 * https://open-meteo.com/en/docs
 */
export function getWeatherCondition(weatherCode: number): WeatherCondition {
  // ☀️ Clear/Sunny
  if (weatherCode <= 1) return 'sunny'

  // ☁️ Cloudy/Overcast
  if (weatherCode <= 3) return 'cloudy'

  // 🌧️ Rain
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return 'rainy'
  }

  // ❄️ Snow
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    return 'snowy'
  }

  // ⛈️ Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return 'stormy'

  // Default to cloudy for fog and other conditions
  return 'cloudy'
}

/**
 * 🎨 Get theme data attributes for HTML element
 */
export function getThemeDataAttributes(
  time?: TimeOfDay,
  weather?: WeatherCondition,
): Record<string, string> {
  const attrs: Record<string, string> = {}

  if (time) {
    attrs['data-theme-time'] = time
  }

  if (weather) {
    attrs['data-weather'] = weather
  }

  return attrs
}

/**
 * 🌈 Theme color palette for different conditions
 */
export const themeColors = {
  dawn: {
    primary: 'oklch(0.70 0.18 25)',
    accent: 'oklch(0.75 0.15 340)',
    background: 'oklch(0.95 0.03 25)',
  },
  day: {
    primary: 'oklch(0.55 0.15 240)',
    accent: 'oklch(0.75 0.15 45)',
    background: 'oklch(0.98 0.005 240)',
  },
  dusk: {
    primary: 'oklch(0.60 0.15 300)',
    accent: 'oklch(0.70 0.18 30)',
    background: 'oklch(0.88 0.04 280)',
  },
  night: {
    primary: 'oklch(0.70 0.15 240)',
    accent: 'oklch(0.70 0.15 160)',
    background: 'oklch(0.12 0.02 250)',
  },
}

export const weatherColors = {
  sunny: {
    accent: 'oklch(0.80 0.15 80)',
  },
  cloudy: {
    accent: 'oklch(0.65 0.05 250)',
  },
  rainy: {
    accent: 'oklch(0.60 0.12 230)',
  },
  snowy: {
    accent: 'oklch(0.85 0.03 220)',
  },
  stormy: {
    accent: 'oklch(0.50 0.15 270)',
  },
}

/**
 * 🎯 Determine if we should use dark mode based on time
 */
export function shouldUseDarkMode(time: TimeOfDay): boolean {
  return time === 'night' || time === 'dusk'
}

/**
 * 📊 Weather condition descriptions
 */
export const weatherDescriptions: Record<
  WeatherCondition,
  { label: string; emoji: string }
> = {
  sunny: { label: 'Clear', emoji: '☀️' },
  cloudy: { label: 'Cloudy', emoji: '☁️' },
  rainy: { label: 'Rainy', emoji: '🌧️' },
  snowy: { label: 'Snowy', emoji: '❄️' },
  stormy: { label: 'Stormy', emoji: '⛈️' },
}

/**
 * 🕐 Time of day descriptions
 */
export const timeDescriptions: Record<
  TimeOfDay,
  { label: string; emoji: string }
> = {
  dawn: { label: 'Dawn', emoji: '🌅' },
  day: { label: 'Day', emoji: '☀️' },
  dusk: { label: 'Dusk', emoji: '🌇' },
  night: { label: 'Night', emoji: '🌙' },
}
