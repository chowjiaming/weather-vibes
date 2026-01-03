/**
 * 🌊 FloodPanel Component
 * Displays flood risk and river discharge data
 */
'use client'

import { AlertTriangle, Droplets, TrendingUp, Waves } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface FloodData {
  riverDischarge?: number
  riverDischargeMax?: number
  riverDischargeMean?: number
  floodRisk?: 'low' | 'moderate' | 'high' | 'extreme'
}

interface FloodPanelProps {
  /** 🌊 Flood data */
  data?: FloodData
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 👁️ Whether to show panel (based on riverine location) */
  visible?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 🎬 Animation delay */
  animationDelay?: number
}

// 🚨 Flood risk configuration
const riskLevels = {
  low: {
    label: 'Low Risk',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    emoji: '✅',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    emoji: '⚠️',
  },
  high: {
    label: 'High Risk',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    emoji: '🚨',
  },
  extreme: {
    label: 'Extreme',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    emoji: '🆘',
  },
}

// 📊 Calculate flood risk from discharge data
function calculateFloodRisk(
  current?: number,
  _max?: number,
  mean?: number,
): FloodData['floodRisk'] {
  if (!current || !mean) return 'low'
  const ratio = current / mean
  if (ratio < 1.5) return 'low'
  if (ratio < 2.5) return 'moderate'
  if (ratio < 4) return 'high'
  return 'extreme'
}

export function FloodPanel({
  data,
  isLoading = false,
  visible = true,
  colSpan = 2,
  animationDelay = 0,
}: FloodPanelProps) {
  if (!visible) return null

  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<Waves size={20} />} title="Flood Risk" />
        <BentoPanelContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!data) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader icon={<Waves size={20} />} title="Flood Risk" />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No flood data available</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  const risk =
    data.floodRisk ??
    calculateFloodRisk(
      data.riverDischarge,
      data.riverDischargeMax,
      data.riverDischargeMean,
    ) ??
    'low'
  const riskLevel = riskLevels[risk]
  const dischargeRatio =
    data.riverDischargeMean && data.riverDischarge
      ? ((data.riverDischarge / data.riverDischargeMean) * 100).toFixed(0)
      : null

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader
        icon={<Waves size={20} />}
        title="Flood Risk"
        action={
          <Badge variant="glass" size="pill">
            {riskLevel.emoji} {riskLevel.label}
          </Badge>
        }
      />
      <BentoPanelContent>
        <div className="space-y-4">
          {/* 🚨 Risk indicator */}
          <div className={cn('p-4 rounded-xl', riskLevel.bg)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {risk === 'high' || risk === 'extreme' ? (
                  <AlertTriangle size={24} className={riskLevel.color} />
                ) : (
                  <Droplets size={24} className={riskLevel.color} />
                )}
                <div>
                  <p className={cn('font-medium', riskLevel.color)}>
                    {riskLevel.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current flood risk level
                  </p>
                </div>
              </div>
              {dischargeRatio && (
                <div className="text-right">
                  <p
                    className={cn(
                      'font-display text-2xl font-bold',
                      riskLevel.color,
                    )}
                  >
                    {dischargeRatio}%
                  </p>
                  <p className="text-xs text-muted-foreground">of mean</p>
                </div>
              )}
            </div>
          </div>

          {/* 📊 Discharge stats */}
          <div className="grid grid-cols-3 gap-2">
            {data.riverDischarge !== undefined && (
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={12} className="text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Current
                  </p>
                </div>
                <p className="font-mono text-sm font-medium">
                  {data.riverDischarge.toFixed(0)} m³/s
                </p>
              </div>
            )}

            {data.riverDischargeMean !== undefined && (
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">
                  Mean
                </p>
                <p className="font-mono text-sm font-medium">
                  {data.riverDischargeMean.toFixed(0)} m³/s
                </p>
              </div>
            )}

            {data.riverDischargeMax !== undefined && (
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">
                  Max
                </p>
                <p className="font-mono text-sm font-medium">
                  {data.riverDischargeMax.toFixed(0)} m³/s
                </p>
              </div>
            )}
          </div>
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
}
