/**
 * 📋 Weather Table Component
 * Sortable data table for weather records
 */

'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { chartColors, variableConfig } from '@/lib/chart-config'
import type { WeatherVariable } from '@/lib/search-params'
import { cn } from '@/lib/utils'
import {
  getPrecipitationCondition,
  getTemperatureCondition,
} from '@/lib/weather-utils'

interface WeatherTableProps {
  /**
   * 📊 Weather data array
   */
  data: Array<{
    date: string
    fullDate?: string
    [key: string]: string | number | null | undefined
  }>
  /**
   * 📊 Variables to display
   */
  variables: WeatherVariable[]
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 📦 Show condition badges
   */
  showConditions?: boolean
  /**
   * 📐 Maximum rows to show
   */
  maxRows?: number
}

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'date' | WeatherVariable

export function WeatherTable({
  data,
  variables,
  className,
  showConditions = true,
  maxRows,
}: WeatherTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // 🔄 Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // 🔄 Cycle: desc -> asc -> null
      setSortDirection((prev) =>
        prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc',
      )
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // 📊 Sort data
  const sortedData = useMemo(() => {
    if (!sortDirection) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }, [data, sortColumn, sortDirection])

  // 📊 Limit rows if needed
  const displayData = maxRows ? sortedData.slice(0, maxRows) : sortedData

  // 🎨 Render sort icon
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column || !sortDirection) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  // 🎨 Render cell value with formatting
  const renderCell = (value: unknown, variable: WeatherVariable) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }

    const config = variableConfig[variable]
    const numValue = typeof value === 'number' ? value : Number(value)

    // 🌡️ Temperature condition badge
    if (
      showConditions &&
      variable.includes('temperature') &&
      !Number.isNaN(numValue)
    ) {
      const condition = getTemperatureCondition(numValue)
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {numValue.toFixed(1)}
            {config.unit}
          </span>
          <span className="text-sm">{condition.emoji}</span>
        </div>
      )
    }

    // 🌧️ Precipitation condition badge
    if (
      showConditions &&
      variable === 'precipitation_sum' &&
      !Number.isNaN(numValue)
    ) {
      const condition = getPrecipitationCondition(numValue)
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {numValue.toFixed(1)}
            {config.unit}
          </span>
          {numValue > 0 && <span className="text-sm">{condition.emoji}</span>}
        </div>
      )
    }

    return (
      <span className="font-mono">
        {typeof numValue === 'number' && !Number.isNaN(numValue)
          ? numValue.toFixed(1)
          : String(value ?? '')}
        {config.unit}
      </span>
    )
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {/* 📅 Date column */}
            <TableHead className="w-[140px]">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
                onClick={() => handleSort('date')}
              >
                Date
                <SortIcon column="date" />
              </Button>
            </TableHead>

            {/* 📊 Variable columns */}
            {variables.map((variable) => {
              const config = variableConfig[variable]
              return (
                <TableHead key={variable}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort(variable)}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: chartColors[variable] }}
                    />
                    {config.shortLabel}
                    <SortIcon column={variable} />
                  </Button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {displayData.map((row, index) => (
              <motion.tr
                key={row.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {row.fullDate || row.date}
                </TableCell>
                {variables.map((variable) => (
                  <TableCell key={variable}>
                    {renderCell(row[variable], variable)}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* 📊 Show more indicator */}
      {maxRows && data.length > maxRows && (
        <div className="p-2 text-center text-sm text-muted-foreground border-t">
          Showing {maxRows} of {data.length} records
        </div>
      )}
    </div>
  )
}
