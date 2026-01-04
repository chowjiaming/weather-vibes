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
import { VariableSelector } from '@/components/search/variable-selector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { chartTypeConfig } from '@/lib/chart-config'
import type {
  ChartType,
  CompareAggregation,
  CompareDataSource,
  CompareStat,
  WeatherVariable,
} from '@/lib/search-params'
import {
  compareAggregations,
  compareDataSources,
  compareStats,
} from '@/lib/search-params'
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

/**
 * 🧭 Compare Workspace Controls
 * Higher-level controls for the `/compare` analysis workspace.
 *
 * This lives alongside `ChartControls` to keep the UI patterns consistent
 * while avoiding breaking changes to existing chart consumers.
 */
export function CompareWorkspaceControls({
  vars,
  onVarsChange,
  yAxes,
  onAxisChange,
  source,
  onSourceChange,
  agg,
  onAggChange,
  stats,
  onStatsChange,
  smoothDays,
  onSmoothDaysChange,
  onExport,
  className,
}: {
  vars: WeatherVariable[]
  onVarsChange: (vars: WeatherVariable[]) => void
  yAxes: Partial<Record<WeatherVariable, 'left' | 'right'>>
  onAxisChange: (
    yAxes: Partial<Record<WeatherVariable, 'left' | 'right'>>,
  ) => void
  source: CompareDataSource
  onSourceChange: (source: CompareDataSource) => void
  agg: CompareAggregation
  onAggChange: (agg: CompareAggregation) => void
  stats: CompareStat[]
  onStatsChange: (stats: CompareStat[]) => void
  smoothDays: number
  onSmoothDaysChange: (days: number) => void
  onExport?: (format: 'png' | 'csv') => void
  className?: string
}) {
  const toggleAxis = (variable: WeatherVariable, side: 'left' | 'right') => {
    onAxisChange({ ...yAxes, [variable]: side })
  }

  const toggleStat = (stat: CompareStat) => {
    const next = stats.includes(stat)
      ? stats.filter((s) => s !== stat)
      : [...stats, stat]
    onStatsChange(next)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* 📊 Variables */}
      <VariableSelector
        value={vars}
        onChange={onVarsChange}
        maxSelections={6}
        className="min-w-[180px]"
      />

      {/* 🧪 Source */}
      <Select
        value={source}
        onValueChange={(v) => onSourceChange(v as CompareDataSource)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {compareDataSources.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 📦 Aggregation */}
      <Select
        value={agg}
        onValueChange={(v) => onAggChange(v as CompareAggregation)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {compareAggregations.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 🧭 Axes */}
      <Popover>
        {/* Base UI Trigger expects a render callback so it can wire events/ref correctly 🧩 */}
        <PopoverTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              variant="outline"
              size="sm"
              className={cn(triggerProps.className)}
            >
              Axes
            </Button>
          )}
        />
        <PopoverContent className="w-[320px]" align="start">
          <div className="text-sm font-medium mb-2">Y-axis assignment</div>
          <div className="space-y-2">
            {vars.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Pick variables first.
              </div>
            ) : (
              vars.map((v) => (
                <div
                  key={v}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="text-sm truncate">{v}</div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        (yAxes[v] ?? 'left') === 'left' ? 'secondary' : 'ghost'
                      }
                      onClick={() => toggleAxis(v, 'left')}
                    >
                      L
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={yAxes[v] === 'right' ? 'secondary' : 'ghost'}
                      onClick={() => toggleAxis(v, 'right')}
                    >
                      R
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* 📊 Overlays */}
      <Popover>
        {/* Base UI Trigger expects a render callback so it can wire events/ref correctly 🧩 */}
        <PopoverTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              variant="outline"
              size="sm"
              className={cn(triggerProps.className)}
            >
              Overlays
            </Button>
          )}
        />
        <PopoverContent className="w-[320px]" align="start">
          <div className="text-sm font-medium mb-2">Stats overlays</div>
          <div className="grid grid-cols-2 gap-2">
            {compareStats.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={stats.includes(s)}
                  onCheckedChange={() => toggleStat(s)}
                />
                {s}
              </label>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              Rolling window{' '}
              <span className="text-muted-foreground">(days)</span>
            </div>
            <Input
              className="w-[90px]"
              type="number"
              min={1}
              max={60}
              value={smoothDays}
              // UX: select-all so typing replaces `7` instead of appending (`714`) ✨
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onSmoothDaysChange(Number(e.target.value))}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* 📥 Export */}
      {onExport && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={() => onExport('png')}>
            <Download className="mr-1 h-4 w-4" />
            PNG
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onExport('csv')}>
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
        </>
      )}
    </div>
  )
}
