/**
 * 📈 Trend Indicator Component
 * Visual indicators for data trends
 */

'use client'

import {
  ArrowDown,
  ArrowUp,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  /**
   * 📈 Trend direction
   */
  direction: 'up' | 'down' | 'stable'
  /**
   * 🔢 Change value
   */
  value?: number
  /**
   * 📏 Unit
   */
  unit?: string
  /**
   * 📐 Display variant
   */
  variant?: 'icon' | 'badge' | 'text' | 'arrow'
  /**
   * 📐 Size
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 🔄 Show animation
   */
  animate?: boolean
}

const directionConfig = {
  up: {
    Icon: TrendingUp,
    ArrowIcon: ArrowUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Increasing',
  },
  down: {
    Icon: TrendingDown,
    ArrowIcon: ArrowDown,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Decreasing',
  },
  stable: {
    Icon: Minus,
    ArrowIcon: Minus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Stable',
  },
}

const sizeClasses = {
  sm: 'h-3 w-3',
  default: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function TrendIndicator({
  direction,
  value,
  unit,
  variant = 'icon',
  size = 'default',
  className,
  animate = true,
}: TrendIndicatorProps) {
  const config = directionConfig[direction]
  const Icon = variant === 'arrow' ? config.ArrowIcon : config.Icon

  const content = (
    <>
      <Icon className={cn(sizeClasses[size], config.color)} />
      {value !== undefined && (
        <span className={cn('font-mono', config.color)}>
          {direction === 'up' ? '+' : ''}
          {value.toFixed(1)}
          {unit}
        </span>
      )}
    </>
  )

  const wrapper = animate ? (
    <motion.div
      initial={{ opacity: 0, y: direction === 'up' ? 5 : -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {content}
    </motion.div>
  ) : (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {content}
    </div>
  )

  if (variant === 'badge') {
    return (
      <Badge
        variant="secondary"
        className={cn('gap-1', config.bgColor, config.color, className)}
      >
        <Icon className={sizeClasses[size]} />
        {value !== undefined ? (
          <span className="font-mono">
            {direction === 'up' ? '+' : ''}
            {value.toFixed(1)}
            {unit}
          </span>
        ) : (
          config.label
        )}
      </Badge>
    )
  }

  if (variant === 'text') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1',
          config.color,
          className,
        )}
      >
        <Icon className={sizeClasses[size]} />
        <span>
          {config.label}
          {value !== undefined && (
            <span className="font-mono ml-1">
              ({direction === 'up' ? '+' : ''}
              {value.toFixed(1)}
              {unit})
            </span>
          )}
        </span>
      </span>
    )
  }

  return wrapper
}

/**
 * 📊 Trend comparison component
 */
interface TrendComparisonProps {
  /**
   * 📊 Current value
   */
  current: number
  /**
   * 📊 Previous value
   */
  previous: number
  /**
   * 📏 Unit
   */
  unit?: string
  /**
   * 📝 Label
   */
  label?: string
  /**
   * 🎨 Additional className
   */
  className?: string
}

export function TrendComparison({
  current,
  previous,
  unit = '',
  label,
  className,
}: TrendComparisonProps) {
  const change = current - previous
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0

  const direction: 'up' | 'down' | 'stable' =
    Math.abs(percentChange) < 1 ? 'stable' : change > 0 ? 'up' : 'down'

  const config = directionConfig[direction]

  return (
    <div className={cn('space-y-1', className)}>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">
          {current.toFixed(1)}
          {unit}
        </span>
        <div className={cn('flex items-center gap-1 text-sm', config.color)}>
          <config.Icon className="h-4 w-4" />
          <span className="font-mono">
            {direction === 'up' ? '+' : ''}
            {change.toFixed(1)}
            {unit}
          </span>
          <span className="text-muted-foreground">
            ({Math.abs(percentChange).toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
