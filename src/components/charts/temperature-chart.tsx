/**
 * 🌡️ Temperature Chart Component
 * Specialized chart for temperature data
 */

'use client'

import { motion } from 'motion/react'
import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from '@/lib/chart-config'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from './weather-chart'

interface TemperatureChartProps {
  /**
   * 📊 Chart data array
   */
  data: ChartDataPoint[]
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
   * 🌡️ Show min/max range as area
   */
  showRange?: boolean
  /**
   * 🌡️ Show mean temperature line
   */
  showMean?: boolean
  /**
   * 📍 Freezing reference line
   */
  showFreezingLine?: boolean
  /**
   * 🔢 Temperature unit
   */
  unit?: 'celsius' | 'fahrenheit'
}

export function TemperatureChart({
  data,
  title = 'Temperature',
  height = 300,
  className,
  showRange = true,
  showMean = false,
  showFreezingLine = true,
  unit = 'celsius',
}: TemperatureChartProps) {
  // 🌡️ Prepare data with temperature range
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      temperatureRange: [d.temperature_2m_min, d.temperature_2m_max],
    }))
  }, [data])

  // 🌡️ Get y-axis domain
  const yDomain = useMemo(() => {
    const temps = data
      .flatMap((d) => [
        d.temperature_2m_min as number,
        d.temperature_2m_max as number,
      ])
      .filter((t) => t !== null && t !== undefined)

    if (temps.length === 0) return [-10, 40]

    const min = Math.floor(Math.min(...temps) - 5)
    const max = Math.ceil(Math.max(...temps) + 5)

    return [min, max]
  }, [data])

  // 📊 Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{
      dataKey: string
      value: number | [number, number]
      color: string
      name: string
    }>
    label?: string
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const dataPoint = data.find((d) => d.formattedDate === label)
    const unitSymbol = unit === 'celsius' ? '°C' : '°F'

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
        <p className="font-medium text-sm mb-2">
          {dataPoint?.fullDate || label}
        </p>
        <div className="space-y-1 text-sm">
          {typeof dataPoint?.temperature_2m_max === 'number' && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                High
              </span>
              <span className="font-mono">
                {(dataPoint.temperature_2m_max as number).toFixed(1)}
                {unitSymbol}
              </span>
            </div>
          )}
          {typeof dataPoint?.temperature_2m_mean === 'number' && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Mean
              </span>
              <span className="font-mono">
                {(dataPoint.temperature_2m_mean as number).toFixed(1)}
                {unitSymbol}
              </span>
            </div>
          )}
          {typeof dataPoint?.temperature_2m_min === 'number' && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Low
              </span>
              <span className="font-mono">
                {(dataPoint.temperature_2m_min as number).toFixed(1)}
                {unitSymbol}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            🌡️ {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />

              {/* 📍 Freezing reference line */}
              {showFreezingLine && (
                <ReferenceLine
                  y={unit === 'celsius' ? 0 : 32}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Freezing',
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              )}

              {/* 🌡️ Temperature range area */}
              {showRange && (
                <Area
                  type="monotone"
                  dataKey="temperatureRange"
                  fill={chartColors.temperature_2m_max}
                  fillOpacity={0.1}
                  stroke="none"
                  name="Range"
                />
              )}

              {/* 🔴 Max temperature line */}
              <Line
                type="monotone"
                dataKey="temperature_2m_max"
                stroke={chartColors.temperature_2m_max}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="High"
                animationDuration={750}
              />

              {/* 🟡 Mean temperature line */}
              {showMean && (
                <Line
                  type="monotone"
                  dataKey="temperature_2m_mean"
                  stroke={chartColors.temperature_2m_mean}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  name="Mean"
                  animationDuration={750}
                />
              )}

              {/* 🔵 Min temperature line */}
              <Line
                type="monotone"
                dataKey="temperature_2m_min"
                stroke={chartColors.temperature_2m_min}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="Low"
                animationDuration={750}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
