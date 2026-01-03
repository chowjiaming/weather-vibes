/**
 * 🎨 useAdaptiveTheme Hook
 * Manages adaptive theming based on time and weather
 */
'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import {
  getTimeOfDay,
  getWeatherCondition,
  shouldUseDarkMode,
  type TimeOfDay,
  type WeatherCondition,
} from '@/lib/theme-engine'

interface UseAdaptiveThemeOptions {
  /** 🌤️ Current weather code from API */
  weatherCode?: number
  /** 🔄 Whether to auto-sync theme with time */
  autoSync?: boolean
  /** ⏱️ Interval for checking time changes (ms) */
  syncInterval?: number
}

interface AdaptiveThemeState {
  /** 🕐 Current time of day */
  timeOfDay: TimeOfDay
  /** 🌤️ Current weather condition */
  weatherCondition: WeatherCondition | null
  /** 🌙 Whether dark mode is active */
  isDark: boolean
  /** 🎨 Current theme */
  theme: string | undefined
}

export function useAdaptiveTheme({
  weatherCode,
  autoSync = true,
  syncInterval = 60000, // 1 minute
}: UseAdaptiveThemeOptions = {}) {
  const { setTheme, resolvedTheme } = useTheme()

  const [state, setState] = useState<AdaptiveThemeState>(() => ({
    timeOfDay: getTimeOfDay(),
    weatherCondition: weatherCode ? getWeatherCondition(weatherCode) : null,
    isDark: false,
    theme: undefined,
  }))

  // 🕐 Update time of day
  const updateTimeOfDay = useCallback(() => {
    const newTimeOfDay = getTimeOfDay()
    setState((prev) => {
      if (prev.timeOfDay === newTimeOfDay) return prev
      return { ...prev, timeOfDay: newTimeOfDay }
    })
  }, [])

  // 🌤️ Update weather condition when code changes
  useEffect(() => {
    if (weatherCode !== undefined) {
      const condition = getWeatherCondition(weatherCode)
      setState((prev) => ({ ...prev, weatherCondition: condition }))
    }
  }, [weatherCode])

  // ⏱️ Auto-sync time of day
  useEffect(() => {
    if (!autoSync) return

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, syncInterval, updateTimeOfDay])

  // 🌙 Update isDark state based on resolved theme
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isDark: resolvedTheme === 'dark',
      theme: resolvedTheme,
    }))
  }, [resolvedTheme])

  // 🎨 Apply theme data attributes to document
  useEffect(() => {
    const html = document.documentElement

    // Set time-based theme
    html.setAttribute('data-theme-time', state.timeOfDay)

    // Set weather-based theme
    if (state.weatherCondition) {
      html.setAttribute('data-weather', state.weatherCondition)
    } else {
      html.removeAttribute('data-weather')
    }

    return () => {
      html.removeAttribute('data-theme-time')
      html.removeAttribute('data-weather')
    }
  }, [state.timeOfDay, state.weatherCondition])

  // 🔄 Sync theme with time of day
  const syncWithTime = useCallback(() => {
    const shouldBeDark = shouldUseDarkMode(state.timeOfDay)
    const newTheme = shouldBeDark ? 'dark' : 'light'
    setTheme(newTheme)
  }, [state.timeOfDay, setTheme])

  // 🎯 Toggle between light/dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return {
    ...state,
    setTheme,
    toggleTheme,
    syncWithTime,
  }
}
