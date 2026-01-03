/**
 * 📍 MapMarker Component
 * Location markers for the map canvas
 */
'use client'

import { MapPin } from 'lucide-react'
import { Marker } from 'react-map-gl/maplibre'
import { cn } from '@/lib/utils'

export interface MapMarkerProps {
  /** 📍 Longitude */
  longitude: number
  /** 📍 Latitude */
  latitude: number
  /** 🏷️ Label for the marker */
  label?: string
  /** 🎨 Variant for styling */
  variant?: 'default' | 'primary' | 'accent' | 'selected'
  /** 📏 Size of the marker */
  size?: 'sm' | 'md' | 'lg'
  /** 🖱️ Click handler */
  onClick?: () => void
  /** 🎯 Whether this marker is currently selected */
  selected?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
}

export function MapMarker({
  longitude,
  latitude,
  label,
  variant = 'default',
  size = 'md',
  onClick,
  selected = false,
}: MapMarkerProps) {
  const isSelected = selected || variant === 'selected'

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onClick?.()
      }}
    >
      <div
        className={cn(
          'flex flex-col items-center cursor-pointer transition-transform duration-200',
          'hover:scale-110',
          isSelected && 'scale-110',
        )}
      >
        {/* 📍 Marker pin */}
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            'shadow-lg border-2 border-white dark:border-gray-800',
            'transition-all duration-200',
            sizeClasses[size],
            {
              'bg-muted text-muted-foreground':
                variant === 'default' && !isSelected,
              'bg-primary text-primary-foreground':
                variant === 'primary' || isSelected,
              'bg-accent text-accent-foreground': variant === 'accent',
            },
          )}
        >
          <MapPin size={iconSizes[size]} strokeWidth={2.5} />
        </div>

        {/* 🏷️ Label */}
        {label && (
          <div
            className={cn(
              'mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
              'bg-background/90 backdrop-blur-sm shadow-sm',
              'border border-border/50',
              'max-w-[100px] truncate text-center',
              isSelected && 'bg-primary text-primary-foreground border-primary',
            )}
          >
            {label}
          </div>
        )}

        {/* 🎯 Pulse animation for selected */}
        {isSelected && (
          <div
            className={cn(
              'absolute -z-10 rounded-full bg-primary/20',
              'animate-ping',
              sizeClasses[size],
            )}
          />
        )}
      </div>
    </Marker>
  )
}
