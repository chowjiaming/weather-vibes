/**
 * 🗺️ Layer Context
 * Global state management for map layer visibility
 *
 * 🎯 Provides centralized control over which weather layers are visible
 */
'use client'

import { createContext, useCallback, useContext, useState } from 'react'

// 📋 Available layer types
export type LayerId =
  | 'temperature'
  | 'precipitation'
  | 'clouds'
  | 'wind'
  | 'marine'
  | 'alerts'

export interface LayerState {
  id: LayerId
  enabled: boolean
}

interface LayerContextValue {
  /** 📊 Current layer states */
  layers: Record<LayerId, boolean>
  /** 🔀 Toggle a layer on/off */
  toggleLayer: (id: LayerId) => void
  /** ✅ Enable a layer */
  enableLayer: (id: LayerId) => void
  /** ❌ Disable a layer */
  disableLayer: (id: LayerId) => void
  /** 🔄 Set all layer states */
  setLayers: (layers: Record<LayerId, boolean>) => void
  /** 🎯 Get the currently active layer (first enabled) */
  activeLayer: LayerId | null
}

const LayerContext = createContext<LayerContextValue | null>(null)

// 🎨 Default layer states
const DEFAULT_LAYERS: Record<LayerId, boolean> = {
  temperature: false,
  precipitation: false,
  clouds: false,
  wind: false,
  marine: false,
  alerts: false,
}

interface LayerProviderProps {
  children: React.ReactNode
}

export function LayerProvider({ children }: LayerProviderProps) {
  const [layers, setLayersState] =
    useState<Record<LayerId, boolean>>(DEFAULT_LAYERS)

  const toggleLayer = useCallback((id: LayerId) => {
    setLayersState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const enableLayer = useCallback((id: LayerId) => {
    setLayersState((prev) => ({
      ...prev,
      [id]: true,
    }))
  }, [])

  const disableLayer = useCallback((id: LayerId) => {
    setLayersState((prev) => ({
      ...prev,
      [id]: false,
    }))
  }, [])

  const setLayers = useCallback((newLayers: Record<LayerId, boolean>) => {
    setLayersState(newLayers)
  }, [])

  // 🎯 Get the first enabled layer
  const activeLayer =
    (Object.entries(layers).find(([, enabled]) => enabled)?.[0] as LayerId) ??
    null

  return (
    <LayerContext.Provider
      value={{
        layers,
        toggleLayer,
        enableLayer,
        disableLayer,
        setLayers,
        activeLayer,
      }}
    >
      {children}
    </LayerContext.Provider>
  )
}

export function useLayers() {
  const context = useContext(LayerContext)
  if (!context) {
    throw new Error('useLayers must be used within a LayerProvider')
  }
  return context
}
