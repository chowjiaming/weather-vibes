/**
 * 📊 Weather Chart Component
 * Base chart wrapper with Recharts and Motion animations
 *
 * 🚀 Performance: Wrapped in React.memo with useMemo for transformations
 */

'use client'

import { motion } from 'motion/react'
import { memo, useCallback, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors, variableConfig } from '@/lib/chart-config'
import type { ChartType, WeatherVariable } from '@/lib/search-params'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '@/lib/weather-utils'

export type { ChartDataPoint }

interface WeatherChartProps {
  /**
   * 📊 Chart data array
   */
  data: ChartDataPoint[]
  /**
   * 📈 Variables to display
   */
  variables: WeatherVariable[]
  /**
   * 📈 Chart type
   */
  chartType?: ChartType
  /**
   * 📝 Chart title
   */
  title?: string
  /**
   * 📏 Chart height
   */
  height?: number
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 📍 Show reference line at value
   */
  referenceLine?: number
  /**
   * 📍 Show multiple reference lines (eg min/mean/max overlays)
   */
  referenceLines?: Array<{
    y: number
    yAxisId?: 'left' | 'right'
    label?: string
  }>
  /**
   * 🧭 Assign variables to left/right axes (multi-axis charts)
   */
  yAxes?: Partial<Record<WeatherVariable, 'left' | 'right'>>
  /**
   * 🔍 Enable a brush for zooming/selection (timeline charts)
   */
  brush?: {
    enabled?: boolean
    startIndex?: number
    endIndex?: number
    onChange?: (range: { startIndex?: number; endIndex?: number }) => void
  }
  /**
   * 🔗 Sync interactions across multiple charts
   */
  syncId?: string
  /**
   * 🔄 Animate on mount
   */
  animate?: boolean
  /**
   * 📊 Show grid lines
   */
  showGrid?: boolean
  /**
   * 📊 Show legend
   */
  showLegend?: boolean
}

