/**
 * 🌡️ WeatherPanel Component
 * Displays current temperature and weather conditions
 */
'use client'

import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getTemperatureCondition } from '@/lib/weather-utils'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface WeatherData {
  temperature: number
  apparentTemperature?: number
  humidity?: number
  windSpeed?: number
  weatherCode?: number
  precipitation?: number
}

interface WeatherPanelProps {
  /** 🏙️ Location name */
  location?: string
  /** 🌡️ Weather data */
  data?: WeatherData
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 🎬 Animation delay */
  animationDelay?: number
}

export function WeatherPanel({
  location,
  data,
  isLoading = false,
  colSpan = 2,
  animationDelay = 0,
}: WeatherPanelProps) {
  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<Thermometer size={20} />}
          title="Current Weather"
          subtitle={location}
        />
        <BentoPanelContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!data) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<Thermometer size={20} />}
          title="Current Weather"
          subtitle="Select a location"
        />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No location selected</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  const tempCondition = getTemperatureCondition(data.temperature)

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader
        icon={<Thermometer size={20} />}
        title="Current Weather"
        subtitle={location}
        action={
          <Badge variant="glass" size="pill">
            {tempCondition.emoji} {tempCondition.label}
          </Badge>
        }
      />
      <BentoPanelContent>
        <div className="space-y-4">
          {/* 🌡️ Temperature display */}
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'font-display text-5xl font-bold tracking-tighter',
                `temp-${tempCondition.severity}`,
              )}
            >
              {Math.round(data.temperature)}°
            </span>
            {data.apparentTemperature !== undefined && (
              <span className="text-muted-foreground text-lg">
                Feels like {Math.round(data.apparentTemperature)}°
              </span>
            )}
          </div>

          {/* 📊 Weather stats */}
          <div className="grid grid-cols-2 gap-4">
            {data.humidity !== undefined && (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Droplets size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-mono font-medium">{data.humidity}%</p>
                </div>
              </div>
            )}

            {data.windSpeed !== undefined && (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Wind size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-mono font-medium">
                    {Math.round(data.windSpeed)} km/h
                  </p>
                </div>
              </div>
            )}

            {data.precipitation !== undefined && (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Cloud size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precipitation</p>
                  <p className="font-mono font-medium">
                    {data.precipitation} mm
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
}
