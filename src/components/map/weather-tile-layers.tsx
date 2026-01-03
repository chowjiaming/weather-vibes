/**
 * 🗺️ Weather Tile Layers
 * Real-time weather overlays using FREE tile services
 *
 * 🌧️ Uses RainViewer for precipitation radar (FREE, no API key!)
 * 🌡️ Uses gradient overlays for temperature visualization
 *
 * Sources:
 * - RainViewer: https://www.rainviewer.com/api.html
 * - Open-Meteo: https://open-meteo.com (for data, not tiles)
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'

import { useLayers } from '@/contexts/layer-context'

/**
 * 🌧️ RainViewer API Types
 * Free global precipitation radar tiles
 */
interface RainViewerRadar {
  past: Array<{ path: string; time: number }>
  nowcast: Array<{ path: string; time: number }>
}

interface RainViewerData {
  radar: RainViewerRadar
  host: string
}

/**
 * 🎨 RainViewer Color Schemes
 * Different visual styles for the precipitation radar
 *
 * Color scheme codes:
 * - 0: Original (default)
 * - 1: Universal Blue
 * - 2: TITAN
 * - 3: The Weather Channel
 * - 4: Meteored
 * - 5: NEXRAD Level-III
 * - 6: Rainbow @ SELEX-SI
 * - 7: Dark Sky
 * - 8: Color Blind Friendly
 */
const RADAR_COLOR_SCHEME = 6 // Rainbow - vibrant and easy to read

/**
 * 🌧️ Precipitation Radar Layer (RainViewer - FREE!)
 * Real-time precipitation radar from RainViewer API
 * No API key required!
 *
 * 🎨 Enhanced styling with:
 * - Vibrant color scheme (Rainbow @ SELEX-SI)
 * - Smooth tile rendering
 * - Optimized opacity for map overlay
 * - Smooth transitions between frames
 */
function PrecipitationRadarLayer() {
  const [radarFrame, setRadarFrame] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [radarTime, setRadarTime] = useState<number | null>(null)

  // 📡 Fetch latest radar frame from RainViewer
  const fetchRadarFrame = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.rainviewer.com/public/weather-maps.json',
      )
      const data: RainViewerData = await response.json()

      // 🎯 Get the most recent radar frame
      const latestFrame = data.radar.past[data.radar.past.length - 1]
      if (latestFrame) {
        // 📍 RainViewer tile URL format with enhanced settings:
        // - 512 tile size for sharper images
        // - Color scheme 6 (Rainbow) for vibrant colors
        // - Smooth (1) rendering for better quality
        // - Options: 1_1 = smooth + snow
        const tileUrl = `${data.host}${latestFrame.path}/512/{z}/{x}/{y}/${RADAR_COLOR_SCHEME}/1_1.png`
        setRadarFrame(tileUrl)
        setRadarTime(latestFrame.time)
      }
    } catch {
      // Silent fail - radar just won't show
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRadarFrame()
    // 🔄 Refresh radar every 5 minutes
    const interval = setInterval(fetchRadarFrame, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchRadarFrame])

  if (isLoading || !radarFrame) return null

  return (
    <>
      <Source
        id="rainviewer-radar"
        type="raster"
        tiles={[radarFrame]}
        tileSize={512}
        minzoom={2}
        maxzoom={12}
      >
        <Layer
          id="precipitation-radar-layer"
          type="raster"
          paint={{
            // 🎨 Enhanced visual settings
            'raster-opacity': 0.75,
            'raster-fade-duration': 500,
            // Boost saturation and contrast for more vibrant colors
            'raster-saturation': 0.15,
            'raster-contrast': 0.1,
            'raster-brightness-min': 0.05,
            'raster-brightness-max': 1,
            // Smooth resampling for cleaner edges
            'raster-resampling': 'linear',
          }}
          beforeId="place-city"
        />
      </Source>

      {/* 🕐 Radar timestamp indicator */}
      {radarTime && (
        <div className="absolute bottom-16 right-4 glass rounded-lg px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">Radar: </span>
          <span className="font-mono">
            {new Date(radarTime * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}
    </>
  )
}

/**
 * 🌡️ Temperature Gradient Layer
 * Creates a visual temperature indicator around the current location
 * Uses CSS gradients overlaid on the map (no tiles needed)
 */
function TemperatureGradientLayer() {
  // 🎨 This layer is handled via CSS overlay in the map component
  // Since we don't have tile-based temperature data, we show a legend instead
  return null
}

/**
 * ☁️ Cloud Cover Layer
 * Note: No free cloud tile service available
 * Could be implemented with Open-Meteo grid data in the future
 */
function CloudCoverLayer() {
  return null
}

/**
 * 💨 Wind Layer
 * Note: No free wind tile service available
 * Could be implemented with canvas-based wind particles in the future
 */
function WindFlowLayer() {
  return null
}

/**
 * 🌊 Marine Conditions Layer
 * Note: Marine visualization requires specialized tile services
 */
function MarineConditionsLayer() {
  return null
}

/**
 * ⚠️ Weather Alerts Layer
 * Note: Would require integration with NWS or similar alert services
 */
function AlertsOverlayLayer() {
  return null
}

/**
 * 🗺️ Weather Layers Container
 * Renders available weather layers based on context
 */
export function WeatherTileLayers() {
  const { layers } = useLayers()

  return (
    <>
      {/* 🌧️ Precipitation radar - AVAILABLE (RainViewer) */}
      {layers.precipitation && <PrecipitationRadarLayer />}

      {/* 🌡️ Temperature - Limited (gradient overlay only) */}
      {layers.temperature && <TemperatureGradientLayer />}

      {/* ☁️ Clouds - Not available without paid service */}
      {layers.clouds && <CloudCoverLayer />}

      {/* 💨 Wind - Not available without paid service */}
      {layers.wind && <WindFlowLayer />}

      {/* 🌊 Marine - Not available without paid service */}
      {layers.marine && <MarineConditionsLayer />}

      {/* ⚠️ Alerts - Not available without paid service */}
      {layers.alerts && <AlertsOverlayLayer />}
    </>
  )
}

/**
 * 📋 Layer availability information
 * Returns which layers are available with free services
 */
export interface LayerAvailability {
  id: string
  available: boolean
  source: string
  note?: string
}

export function getLayerAvailability(): LayerAvailability[] {
  return [
    {
      id: 'precipitation',
      available: true,
      source: 'RainViewer',
      note: 'Real-time precipitation radar',
    },
    {
      id: 'temperature',
      available: false,
      source: 'N/A',
      note: 'Requires paid tile service',
    },
    {
      id: 'clouds',
      available: false,
      source: 'N/A',
      note: 'Requires paid tile service',
    },
    {
      id: 'wind',
      available: false,
      source: 'N/A',
      note: 'Requires paid tile service',
    },
    {
      id: 'marine',
      available: false,
      source: 'N/A',
      note: 'Requires paid tile service',
    },
    {
      id: 'alerts',
      available: false,
      source: 'N/A',
      note: 'Requires NWS integration',
    },
  ]
}

/**
 * 🔍 Check if any tile layers are available
 */
export function useWeatherTilesAvailable(): boolean {
  // 🌧️ Precipitation radar is always available (RainViewer is free!)
  return true
}

export {
  AlertsOverlayLayer,
  CloudCoverLayer,
  MarineConditionsLayer,
  PrecipitationRadarLayer,
  TemperatureGradientLayer,
  WindFlowLayer,
}
