/**
 * 📅 ForecastPanel Component
 * Displays weather forecast for upcoming days
 *
 * 🚀 Performance: Wrapped in React.memo for render optimization
 */
'use client'

import { format, parseISO } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { memo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getTemperatureCondition } from '@/lib/weather-utils'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface ForecastDay {
  date: string
  tempMax: number
  tempMin: number
  weatherCode?: number
  precipitation?: number
}

interface ForecastPanelProps {
  /** 📅 Forecast data */
  data?: ForecastDay[]
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 🎬 Animation delay */
  animationDelay?: number
}

// 🌤️ Weather code to icon mapping
function getWeatherEmoji(code?: number): string {
  if (!code) return '🌤️'
  if (code <= 1) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌤️'
}

export const ForecastPanel = memo(function ForecastPanel({
  data,
  isLoading = false,
  colSpan = 3,
  animationDelay = 0,
}: ForecastPanelProps) {
  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<CalendarDays size={20} />}
          title="7-Day Forecast"
        />
        <BentoPanelContent>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-16 shrink-0" />
            ))}
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!data || data.length === 0) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<CalendarDays size={20} />}
          title="7-Day Forecast"
        />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No forecast data</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader
        icon={<CalendarDays size={20} />}
        title="7-Day Forecast"
      />
      <BentoPanelContent>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {data.slice(0, 7).map((day, index) => {
            const date = parseISO(day.date)
            const isToday = index === 0
            const maxCondition = getTemperatureCondition(day.tempMax)

            return (
              <div
                key={day.date}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl shrink-0 min-w-[72px]',
                  'transition-colors duration-200',
                  isToday
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 hover:bg-muted',
                )}
              >
                {/* 📅 Day name */}
                <p
                  className={cn(
                    'text-xs font-medium',
                    isToday ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {isToday ? 'Today' : format(date, 'EEE')}
                </p>

                {/* 🌤️ Weather icon */}
                <span className="text-2xl">
                  {getWeatherEmoji(day.weatherCode)}
                </span>

                {/* 🌡️ Temperature range */}
                <div className="flex items-center gap-1 font-mono text-sm">
                  <span className={`temp-${maxCondition.severity} font-medium`}>
                    {Math.round(day.tempMax)}°
                  </span>
                  <span className="text-muted-foreground text-xs">/</span>
                  <span className="text-muted-foreground">
                    {Math.round(day.tempMin)}°
                  </span>
                </div>

                {/* 🌧️ Precipitation */}
                {day.precipitation !== undefined && day.precipitation > 0 && (
                  <p className="text-[10px] text-blue-500">
                    {day.precipitation.toFixed(1)}mm
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
})
