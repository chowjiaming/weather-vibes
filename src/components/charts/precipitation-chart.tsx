/**
 * 🌧️ Precipitation Chart Component
 * Specialized chart for precipitation data
 */

'use client'

import { motion } from 'motion/react'
import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from '@/lib/chart-config'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from './weather-chart'

interface PrecipitationChartProps {
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
   * 🌧️ Show rain specifically
   */
  showRain?: boolean
  /**
   * ❄️ Show snowfall
   */
  showSnow?: boolean
  /**
   * ⏱️ Show precipitation hours
   */
  showHours?: boolean
  /**
   * 💧 Precipitation unit
   */
  unit?: 'mm' | 'inch'
}

export function PrecipitationChart({
  data,
  title = 'Precipitation',
  height = 300,
  className,
  showRain = false,
  showSnow = false,
  showHours = false,
  unit = 'mm',
}: PrecipitationChartProps) {
  // 🌧️ Calculate statistics
  const stats = useMemo(() => {
    const precipValues = data
      .map((d) => d.precipitation_sum as number)
      .filter((v) => v !== null && v !== undefined)

    if (precipValues.length === 0) {
      return { total: 0, average: 0, rainyDays: 0 }
    }

    const total = precipValues.reduce((a, b) => a + b, 0)
    const average = total / precipValues.length
    const rainyDays = precipValues.filter((v) => v > 0).length

    return { total, average, rainyDays }
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
      value: number
      color: string
      name: string
    }>
    label?: string
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const dataPoint = data.find((d) => d.formattedDate === label)
    const unitSymbol = unit === 'mm' ? 'mm' : 'in'

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
        <p className="font-medium text-sm mb-2">
          {dataPoint?.fullDate || label}
        </p>
        <div className="space-y-1 text-sm">
          {payload.map((entry) => (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4"
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
                {entry.value?.toFixed(1) ?? '—'}
                {entry.dataKey === 'precipitation_hours' ? 'h' : unitSymbol}
              </span>
            </div>
          ))}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              🌧️ {title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Total:{' '}
                <span className="font-mono font-medium text-foreground">
                  {stats.total.toFixed(1)}
                  {unit}
                </span>
              </span>
              <span>
                Rainy days:{' '}
                <span className="font-mono font-medium text-foreground">
                  {stats.rainyDays}
                </span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={data}
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
                yAxisId="precip"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}${unit}`}
              />
              {showHours && (
                <YAxis
                  yAxisId="hours"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(v) => `${v}h`}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />

              {/* 💧 Total precipitation bar */}
              <Bar
                yAxisId="precip"
                dataKey="precipitation_sum"
                fill={chartColors.precipitation_sum}
                radius={[4, 4, 0, 0]}
                name="Total"
                animationDuration={750}
              />

              {/* 🌧️ Rain bar */}
              {showRain && (
                <Bar
                  yAxisId="precip"
                  dataKey="rain_sum"
                  fill={chartColors.rain_sum}
                  radius={[4, 4, 0, 0]}
                  name="Rain"
                  animationDuration={750}
                />
              )}

              {/* ❄️ Snow bar */}
              {showSnow && (
                <Bar
                  yAxisId="precip"
                  dataKey="snowfall_sum"
                  fill={chartColors.snowfall_sum}
                  radius={[4, 4, 0, 0]}
                  name="Snowfall"
                  animationDuration={750}
                />
              )}

              {/* ⏱️ Precipitation hours line */}
              {showHours && (
                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="precipitation_hours"
                  stroke={chartColors.precipitation_hours}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  name="Hours"
                  animationDuration={750}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
