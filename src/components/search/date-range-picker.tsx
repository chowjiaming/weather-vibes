/**
 * 📅 Date Range Picker Component
 * Select date ranges for historical weather queries
 */

'use client'

import {
  endOfYear,
  format,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// 📅 Preset date ranges
const presets = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: subDays(new Date(), 12), // Account for data delay
      to: subDays(new Date(), 5),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: subDays(new Date(), 35),
      to: subDays(new Date(), 5),
    }),
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: subDays(new Date(), 5),
    }),
  },
  {
    label: 'Last 12 months',
    getValue: () => ({
      from: subYears(new Date(), 1),
      to: subDays(new Date(), 5),
    }),
  },
  {
    label: 'This year',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: subDays(new Date(), 5),
    }),
  },
  {
    label: 'Last year',
    getValue: () => {
      const lastYear = subYears(new Date(), 1)
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear),
      }
    },
  },
]

interface DateRangePickerProps {
  /**
   * 📅 Current date range value
   */
  value?: {
    start?: string
    end?: string
  }
  /**
   * 🔄 Callback when date range changes
   */
  onChange?: (range: { start: string; end: string }) => void
  /**
   * 📐 Size variant
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 📅 Minimum selectable date (default: 1940-01-01)
   */
  minDate?: Date
  /**
   * 📅 Maximum selectable date (default: 5 days ago)
   */
  maxDate?: Date
}

export function DateRangePicker({
  value,
  onChange,
  size = 'default',
  className,
  minDate = new Date(1940, 0, 1),
  maxDate = subDays(new Date(), 5),
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  // 📅 Parse current value
  const dateRange: DateRange = {
    from: value?.start ? new Date(value.start) : undefined,
    to: value?.end ? new Date(value.end) : undefined,
  }

  // 🔄 Handle date selection
  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      if (range?.from && range?.to) {
        onChange?.({
          start: format(range.from, 'yyyy-MM-dd'),
          end: format(range.to, 'yyyy-MM-dd'),
        })
      }
    },
    [onChange],
  )

  // 📅 Handle preset selection
  const handlePreset = useCallback(
    (preset: (typeof presets)[number]) => {
      const range = preset.getValue()
      onChange?.({
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd'),
      })
      setOpen(false)
    },
    [onChange],
  )

  // 📝 Format display text
  const displayText = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : 'Select date range'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          size={size}
          className={cn(
            'justify-start text-left font-normal',
            !dateRange.from && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* 📅 Presets */}
          <div className="border-r border-border p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Quick Select
            </div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handlePreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* 📅 Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => date < minDate || date > maxDate}
              defaultMonth={dateRange.from || subMonths(new Date(), 1)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
