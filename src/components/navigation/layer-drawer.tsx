/**
 * 📚 LayerDrawer Component
 * Slide-out drawer for toggling map layers
 */
'use client'

import {
  AlertTriangle,
  Cloud,
  Droplets,
  Layers,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

export interface LayerConfig {
  id: string
  label: string
  icon: React.ElementType
  description: string
  enabled: boolean
}

const defaultLayers: LayerConfig[] = [
  {
    id: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    description: 'Surface temperature heatmap',
    enabled: true,
  },
  {
    id: 'precipitation',
    label: 'Precipitation',
    icon: Droplets,
    description: 'Rain and snow forecast',
    enabled: false,
  },
  {
    id: 'clouds',
    label: 'Cloud Cover',
    icon: Cloud,
    description: 'Cloud coverage percentage',
    enabled: false,
  },
  {
    id: 'wind',
    label: 'Wind',
    icon: Wind,
    description: 'Wind speed and direction',
    enabled: false,
  },
  {
    id: 'marine',
    label: 'Marine',
    icon: Waves,
    description: 'Wave height and ocean data',
    enabled: false,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: AlertTriangle,
    description: 'Weather warnings and alerts',
    enabled: false,
  },
]

interface LayerDrawerProps {
  layers?: LayerConfig[]
  onLayerToggle?: (layerId: string, enabled: boolean) => void
}

export function LayerDrawer({
  layers: initialLayers = defaultLayers,
  onLayerToggle,
}: LayerDrawerProps) {
  const [layers, setLayers] = useState(initialLayers)
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer,
      ),
    )
    const layer = layers.find((l) => l.id === layerId)
    if (layer) {
      onLayerToggle?.(layerId, !layer.enabled)
    }
  }

  const enabledCount = layers.filter((l) => l.enabled).length

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="glass"
          size="icon-lg"
          className="rounded-full relative"
        >
          <Layers size={20} />
          {enabledCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {enabledCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Map Layers</DrawerTitle>
          <DrawerDescription>Toggle data overlays on the map</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-2">
          {layers.map((layer) => {
            const Icon = layer.icon
            return (
              <button
                type="button"
                key={layer.id}
                onClick={() => handleToggle(layer.id)}
                className={cn(
                  'w-full p-4 rounded-xl',
                  'flex items-start gap-4',
                  'text-left transition-all duration-200',
                  'border border-transparent',
                  'hover:bg-muted/50',
                  layer.enabled && [
                    'bg-primary/10 border-primary/20',
                    'dark:bg-primary/20',
                  ],
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-lg flex items-center justify-center',
                    'transition-colors duration-200',
                    layer.enabled
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium',
                      layer.enabled
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {layer.label}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {layer.description}
                  </p>
                </div>
                <div
                  className={cn(
                    'size-5 rounded-full border-2 transition-all duration-200',
                    layer.enabled
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30',
                  )}
                >
                  {layer.enabled && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="size-full text-primary-foreground p-0.5"
                      role="img"
                      aria-label="Layer enabled"
                    >
                      <title>Layer enabled</title>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
