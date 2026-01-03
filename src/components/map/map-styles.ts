/**
 * 🎨 Monochrome Map Styles
 * Sophisticated grayscale aesthetic that lets weather data pop
 * Clean, minimal design that focuses attention on overlays
 */
import type { StyleSpecification } from 'maplibre-gl'

export type MapStyle = 'light' | 'dark' | 'satellite'

/**
 * 🌤️ Light Monochrome Theme
 * Warm off-white base with subtle gray variations
 */
export const lightMapStyle: StyleSpecification = {
  version: 8,
  name: 'Weather Vibes Light Mono',
  sources: {
    // 🗺️ OpenFreeMap tiles (free, no API key required)
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  layers: [
    // 🎨 Background - Warm off-white
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#fafafa',
      },
    },

    // 🌊 Water bodies - Light gray
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': '#e5e5e5',
        'fill-opacity': 1,
      },
    },

    // 🏔️ Landcover - Subtle gray variations
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'grass'],
      paint: {
        'fill-color': '#f0f0f0',
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: {
        'fill-color': '#e8e8e8',
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'landcover-sand',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'sand'],
      paint: {
        'fill-color': '#f5f5f5',
        'fill-opacity': 0.5,
      },
    },

    // 🏔️ Landuse - Minimal
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'cemetery'],
      paint: {
        'fill-color': '#ebebeb',
        'fill-opacity': 0.4,
      },
    },

    // 📐 Contour lines - Very subtle
    {
      id: 'contour',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'contour',
      paint: {
        'line-color': '#e0e0e0',
        'line-width': 0.4,
        'line-opacity': 0.2,
      },
    },

    // 🛤️ Roads - Barely visible
    {
      id: 'roads-highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: {
        'line-color': '#d4d4d4',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          0.5,
          10,
          2,
          15,
          4,
        ],
      },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk'],
      paint: {
        'line-color': '#d9d9d9',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          0.3,
          12,
          1,
          16,
          2,
        ],
      },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'path'],
      minzoom: 12,
      paint: {
        'line-color': '#e0e0e0',
        'line-width': 0.5,
      },
    },

    // 🏘️ Buildings - Subtle
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#e3e3e3',
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.2, 16, 0.5],
      },
    },

    // 🌍 Country boundaries - Dashed light gray
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': '#c4c4c4',
        'line-width': 1,
        'line-dasharray': [3, 2],
      },
    },

    // 🗺️ State/Province boundaries
    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 4],
      minzoom: 4,
      paint: {
        'line-color': '#d4d4d4',
        'line-width': 0.5,
        'line-dasharray': [2, 2],
        'line-opacity': 0.6,
      },
    },

    // 🏷️ Country labels - Medium gray
    {
      id: 'place-country',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'country'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 6, 14],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#8a8a8a',
        'text-halo-color': '#fafafa',
        'text-halo-width': 2,
      },
    },

    // 🏷️ City labels - Medium gray
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Semibold'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          10,
          8,
          14,
          12,
          18,
        ],
        'text-letter-spacing': 0.05,
      },
      paint: {
        'text-color': '#737373',
        'text-halo-color': '#fafafa',
        'text-halo-width': 1.5,
      },
    },

    // 🏷️ Town labels
    {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'town'],
      minzoom: 7,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 12, 14],
        'text-letter-spacing': 0.03,
      },
      paint: {
        'text-color': '#8a8a8a',
        'text-halo-color': '#fafafa',
        'text-halo-width': 1,
      },
    },

    // 🏷️ Village labels
    {
      id: 'place-village',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'village'],
      minzoom: 10,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 11,
      },
      paint: {
        'text-color': '#9a9a9a',
        'text-halo-color': '#fafafa',
        'text-halo-width': 1,
      },
    },
  ],
}

/**
 * 🌙 Dark Monochrome Theme
 * Deep charcoal base with subtle variations
 */
export const darkMapStyle: StyleSpecification = {
  version: 8,
  name: 'Weather Vibes Dark Mono',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  layers: [
    // 🎨 Background - Deep charcoal
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0a0a0a',
      },
    },

    // 🌊 Water bodies - Slightly lighter
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': '#171717',
        'fill-opacity': 1,
      },
    },

    // 🏔️ Landcover - Subtle variations
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'grass'],
      paint: {
        'fill-color': '#141414',
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: {
        'fill-color': '#121212',
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'landcover-sand',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'sand'],
      paint: {
        'fill-color': '#1a1a1a',
        'fill-opacity': 0.5,
      },
    },

    // 🏔️ Landuse - Minimal
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'cemetery'],
      paint: {
        'fill-color': '#151515',
        'fill-opacity': 0.4,
      },
    },

    // 📐 Contour lines - Very subtle
    {
      id: 'contour',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'contour',
      paint: {
        'line-color': '#1f1f1f',
        'line-width': 0.4,
        'line-opacity': 0.3,
      },
    },

    // 🛤️ Roads - Barely visible
    {
      id: 'roads-highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: {
        'line-color': '#2d2d2d',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          0.5,
          10,
          2,
          15,
          4,
        ],
      },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk'],
      paint: {
        'line-color': '#262626',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          0.3,
          12,
          1,
          16,
          2,
        ],
      },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'path'],
      minzoom: 12,
      paint: {
        'line-color': '#222222',
        'line-width': 0.5,
      },
    },

    // 🏘️ Buildings - Subtle
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#1c1c1c',
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 16, 0.6],
      },
    },

    // 🌍 Country boundaries - Dashed medium gray
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': '#404040',
        'line-width': 1,
        'line-dasharray': [3, 2],
      },
    },

    // 🗺️ State/Province boundaries
    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 4],
      minzoom: 4,
      paint: {
        'line-color': '#333333',
        'line-width': 0.5,
        'line-dasharray': [2, 2],
        'line-opacity': 0.6,
      },
    },

    // 🏷️ Country labels - Muted gray
    {
      id: 'place-country',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'country'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 6, 14],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#707070',
        'text-halo-color': '#0a0a0a',
        'text-halo-width': 2,
      },
    },

    // 🏷️ City labels - Muted gray
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Semibold'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          10,
          8,
          14,
          12,
          18,
        ],
        'text-letter-spacing': 0.05,
      },
      paint: {
        'text-color': '#a3a3a3',
        'text-halo-color': '#0a0a0a',
        'text-halo-width': 1.5,
      },
    },

    // 🏷️ Town labels
    {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'town'],
      minzoom: 7,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 12, 14],
        'text-letter-spacing': 0.03,
      },
      paint: {
        'text-color': '#808080',
        'text-halo-color': '#0a0a0a',
        'text-halo-width': 1,
      },
    },

    // 🏷️ Village labels
    {
      id: 'place-village',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'village'],
      minzoom: 10,
      layout: {
        'text-field': ['get', 'name:en'],
        'text-font': ['Open Sans Regular'],
        'text-size': 11,
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#0a0a0a',
        'text-halo-width': 1,
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
