/**
 * 🔄 Comparison Chart Component
 * Multi-year overlay chart for year-over-year comparison
 */

'use client'

import { motion } from 'motion/react'
import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { variableConfig } from '@/lib/chart-config'
import type { WeatherVariable } from '@/lib/search-params'
import { cn } from '@/lib/utils'

// 🎨 Year colors for comparison
const yearColors = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

// Exported for use in routes
export interface ComparisonDataPoint {
  dayOfYear: number
  label: string
  [key: string]: string | number | null
}

interface ComparisonChartProps {
  /**
   * 📊 Comparison data with year columns
   */
  data: ComparisonDataPoint[]
  /**
   * 🔢 Years being compared
   */
  years: number[]
  /**
   * 📊 Variable being compared
   */
  variable: WeatherVariable
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
}

export function ComparisonChart({
  data,
  years,
  variable,
  title,
  height = 350,
  className,
}: ComparisonChartProps) {
  const config = variableConfig[variable]
  const chartTitle = title || `${config.label} Comparison`

  // 📊 Prepare year data keys
  const yearKeys = useMemo(() => {
    return years.map((year, index) => ({
      dataKey: `year_${year}`,
      name: year.toString(),
      color: yearColors[index % yearColors.length],
    }))
  }, [years])

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

    const dataPoint = data.find((d) => d.label === label)

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="font-medium text-sm mb-2">{dataPoint?.label || label}</p>
        <div className="space-y-1">
          {payload
            .filter((entry) => entry.value !== null)
            .sort((a, b) => b.value - a.value)
            .map((entry) => (
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
                  {entry.value?.toFixed(1) ?? '—'}
                  {config.unit}
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
          <CardTitle className="text-base font-medium flex items-center gap-2">
            🔄 {chartTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v) => `${v}${config.unit}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-sm font-medium">{value}</span>
                )}
              />

              {yearKeys.map((year) => (
                <Line
                  key={year.dataKey}
                  type="monotone"
                  dataKey={year.dataKey}
                  name={year.name}
                  stroke={year.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  connectNulls
                  animationDuration={750}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* 📊 Year legend with stats */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {years.map((year, index) => {
              const yearData = data
                .map((d) => d[`year_${year}`])
                .filter((v): v is number => v !== null && v !== undefined)

              const avg =
                yearData.length > 0
                  ? yearData.reduce((a, b) => a + b, 0) / yearData.length
                  : null

              return (
                <div
                  key={year}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: yearColors[index % yearColors.length] }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: yearColors[index % yearColors.length],
                    }}
                  />
                  <span className="font-medium">{year}</span>
                  {avg !== null && (
                    <span className="text-muted-foreground">
                      (avg: {avg.toFixed(1)}
                      {config.unit})
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
