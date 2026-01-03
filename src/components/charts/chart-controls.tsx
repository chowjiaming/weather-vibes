/**
 * 🎛️ Chart Controls Component
 * Configuration panel for chart customization
 */

'use client'

import {
  AreaChart,
  BarChart3,
  CircleDot,
  Download,
  LineChart,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { chartTypeConfig } from '@/lib/chart-config'
import type { ChartType } from '@/lib/search-params'
import { cn } from '@/lib/utils'

// 🎨 Chart type icons
const chartIcons = {
  line: LineChart,
  bar: BarChart3,
  area: AreaChart,
  scatter: CircleDot,
} as const

interface ChartControlsProps {
  /**
   * 📈 Current chart type
   */
  chartType: ChartType
  /**
   * 🔄 Callback when chart type changes
   */
  onChartTypeChange: (type: ChartType) => void
  /**
   * 📊 Overlay mode enabled
   */
  overlay?: boolean
  /**
   * 🔄 Callback when overlay mode changes
   */
  onOverlayChange?: (overlay: boolean) => void
  /**
   * 📥 Export callback
   */
  onExport?: (format: 'png' | 'csv') => void
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 📐 Compact mode
   */
  compact?: boolean
}

const chartTypeList: ChartType[] = ['line', 'bar', 'area', 'scatter']

export function ChartControls({
  chartType,
  onChartTypeChange,
  overlay = false,
  onOverlayChange,
  onExport,
  className,
  compact = false,
}: ChartControlsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap',
        compact ? 'gap-1' : 'gap-2',
        className,
      )}
    >
      {/* 📈 Chart type selector */}
      <div className="flex bg-muted rounded-md p-1">
        {chartTypeList.map((type) => {
          const Icon = chartIcons[type]
          const config = chartTypeConfig[type]
          const isActive = chartType === type

          return (
            <Button
              key={type}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'px-2 py-1',
                compact && 'px-1.5',
                isActive && 'bg-background',
              )}
              title={`${config.label}: ${config.description}`}
              onClick={() => onChartTypeChange(type)}
            >
              <Icon className={cn('h-4 w-4', compact && 'h-3.5 w-3.5')} />
            </Button>
          )
        })}
      </div>

      {/* 📊 Overlay toggle */}
      {onOverlayChange && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant={overlay ? 'secondary' : 'ghost'}
            size={compact ? 'sm' : 'default'}
            onClick={() => onOverlayChange(!overlay)}
            className={cn(compact && 'h-7 px-2 text-xs')}
          >
            {overlay ? 'Overlay On' : 'Overlay Off'}
          </Button>
        </>
      )}

      {/* 📥 Export buttons */}
      {onExport && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => onExport('png')}
              className={cn(compact && 'h-7 px-2')}
            >
              <Download
                className={cn('mr-1 h-4 w-4', compact && 'h-3.5 w-3.5 mr-0.5')}
              />
              {!compact && 'PNG'}
            </Button>
            <Button
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={() => onExport('csv')}
              className={cn(compact && 'h-7 px-2')}
            >
              <Download
                className={cn('mr-1 h-4 w-4', compact && 'h-3.5 w-3.5 mr-0.5')}
              />
              {!compact && 'CSV'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * 🏷️ Chart type label component
 */
export function ChartTypeLabel({
  type,
  className,
}: {
  type: ChartType
  className?: string
}) {
  const Icon = chartIcons[type]
  const config = chartTypeConfig[type]

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  )
}
