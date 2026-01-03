/**
 * 📊 Stat Cards Component
 * Display summary statistics for weather data
 */

'use client'

import {
  Droplets,
  Minus,
  Sun,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  Wind,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  /**
   * 📝 Stat label
   */
  label: string
  /**
   * 🔢 Stat value
   */
  value: string | number
  /**
   * 📏 Unit
   */
  unit?: string
  /**
   * 🎨 Icon
   */
  icon?: React.ReactNode
  /**
   * 📈 Trend direction
   */
  trend?: 'up' | 'down' | 'stable'
  /**
   * 📊 Trend value
   */
  trendValue?: string
  /**
   * 🎨 Color variant
   */
  variant?: 'default' | 'temperature' | 'precipitation' | 'wind' | 'radiation'
  /**
   * 🎨 Additional className
   */
  className?: string
}

const variantClasses = {
  default: 'text-foreground',
  temperature: 'text-amber-500',
  precipitation: 'text-sky-500',
  wind: 'text-emerald-500',
  radiation: 'text-yellow-500',
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const trendColors = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  stable: 'text-muted-foreground',
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    variantClasses[variant],
                  )}
                >
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </span>
                {unit && (
                  <span className="text-sm text-muted-foreground">{unit}</span>
                )}
              </div>
              {trend && trendValue && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    trendColors[trend],
                  )}
                >
                  {TrendIcon && <TrendIcon className="h-3 w-3" />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {icon && (
              <div className={cn('text-muted-foreground/50')}>{icon}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * 📊 Weather stats grid component
 */
interface WeatherStatsProps {
  /**
   * 🌡️ Average temperature
   */
  avgTemp?: number
  /**
   * 🌡️ Max temperature
   */
  maxTemp?: number
  /**
   * 🌡️ Min temperature
   */
  minTemp?: number
  /**
   * 🌧️ Total precipitation
   */
  totalPrecip?: number
  /**
   * 🌧️ Rainy days
   */
  rainyDays?: number
  /**
   * 💨 Avg wind speed
   */
  avgWind?: number
  /**
   * ☀️ Avg radiation
   */
  avgRadiation?: number
  /**
   * 🎨 Additional className
   */
  className?: string
}

export function WeatherStats({
  avgTemp,
  maxTemp,
  minTemp,
  totalPrecip,
  rainyDays,
  avgWind,
  avgRadiation,
  className,
}: WeatherStatsProps) {
  const stats = [
    avgTemp !== undefined && {
      label: 'Avg Temperature',
      value: avgTemp,
      unit: '°C',
      icon: <Thermometer className="h-5 w-5" />,
      variant: 'temperature' as const,
    },
    maxTemp !== undefined && {
      label: 'Max Temperature',
      value: maxTemp,
      unit: '°C',
      icon: <ThermometerSun className="h-5 w-5" />,
      variant: 'temperature' as const,
    },
    minTemp !== undefined && {
      label: 'Min Temperature',
      value: minTemp,
      unit: '°C',
      icon: <ThermometerSnowflake className="h-5 w-5" />,
      variant: 'temperature' as const,
    },
    totalPrecip !== undefined && {
      label: 'Total Precipitation',
      value: totalPrecip,
      unit: 'mm',
      icon: <Droplets className="h-5 w-5" />,
      variant: 'precipitation' as const,
    },
    rainyDays !== undefined && {
      label: 'Rainy Days',
      value: rainyDays,
      unit: 'days',
      icon: <Droplets className="h-5 w-5" />,
      variant: 'precipitation' as const,
    },
    avgWind !== undefined && {
      label: 'Avg Wind Speed',
      value: avgWind,
      unit: 'km/h',
      icon: <Wind className="h-5 w-5" />,
      variant: 'wind' as const,
    },
    avgRadiation !== undefined && {
      label: 'Avg Radiation',
      value: avgRadiation,
      unit: 'MJ/m²',
      icon: <Sun className="h-5 w-5" />,
      variant: 'radiation' as const,
    },
  ].filter(Boolean) as Array<{
    label: string
    value: number
    unit: string
    icon: React.ReactNode
    variant: 'temperature' | 'precipitation' | 'wind' | 'radiation'
  }>

  if (stats.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
