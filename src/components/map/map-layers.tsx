/**
 * 🗺️ Map Layer Components
 * Data overlay layers for the map canvas
 */
'use client'

import type {
  FillLayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl'
import { Layer } from 'react-map-gl/maplibre'

/**
 * 🌡️ Temperature Layer
 * Displays temperature gradient overlay
 */
interface TemperatureLayerProps {
  visible: boolean
  opacity?: number
}

export function TemperatureLayer({
  visible,
  opacity = 0.5,
}: TemperatureLayerProps) {
  if (!visible) return null

  // 🌡️ Temperature gradient stops (°C → color)
  const temperatureGradient: FillLayerSpecification['paint'] = {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'temperature'],
      -40,
      '#0a1929',
      -20,
      '#1565c0',
      0,
      '#42a5f5',
      10,
      '#81d4fa',
      20,
      '#a5d6a7',
      30,
      '#ffcc80',
      40,
      '#ef5350',
      50,
      '#b71c1c',
    ],
    'fill-opacity': opacity,
  }

  return (
    <Layer
      id="temperature-layer"
      type="fill"
      source="temperature-data"
      paint={temperatureGradient}
      beforeId="place-city"
    />
  )
}

/**
 * 🌧️ Precipitation Layer
 * Displays precipitation overlay
 */
interface PrecipitationLayerProps {
  visible: boolean
  opacity?: number
}

export function PrecipitationLayer({
  visible,
  opacity = 0.4,
}: PrecipitationLayerProps) {
  if (!visible) return null

  const precipitationGradient: FillLayerSpecification['paint'] = {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'precipitation'],
      0,
      'rgba(0, 0, 0, 0)',
      1,
      '#e3f2fd',
      5,
      '#90caf9',
      10,
      '#42a5f5',
      25,
      '#1e88e5',
      50,
      '#1565c0',
      100,
      '#0d47a1',
    ],
    'fill-opacity': opacity,
  }

  return (
    <Layer
      id="precipitation-layer"
      type="fill"
      source="precipitation-data"
      paint={precipitationGradient}
      beforeId="place-city"
    />
  )
}

/**
 * ☁️ Cloud Cover Layer
 * Displays cloud coverage overlay
 */
interface CloudLayerProps {
  visible: boolean
  opacity?: number
}

export function CloudLayer({ visible, opacity = 0.6 }: CloudLayerProps) {
  if (!visible) return null

  const cloudGradient: FillLayerSpecification['paint'] = {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'cloud_cover'],
      0,
      'rgba(255, 255, 255, 0)',
      25,
      'rgba(200, 200, 210, 0.3)',
      50,
      'rgba(160, 165, 180, 0.5)',
      75,
      'rgba(130, 140, 160, 0.7)',
      100,
      'rgba(100, 110, 130, 0.9)',
    ],
    'fill-opacity': opacity,
  }

  return (
    <Layer
      id="cloud-layer"
      type="fill"
      source="cloud-data"
      paint={cloudGradient}
      beforeId="place-city"
    />
  )
}

/**
 * 💨 Wind Layer
 * Displays wind speed and direction overlay
 */
interface WindLayerProps {
  visible: boolean
  opacity?: number
}

export function WindLayer({ visible, opacity = 0.5 }: WindLayerProps) {
  if (!visible) return null

  const windLineStyle: LineLayerSpecification['paint'] = {
    'line-color': [
      'interpolate',
      ['linear'],
      ['get', 'wind_speed'],
      0,
      '#b3e5fc',
      10,
      '#4fc3f7',
      20,
      '#00bcd4',
      30,
      '#00897b',
      50,
      '#2e7d32',
      75,
      '#827717',
      100,
      '#e65100',
    ],
    'line-width': [
      'interpolate',
      ['linear'],
      ['get', 'wind_speed'],
      0,
      1,
      50,
      3,
      100,
      5,
    ],
    'line-opacity': opacity,
  }

  return (
    <Layer
      id="wind-layer"
      type="line"
      source="wind-data"
      paint={windLineStyle}
      beforeId="place-city"
    />
  )
}

/**
 * 🌊 Marine Layer
 * Displays wave height and ocean conditions
 */
interface MarineLayerProps {
  visible: boolean
  opacity?: number
}

export function MarineLayer({ visible, opacity = 0.5 }: MarineLayerProps) {
  if (!visible) return null

  const marineGradient: FillLayerSpecification['paint'] = {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'wave_height'],
      0,
      'rgba(0, 150, 200, 0.1)',
      0.5,
      '#4dd0e1',
      1,
      '#00bcd4',
      2,
      '#0097a7',
      3,
      '#00838f',
      5,
      '#006064',
      8,
      '#004d40',
    ],
    'fill-opacity': opacity,
  }

  return (
    <Layer
      id="marine-layer"
      type="fill"
      source="marine-data"
      paint={marineGradient}
      beforeId="water"
    />
  )
}

