/**
 * 📊 StatsPanel Component
 * Displays key statistics in a compact format
 */
'use client'

import { BarChart3, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type * as React from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface Stat {
  label: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
}

interface StatsPanelProps {
  /** 🏷️ Panel title */
  title?: string
  /** 📊 Stats to display */
  stats?: Stat[]
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 📏 Number of columns for stats */
  columns?: 2 | 3 | 4
  /** 🎬 Animation delay */
  animationDelay?: number
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function getTrendIcon(change?: number) {
  if (change === undefined) return null
  if (change > 0) return <TrendingUp size={14} className="text-emerald-500" />
  if (change < 0) return <TrendingDown size={14} className="text-red-500" />
  return <Minus size={14} className="text-muted-foreground" />
}

function getTrendColor(change?: number) {
  if (change === undefined) return 'text-muted-foreground'
  if (change > 0) return 'text-emerald-500'
  if (change < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

export function StatsPanel({
  title = 'Statistics',
  stats,
  isLoading = false,
  colSpan = 2,
  columns = 2,
  animationDelay = 0,
}: StatsPanelProps) {
  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<BarChart3 size={20} />} title={title} />
        <BentoPanelContent>
          <div className={cn('grid gap-4', columnClasses[columns])}>
            {Array.from({ length: columns * 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!stats || stats.length === 0) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<BarChart3 size={20} />} title={title} />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No statistics available</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader icon={<BarChart3 size={20} />} title={title} />
      <BentoPanelContent>
        <div className={cn('grid gap-4', columnClasses[columns])}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {stat.icon && <span className="text-primary">{stat.icon}</span>}
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-sm text-muted-foreground">
                    {stat.unit}
                  </span>
                )}
              </div>
              {stat.change !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-1 mt-1.5',
                    getTrendColor(stat.change),
                  )}
                >
                  {getTrendIcon(stat.change)}
                  <span className="text-xs font-medium">
                    {stat.change > 0 ? '+' : ''}
                    {stat.change.toFixed(1)}%
                  </span>
                  {stat.changeLabel && (
                    <span className="text-xs text-muted-foreground">
                      {stat.changeLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
}
