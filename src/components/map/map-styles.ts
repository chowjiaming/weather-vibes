/**
 * 🎨 Abstract Topographic Map Styles
 * Custom map styles for the Weather Vibes aesthetic
 */
import type { StyleSpecification } from 'maplibre-gl'

export type MapStyle = 'light' | 'dark' | 'satellite'

/**
 * 🌤️ Light theme - Abstract topographic style
 */
export const lightMapStyle: StyleSpecification = {
  version: 8,
  name: 'Weather Vibes Light',
  sources: {
    // 🗺️ OpenFreeMap tiles (free, no API key required)
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  layers: [
    // 🎨 Background - Warm cream
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f5f3ef',
      },
    },
    // 🌊 Water bodies
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': '#cce4f0',
        'fill-opacity': 0.8,
      },
    },
    // 🏔️ Landcover - subtle topo effect
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'grass'],
      paint: {
        'fill-color': '#e8efe4',
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: {
        'fill-color': '#dde8d6',
        'fill-opacity': 0.5,
      },
    },
    // 📐 Contour lines (abstract topographic effect)
    {
      id: 'contour',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'contour',
      paint: {
        'line-color': '#d4cfc5',
        'line-width': 0.5,
        'line-opacity': 0.3,
      },
    },
    // 🛤️ Roads - minimal
    {
      id: 'roads-highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: {
        'line-color': '#e0dbd3',
        'line-width': 2,
      },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary'],
      paint: {
        'line-color': '#e8e3db',
        'line-width': 1,
      },
    },
    // 🏘️ Buildings - subtle
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#e0dbd3',
        'fill-opacity': 0.5,
      },
    },
    // 🏷️ Place labels - minimal
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#6b6560',
        'text-halo-color': '#f5f3ef',
        'text-halo-width': 1.5,
      },
    },
    {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'town'],
      minzoom: 8,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 12,
        'text-letter-spacing': 0.05,
      },
      paint: {
        'text-color': '#8a847c',
        'text-halo-color': '#f5f3ef',
        'text-halo-width': 1,
      },
    },
    // 🌍 Country boundaries
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': '#c5bfb5',
        'line-width': 1,
        'line-dasharray': [2, 2],
      },
    },
  ],
}

/**
 * 🌙 Dark theme - Night sky style
 */
export const darkMapStyle: StyleSpecification = {
  version: 8,
  name: 'Weather Vibes Dark',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  layers: [
    // 🎨 Background - Deep blue-gray
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1a1d24',
      },
    },
    // 🌊 Water bodies
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': '#1e2530',
        'fill-opacity': 0.9,
      },
    },
    // 🏔️ Landcover
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'grass'],
      paint: {
        'fill-color': '#1f2428',
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: {
        'fill-color': '#1c2025',
        'fill-opacity': 0.5,
      },
    },
    // 📐 Contour lines
    {
      id: 'contour',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'contour',
      paint: {
        'line-color': '#2a2f38',
        'line-width': 0.5,
        'line-opacity': 0.4,
      },
    },
    // 🛤️ Roads
    {
      id: 'roads-highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: {
        'line-color': '#2f343d',
        'line-width': 2,
      },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary'],
      paint: {
        'line-color': '#262a32',
        'line-width': 1,
      },
    },
    // 🏘️ Buildings
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#252930',
        'fill-opacity': 0.6,
      },
    },
    // 🏷️ Place labels
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 14,
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#9ca3af',
        'text-halo-color': '#1a1d24',
        'text-halo-width': 1.5,
      },
    },
    {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'town'],
      minzoom: 8,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 12,
        'text-letter-spacing': 0.05,
      },
      paint: {
        'text-color': '#6b7280',
        'text-halo-color': '#1a1d24',
        'text-halo-width': 1,
      },
    },
    // 🌍 Country boundaries
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': '#3f4654',
        'line-width': 1,
        'line-dasharray': [2, 2],
      },
    },
  ],
}

/**
 * 🎯 Get map style based on theme
 */
export function getMapStyle(theme: MapStyle): StyleSpecification {
  switch (theme) {
    case 'dark':
      return darkMapStyle
    default:
      return lightMapStyle
  }
}
