/**
 * 🗺️ LazyMapCanvas Component
 * Lazy-loaded wrapper for MapCanvas to reduce initial bundle size
 * MapLibre + react-map-gl accounts for ~1MB, deferring this improves TTI
 */
'use client'

import { forwardRef, lazy, Suspense } from 'react'

import { cn } from '@/lib/utils'
import type { MapCanvasHandle, MapCanvasProps } from './map-canvas'

// 🎯 Lazy load the heavy map component
const MapCanvas = lazy(() =>
  import('./map-canvas').then((mod) => ({ default: mod.MapCanvas })),
)

/**
 * 🌐 MapSkeleton - Loading placeholder while map loads
 */
function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full h-full bg-gradient-to-br from-muted/50 to-muted animate-pulse',
        className,
      )}
    >
      {/* 🗺️ Abstract map pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <title>Map loading pattern</title>
          {/* 🌊 Topographic-style lines */}
          <path
            d="M0 20 Q25 10 50 20 T100 20"
            stroke="currentColor"
            strokeWidth="0.3"
            fill="none"
          />
          <path
            d="M0 40 Q25 30 50 40 T100 40"
            stroke="currentColor"
            strokeWidth="0.3"
            fill="none"
          />
          <path
            d="M0 60 Q25 50 50 60 T100 60"
            stroke="currentColor"
            strokeWidth="0.3"
            fill="none"
          />
          <path
            d="M0 80 Q25 70 50 80 T100 80"
            stroke="currentColor"
            strokeWidth="0.3"
            fill="none"
          />
        </svg>
      </div>

      {/* 🔄 Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3">
          <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">
            Loading map...
          </span>
        </div>
      </div>

      {/* 📍 Fake markers for visual interest */}
      <div className="absolute top-1/4 left-1/3 size-3 rounded-full bg-primary/30 animate-pulse" />
      <div
        className="absolute top-1/2 left-1/2 size-4 rounded-full bg-primary/40 animate-pulse"
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className="absolute top-2/3 left-2/3 size-3 rounded-full bg-primary/30 animate-pulse"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  )
}

/**
 * 🌍 LazyMapCanvas - Performance-optimized map component
 * Wraps MapCanvas in Suspense to defer loading of MapLibre (~1MB)
 */
export const LazyMapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  function LazyMapCanvas(props, ref) {
    return (
      <Suspense fallback={<MapSkeleton className={props.className} />}>
        <MapCanvas {...props} ref={ref} />
      </Suspense>
    )
  },
)

// 📦 Export skeleton for external use
export { MapSkeleton }
