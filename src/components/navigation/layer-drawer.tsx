/**
 * 📚 LayerDrawer Component
 * Slide-out drawer for toggling map layers
 *
 * 🔗 Connected to LayerContext for global state management
 * 🌧️ Uses RainViewer for free precipitation radar
 */
'use client'

import {
  AlertTriangle,
  Check,
  Cloud,
  Droplets,
  Layers,
  Thermometer,
  Waves,
  Wind,
  X,
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
import { type LayerId, useLayers } from '@/contexts/layer-context'
import { cn } from '@/lib/utils'

interface LayerConfig {
  id: LayerId
  label: string
  icon: React.ElementType
  description: string
  available: boolean
  source?: string
}

// 📋 Layer configurations with availability status
const layerConfigs: LayerConfig[] = [
  {
    id: 'precipitation',
    label: 'Precipitation',
    icon: Droplets,
    description: 'Real-time radar from RainViewer',
    available: true,
    source: 'RainViewer (Free)',
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    description: 'Surface temperature heatmap',
    available: false,
  },
  {
    id: 'clouds',
    label: 'Cloud Cover',
    icon: Cloud,
    description: 'Cloud coverage percentage',
    available: false,
  },
  {
    id: 'wind',
    label: 'Wind',
    icon: Wind,
    description: 'Wind speed and direction',
    available: false,
  },
  {
    id: 'marine',
    label: 'Marine',
    icon: Waves,
    description: 'Wave height and ocean data',
    available: false,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: AlertTriangle,
    description: 'Weather warnings',
    available: false,
  },
]

export function LayerDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { layers, toggleLayer } = useLayers()

  // 📊 Count enabled layers
  const enabledCount = Object.values(layers).filter(Boolean).length

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
          {layerConfigs.map((layer) => {
            const Icon = layer.icon
            const isEnabled = layers[layer.id]
            const isDisabled = !layer.available

            return (
              <button
                type="button"
                key={layer.id}
                onClick={() => !isDisabled && toggleLayer(layer.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full p-4 rounded-xl',
                  'flex items-start gap-4',
                  'text-left transition-all duration-200',
                  'border border-transparent',
                  layer.available && 'hover:bg-muted/50',
                  isEnabled && [
                    'bg-primary/10 border-primary/20',
                    'dark:bg-primary/20',
                  ],
                  isDisabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-lg flex items-center justify-center',
                    'transition-colors duration-200',
                    isEnabled
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'font-medium',
                        isEnabled ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {layer.label}
                    </p>
                    {/* 🏷️ Availability badge */}
                    {layer.available ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                        <Check size={10} />
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                        <X size={10} />
                        N/A
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {layer.description}
                  </p>
                  {layer.source && (
                    <p className="text-xs text-primary/70 mt-0.5">
                      {layer.source}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    'size-5 rounded-full border-2 transition-all duration-200',
                    isEnabled
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30',
                    isDisabled && 'opacity-30',
                  )}
                >
                  {isEnabled && (
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

        {/* 📝 Footer note */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            Precipitation radar powered by{' '}
            <a
              href="https://www.rainviewer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              RainViewer
            </a>
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
