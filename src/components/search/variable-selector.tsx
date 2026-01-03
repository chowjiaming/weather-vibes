/**
 * 📊 Weather Variable Selector Component
 * Multi-select for choosing weather variables to display
 */

'use client'

import {
  Check,
  ChevronDown,
  Droplets,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { variableConfig } from '@/lib/chart-config'
import { type WeatherVariable, weatherVariables } from '@/lib/search-params'
import { cn } from '@/lib/utils'

// 🏷️ Group variables by category
const variableGroups = {
  temperature: {
    label: 'Temperature',
    icon: Thermometer,
    variables: weatherVariables.filter(
      (v) => variableConfig[v].category === 'temperature',
    ),
  },
  precipitation: {
    label: 'Precipitation',
    icon: Droplets,
    variables: weatherVariables.filter(
      (v) => variableConfig[v].category === 'precipitation',
    ),
  },
  wind: {
    label: 'Wind',
    icon: Wind,
    variables: weatherVariables.filter(
      (v) => variableConfig[v].category === 'wind',
    ),
  },
  radiation: {
    label: 'Radiation',
    icon: Sun,
    variables: weatherVariables.filter(
      (v) => variableConfig[v].category === 'radiation',
    ),
  },
} as const

interface VariableSelectorProps {
  /**
   * 📊 Currently selected variables
   */
  value?: WeatherVariable[]
  /**
   * 🔄 Callback when selection changes
   */
  onChange?: (variables: WeatherVariable[]) => void
  /**
   * 📐 Size variant
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 🔢 Maximum number of selections
   */
  maxSelections?: number
  /**
   * 🎨 Additional className
   */
  className?: string
}

export function VariableSelector({
  value = [],
  onChange,
  size = 'default',
  maxSelections = 5,
  className,
}: VariableSelectorProps) {
  const [open, setOpen] = useState(false)

  // 🔄 Toggle a variable selection
  const toggleVariable = useCallback(
    (variable: WeatherVariable) => {
      const isSelected = value.includes(variable)

      if (isSelected) {
        onChange?.(value.filter((v) => v !== variable))
      } else if (value.length < maxSelections) {
        onChange?.([...value, variable])
      }
    },
    [value, onChange, maxSelections],
  )

  // 🧹 Clear all selections
  const clearAll = useCallback(() => {
    onChange?.([])
  }, [onChange])

  // 📝 Format display text
  const displayText =
    value.length === 0
      ? 'Select variables'
      : value.length === 1
        ? variableConfig[value[0]].shortLabel
        : `${value.length} variables`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          size={size}
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        {/* 📊 Selected badges */}
        {value.length > 0 && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Selected ({value.length}/{maxSelections})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {value.map((variable) => (
                <Badge
                  key={variable}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleVariable(variable)}
                >
                  {variableConfig[variable].shortLabel}
                  <Check className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 📋 Variable groups */}
        <div className="max-h-[300px] overflow-auto p-1">
          {Object.entries(variableGroups).map(([groupKey, group]) => (
            <div key={groupKey} className="mb-2">
              {/* 🏷️ Group header */}
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <group.icon className="h-3.5 w-3.5" />
                {group.label}
              </div>

              {/* 📊 Variables in group */}
              <div className="space-y-0.5">
                {group.variables.map((variable) => {
                  const config = variableConfig[variable]
                  const isSelected = value.includes(variable)
                  const isDisabled =
                    !isSelected && value.length >= maxSelections

                  return (
                    <button
                      key={variable}
                      type="button"
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors w-full text-left',
                        isSelected ? 'bg-accent' : 'hover:bg-accent/50',
                        isDisabled && 'opacity-50 cursor-not-allowed',
                      )}
                      onClick={() => !isDisabled && toggleVariable(variable)}
                      disabled={isDisabled}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{config.label}</div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {config.unit}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
