/**
 * 🌬️ AirQualityPanel Component
 * Displays air quality index and pollutant levels
 *
 * 🚀 Performance: Wrapped in React.memo for render optimization
 */
'use client'

import { Wind } from 'lucide-react'
import { memo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface AirQualityData {
  aqi: number
  pm25?: number
  pm10?: number
  no2?: number
  o3?: number
  so2?: number
  co?: number
}

interface AirQualityPanelProps {
  /** 🌬️ Air quality data */
  data?: AirQualityData
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 🎬 Animation delay */
  animationDelay?: number
}

// 🎨 AQI level configuration
const aqiLevels = [
  {
    max: 50,
    label: 'Good',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    emoji: '😊',
  },
  {
    max: 100,
    label: 'Moderate',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    emoji: '😐',
  },
  {
    max: 150,
    label: 'Unhealthy for Sensitive',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    emoji: '😷',
  },
  {
    max: 200,
    label: 'Unhealthy',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    emoji: '🤒',
  },
  {
    max: 300,
    label: 'Very Unhealthy',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    emoji: '🤢',
  },
  {
    max: Infinity,
    label: 'Hazardous',
    color: 'text-rose-800',
    bg: 'bg-rose-800/10',
    emoji: '☠️',
  },
]

function getAqiLevel(aqi: number) {
  return (
    aqiLevels.find((level) => aqi <= level.max) ??
    aqiLevels[aqiLevels.length - 1]
  )
}

export const AirQualityPanel = memo(function AirQualityPanel({
  data,
  isLoading = false,
  colSpan = 2,
  animationDelay = 0,
}: AirQualityPanelProps) {
  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<Wind size={20} />} title="Air Quality" />
        <BentoPanelContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-24" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!data) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<Wind size={20} />} title="Air Quality" />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No data available</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  const level = getAqiLevel(data.aqi)

  // 📊 Pollutant data
  const pollutants = [
    { label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
    { label: 'PM10', value: data.pm10, unit: 'µg/m³' },
    { label: 'NO₂', value: data.no2, unit: 'µg/m³' },
    { label: 'O₃', value: data.o3, unit: 'µg/m³' },
    { label: 'SO₂', value: data.so2, unit: 'µg/m³' },
    { label: 'CO', value: data.co, unit: 'mg/m³' },
  ].filter((p) => p.value !== undefined)

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader
        icon={<Wind size={20} />}
        title="Air Quality"
        action={
          <Badge variant="glass" size="pill">
            {level.emoji} {level.label}
          </Badge>
        }
      />
      <BentoPanelContent>
        <div className="space-y-4">
          {/* 📊 AQI gauge */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'size-16 rounded-2xl flex items-center justify-center',
                level.bg,
              )}
            >
              <span
                className={cn('font-display text-3xl font-bold', level.color)}
              >
                {data.aqi}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Air Quality Index</p>
              <p className={cn('font-medium', level.color)}>{level.label}</p>
            </div>
          </div>

          {/* 📊 Pollutant breakdown */}
          {pollutants.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {pollutants.slice(0, 6).map((pollutant) => (
                <div
                  key={pollutant.label}
                  className="p-2 rounded-lg bg-muted/50 text-center"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {pollutant.label}
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {pollutant.value?.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
})
