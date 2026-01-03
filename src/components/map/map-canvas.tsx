/**
 * 🗺️ MapCanvas Component
 * Full-screen spatial canvas with MapLibre
 */
'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import ReactMapGL, {
  type MapRef,
  NavigationControl,
} from 'react-map-gl/maplibre'

import { cn } from '@/lib/utils'
import { useMapStyle } from './use-map-style'

export interface MapCanvasProps {
  /** 📍 Initial center coordinates [lng, lat] */
  center?: [number, number]
  /** 🔍 Initial zoom level */
  zoom?: number
  /** 🌍 Whether the map is interactive */
  interactive?: boolean
  /** 📐 Additional class names */
  className?: string
  /** 🎯 Callback when location is selected */
  onLocationSelect?: (location: {
    lng: number
    lat: number
    name?: string
  }) => void
  /** 📊 Children (markers, layers, etc.) */
  children?: React.ReactNode
}

export interface MapCanvasHandle {
  /** 🗺️ Get the underlying map instance */
  getMap: () => maplibregl.Map | null
  /** ✈️ Fly to a location */
  flyTo: (lng: number, lat: number, zoom?: number) => void
  /** 🔍 Set zoom level */
  setZoom: (zoom: number) => void
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  function MapCanvas(
    {
      center = [-98.5795, 39.8283], // 📍 Default: center of USA
      zoom = 4,
      interactive = true,
      className,
      onLocationSelect,
      children,
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const { mapStyle } = useMapStyle()

    // 🎯 Expose map controls via ref
    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current?.getMap() ?? null,
      flyTo: (lng: number, lat: number, flyZoom?: number) => {
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: flyZoom ?? zoom,
          duration: 1500,
          essential: true,
        })
      },
      setZoom: (newZoom: number) => {
        mapRef.current?.setZoom(newZoom)
      },
    }))

    // 🖱️ Handle click on map
    const handleClick = useCallback(
      (event: maplibregl.MapMouseEvent) => {
        if (!onLocationSelect) return

        const { lng, lat } = event.lngLat
        onLocationSelect({ lng, lat })
      },
      [onLocationSelect],
    )

    // 🗺️ Handle map load
    const handleLoad = useCallback(() => {
      setIsLoaded(true)
    }, [])

    return (
      <div className={cn('relative w-full h-full', className)}>
        <ReactMapGL
          ref={mapRef}
          mapLib={maplibregl}
          mapStyle={mapStyle}
          initialViewState={{
            longitude: center[0],
            latitude: center[1],
            zoom: zoom,
          }}
          interactive={interactive}
          onClick={handleClick}
          onLoad={handleLoad}
          attributionControl={false}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {/* 🧭 Navigation controls */}
          {interactive && (
            <NavigationControl
              position="bottom-right"
              showCompass={true}
              showZoom={true}
              visualizePitch={true}
            />
          )}

          {/* 📍 Child components (markers, layers, etc.) */}
          {isLoaded && children}
        </ReactMapGL>

        {/* 📜 Attribution */}
        <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground/50 pointer-events-none">
          © OpenFreeMap © OpenStreetMap
        </div>
      </div>
    )
  },
)
