/**
 * 🎨 useMapStyle Hook
 * Returns the appropriate map style based on current theme
 */
'use client'

import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { getMapStyle, type MapStyle } from './map-styles'

export function useMapStyle() {
  const { resolvedTheme } = useTheme()

  const mapStyle = useMemo(() => {
    const theme: MapStyle = resolvedTheme === 'dark' ? 'dark' : 'light'
    return getMapStyle(theme)
  }, [resolvedTheme])

  return {
    mapStyle,
    isDark: resolvedTheme === 'dark',
  }
}