export const WeatherChart = memo(function WeatherChart({
  data,
  variables,
  chartType = 'line',
  title,
  height = 300,
  className,
  referenceLine,
  referenceLines,
  yAxes,
  brush,
  syncId,
  animate = true,
  showGrid = true,
  showLegend = true,
}: WeatherChartProps) {
  // 📊 Prepare chart elements based on variables (memoized)
  const chartElements = useMemo(() => {
    // Default axis assignment: first variable goes left, others follow config or right.
    const defaultLeft = variables[0]

    return variables.map((variable) => {
      const axis: 'left' | 'right' =
        yAxes?.[variable] ?? (variable === defaultLeft ? 'left' : 'left')

      return {
        dataKey: variable,
        name: variableConfig[variable].shortLabel,
        color: chartColors[variable],
        unit: variableConfig[variable].unit,
        yAxisId: axis,
      }
    })
  }, [variables, yAxes])

  const hasRightAxis = useMemo(
    () => chartElements.some((el) => el.yAxisId === 'right'),
    [chartElements],
  )

  const leftUnit = useMemo(() => {
    const units = new Set(
      chartElements.filter((el) => el.yAxisId === 'left').map((el) => el.unit),
    )
    return units.size === 1 ? Array.from(units)[0] : undefined
  }, [chartElements])

  const rightUnit = useMemo(() => {
    const units = new Set(
      chartElements.filter((el) => el.yAxisId === 'right').map((el) => el.unit),
    )
    return units.size === 1 ? Array.from(units)[0] : undefined
  }, [chartElements])

  // 📊 Custom tooltip (memoized to prevent re-creation)
  const CustomTooltip = useCallback(
    ({
      active,
      payload,
      label,
    }: {
      active?: boolean
      payload?: Array<{
        dataKey: string
        value: number
        color: string
        name: string
      }>
      label?: string
    }) => {
      if (!active || !payload || payload.length === 0) return null

      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[150px]">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry) => {
              const variable = entry.dataKey as WeatherVariable
              const config = variableConfig[variable]
              return (
                <div
                  key={entry.dataKey}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span
                    className="flex items-center gap-2"
                    style={{ color: entry.color }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-mono">
                    {typeof entry.value === 'number'
                      ? entry.value.toFixed(1)
                      : '—'}
                    {config?.unit}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    },
    [],
  )

  // 📊 Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
      syncId,
    }

    const axisProps = {
      xAxis: (
        <XAxis
          dataKey="formattedDate"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
      ),
      yAxisLeft: (
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v) =>
            leftUnit
              ? `${v}${leftUnit}`
              : typeof v === 'number'
                ? String(v)
                : ''
          }
        />
      ),
      yAxisRight: hasRightAxis ? (
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v) =>
            rightUnit
              ? `${v}${rightUnit}`
              : typeof v === 'number'
                ? String(v)
                : ''
          }
        />
      ) : null,
      grid: showGrid ? (
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      ) : null,
      tooltip: <Tooltip content={<CustomTooltip />} />,
      legend: showLegend ? (
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
      ) : null,
      referenceLine: (() => {
        const lines =
          referenceLines && referenceLines.length > 0
            ? referenceLines
            : referenceLine !== undefined
              ? [{ y: referenceLine, yAxisId: 'left' as const }]
              : []

        if (lines.length === 0) return null

        return lines.map((l) => (
          <ReferenceLine
            key={`${l.yAxisId ?? 'left'}-${l.y}`}
            yAxisId={l.yAxisId ?? 'left'}
            y={l.y}
            label={l.label}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
          />
        ))
      })(),
      brush:
        brush?.enabled && data.length > 0 ? (
          <Brush
            dataKey="formattedDate"
            height={28}
            travellerWidth={10}
            startIndex={brush.startIndex}
            endIndex={brush.endIndex}
            onChange={(range) => {
              brush.onChange?.({
                startIndex: range?.startIndex,
                endIndex: range?.endIndex,
              })
            }}
          />
        ) : null,
    }

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxisLeft}
            {axisProps.yAxisRight}
            {axisProps.tooltip}
            {axisProps.legend}
            {axisProps.referenceLine}
            {chartElements.map((el) => (
              <Bar
                key={el.dataKey}
                yAxisId={el.yAxisId}
                dataKey={el.dataKey}
                name={el.name}
                fill={el.color}
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 750 : 0}
              />
            ))}
            {axisProps.brush}
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxisLeft}
            {axisProps.yAxisRight}
            {axisProps.tooltip}
            {axisProps.legend}
            {axisProps.referenceLine}
            {chartElements.map((el) => (
              <Area
                key={el.dataKey}
                yAxisId={el.yAxisId}
                type="monotone"
                dataKey={el.dataKey}
                name={el.name}
                stroke={el.color}
                fill={el.color}
                fillOpacity={0.2}
                animationDuration={animate ? 750 : 0}
              />
            ))}
            {axisProps.brush}
          </AreaChart>
        )

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxisLeft}
            {axisProps.yAxisRight}
            {axisProps.tooltip}
            {axisProps.legend}
            {chartElements.map((el) => (
              <Scatter
                key={el.dataKey}
                name={el.name}
                data={data}
                fill={el.color}
                animationDuration={animate ? 750 : 0}
              />
            ))}
            {axisProps.brush}
          </ScatterChart>
        )

      default:
        return (
          <LineChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxisLeft}
            {axisProps.yAxisRight}
            {axisProps.tooltip}
            {axisProps.legend}
            {axisProps.referenceLine}
            {chartElements.map((el) => (
              <Line
                key={el.dataKey}
                type="monotone"
                dataKey={el.dataKey}
                name={el.name}
                stroke={el.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                animationDuration={animate ? 750 : 0}
                yAxisId={el.yAxisId}
              />
            ))}
            {axisProps.brush}
          </LineChart>
        )
    }
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(className)}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn(!title && 'pt-6')}>
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
})