/**
 * ⚠️ Alerts Layer
 * Displays weather warnings and alerts
 */
interface AlertsLayerProps {
  visible: boolean
}

export function AlertsLayer({ visible }: AlertsLayerProps) {
  if (!visible) return null

  const alertColors: FillLayerSpecification['paint'] = {
    'fill-color': [
      'match',
      ['get', 'severity'],
      'extreme',
      '#d32f2f',
      'severe',
      '#f57c00',
      'moderate',
      '#fbc02d',
      'minor',
      '#43a047',
      '#9e9e9e',
    ],
    'fill-opacity': 0.4,
  }

  const alertOutline: LineLayerSpecification['paint'] = {
    'line-color': [
      'match',
      ['get', 'severity'],
      'extreme',
      '#d32f2f',
      'severe',
      '#f57c00',
      'moderate',
      '#fbc02d',
      'minor',
      '#43a047',
      '#9e9e9e',
    ],
    'line-width': 2,
  }

  return (
    <>
      <Layer
        id="alerts-fill-layer"
        type="fill"
        source="alerts-data"
        paint={alertColors}
        beforeId="place-city"
      />
      <Layer
        id="alerts-outline-layer"
        type="line"
        source="alerts-data"
        paint={alertOutline}
        beforeId="place-city"
      />
    </>
  )
}

/**
 * 📍 Layer Legend
 * Shows legend for active layers
 */
interface LayerLegendProps {
  activeLayer:
    | 'temperature'
    | 'precipitation'
    | 'clouds'
    | 'wind'
    | 'marine'
    | 'alerts'
    | null
}

const legendConfigs = {
  temperature: {
    title: 'Temperature',
    unit: '°C',
    stops: [
      { value: -20, color: '#1565c0', label: '-20°' },
      { value: 0, color: '#42a5f5', label: '0°' },
      { value: 20, color: '#a5d6a7', label: '20°' },
      { value: 40, color: '#ef5350', label: '40°' },
    ],
  },
  precipitation: {
    title: 'Precipitation',
    unit: 'mm',
    stops: [
      { value: 0, color: '#e3f2fd', label: '0' },
      { value: 10, color: '#42a5f5', label: '10' },
      { value: 50, color: '#1565c0', label: '50' },
      { value: 100, color: '#0d47a1', label: '100+' },
    ],
  },
  clouds: {
    title: 'Cloud Cover',
    unit: '%',
    stops: [
      { value: 0, color: 'rgba(255, 255, 255, 0.5)', label: '0' },
      { value: 50, color: 'rgba(160, 165, 180, 0.7)', label: '50' },
      { value: 100, color: 'rgba(100, 110, 130, 0.9)', label: '100' },
    ],
  },
  wind: {
    title: 'Wind Speed',
    unit: 'km/h',
    stops: [
      { value: 0, color: '#b3e5fc', label: '0' },
      { value: 25, color: '#00bcd4', label: '25' },
      { value: 50, color: '#2e7d32', label: '50' },
      { value: 100, color: '#e65100', label: '100+' },
    ],
  },
  marine: {
    title: 'Wave Height',
    unit: 'm',
    stops: [
      { value: 0, color: '#4dd0e1', label: '0' },
      { value: 2, color: '#0097a7', label: '2' },
      { value: 5, color: '#006064', label: '5' },
      { value: 8, color: '#004d40', label: '8+' },
    ],
  },
  alerts: {
    title: 'Alert Level',
    unit: '',
    stops: [
      { value: 1, color: '#43a047', label: 'Minor' },
      { value: 2, color: '#fbc02d', label: 'Moderate' },
      { value: 3, color: '#f57c00', label: 'Severe' },
      { value: 4, color: '#d32f2f', label: 'Extreme' },
    ],
  },
}

export function LayerLegend({ activeLayer }: LayerLegendProps) {
  if (!activeLayer) return null

  const config = legendConfigs[activeLayer]
  if (!config) return null

  return (
    <div className="glass rounded-xl p-3 min-w-[120px]">
      <p className="text-xs font-medium mb-2">{config.title}</p>
      <div className="space-y-1">
        {config.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="size-3 rounded-sm"
              style={{ backgroundColor: stop.color }}
            />
            <span className="text-xs text-muted-foreground">
              {stop.label}
              {config.unit && ` ${config.unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
