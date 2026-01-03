/**
 * 🗺️ Map Components
 * MapLibre-based spatial canvas
 *
 * 🚀 Performance: Use LazyMapCanvas for lazy-loading the heavy MapLibre bundle
 */

// 🚀 Prefer LazyMapCanvas for better initial load performance
export { LazyMapCanvas, MapSkeleton } from './lazy-map'

// 📦 Types only - don't import the actual MapCanvas to enable code splitting
export type { MapCanvasHandle, MapCanvasProps } from './map-canvas'

export {
  AlertsLayer,
  CloudLayer,
  LayerLegend,
  MarineLayer,
  PrecipitationLayer,
  TemperatureLayer,
  WindLayer,
} from './map-layers'
export { MapMarker } from './map-marker'
export type { MapStyle } from './map-styles'
export { useMapStyle } from './use-map-style'
