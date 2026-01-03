/**
 * ⚡ Vite Configuration
 * Optimized for performance with code splitting and chunking
 */
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  plugins: [
    devtools(),
    netlify(),
    // 🔗 Enable path aliases from tsconfig
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    // 🚀 TanStack Start plugin
    tanstackStart(),
    viteReact(),
  ],
  // 📦 Build optimization
  build: {
    // 🎯 Increase chunk size warning limit (MapLibre is large)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 📊 Manual chunks for large dependencies
        manualChunks: (id) => {
          // 🗺️ Map libraries (largest chunk)
          if (id.includes('maplibre-gl') || id.includes('react-map-gl')) {
            return 'maplibre'
          }
          // 📈 Charting library
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'recharts'
          }
          // 🎬 Animation library
          if (id.includes('motion') || id.includes('framer-motion')) {
            return 'motion'
          }
          // 📅 Date utilities
          if (id.includes('date-fns')) {
            return 'date-fns'
          }
          return undefined
        },
      },
    },
  },
})

export default config
