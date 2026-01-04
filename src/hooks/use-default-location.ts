/**
 * 🌍 Hydration-safe default location hook
 * Uses the deterministic fallback during SSR + first client render,
 * then swaps to the timezone-derived location after mount ✅
 */
import { useEffect, useState } from 'react'

import {
  type DefaultLocation,
  getDefaultLocation,
  getFallbackLocation,
} from '@/lib/default-locations'

export function useDefaultLocation(): DefaultLocation {
  const [location, setLocation] = useState<DefaultLocation>(() =>
    getFallbackLocation(),
  )

  useEffect(() => {
    setLocation(getDefaultLocation())
  }, [])

  return location
}
