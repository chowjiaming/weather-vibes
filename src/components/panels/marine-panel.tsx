/**
 * 🌊 MarinePanel Component
 * Displays marine/ocean weather data for coastal locations
 */
'use client'

import { Anchor, Waves } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { BentoPanel, BentoPanelContent, BentoPanelHeader } from './bento-panel'

interface MarineData {
  waveHeight?: number
  wavePeriod?: number
  waveDirection?: number
  seaSurfaceTemperature?: number
  currentSpeed?: number
  currentDirection?: number
}

interface MarinePanelProps {
  /** 🌊 Marine data */
  data?: MarineData
  /** ⏳ Loading state */
  isLoading?: boolean
  /** 👁️ Whether to show panel (based on coastal location) */
  visible?: boolean
  /** 📏 Column span */
  colSpan?: 1 | 2 | 3 | 4 | 'full' | 'half'
  /** 🎬 Animation delay */
  animationDelay?: number
}

// 🌊 Wave height condition
function getWaveCondition(height?: number) {
  if (!height) return { label: 'Unknown', emoji: '🌊', severity: 'low' }
  if (height < 0.5) return { label: 'Calm', emoji: '🏊', severity: 'low' }
  if (height < 1.5)
    return { label: 'Moderate', emoji: '🌊', severity: 'medium' }
  if (height < 3) return { label: 'Rough', emoji: '🌊', severity: 'high' }
  return { label: 'Very Rough', emoji: '⚠️', severity: 'extreme' }
}

// 🧭 Direction to compass label
function getDirectionLabel(degrees?: number): string {
  if (degrees === undefined) return '-'
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

export function MarinePanel({
  data,
  isLoading = false,
  visible = true,
  colSpan = 2,
  animationDelay = 0,
}: MarinePanelProps) {
  if (!visible) return null

  if (isLoading) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<Waves size={20} />}
          title="Marine Conditions"
        />
        <BentoPanelContent>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  if (!data) {
    return (
      <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
        <BentoPanelHeader
          icon={<Waves size={20} />}
          title="Marine Conditions"
        />
        <BentoPanelContent className="flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No marine data available</p>
        </BentoPanelContent>
      </BentoPanel>
    )
  }

  const waveCondition = getWaveCondition(data.waveHeight)

  return (
    <BentoPanel colSpan={colSpan} animationDelay={animationDelay}>
      <BentoPanelHeader
        icon={<Waves size={20} />}
        title="Marine Conditions"
        action={
          <Badge variant="glass" size="pill">
            {waveCondition.emoji} {waveCondition.label}
          </Badge>
        }
      />
      <BentoPanelContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 🌊 Wave height */}
          {data.waveHeight !== undefined && (
            <div className="p-3 rounded-xl bg-blue-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Waves size={16} className="text-blue-500" />
                <p className="text-xs text-muted-foreground">Wave Height</p>
              </div>
              <p className="font-display text-2xl font-bold text-blue-500">
                {data.waveHeight.toFixed(1)}m
              </p>
              {data.wavePeriod && (
                <p className="text-xs text-muted-foreground mt-1">
                  {data.wavePeriod.toFixed(0)}s period
                </p>
              )}
            </div>
          )}

          {/* 🌡️ Sea temperature */}
          {data.seaSurfaceTemperature !== undefined && (
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-500">🌡️</span>
                <p className="text-xs text-muted-foreground">Sea Temp</p>
              </div>
              <p className="font-display text-2xl font-bold text-cyan-500">
                {data.seaSurfaceTemperature.toFixed(1)}°C
              </p>
            </div>
          )}

          {/* 🧭 Wave direction */}
          {data.waveDirection !== undefined && (
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground">🧭</span>
                <p className="text-xs text-muted-foreground">Wave Direction</p>
              </div>
              <p className="font-mono text-lg font-medium">
                {getDirectionLabel(data.waveDirection)} ({data.waveDirection}°)
              </p>
            </div>
          )}

          {/* ⚓ Current */}
          {data.currentSpeed !== undefined && (
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Anchor size={16} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <p className="font-mono text-lg font-medium">
                {data.currentSpeed.toFixed(1)} m/s{' '}
                {getDirectionLabel(data.currentDirection)}
              </p>
            </div>
          )}
        </div>
      </BentoPanelContent>
    </BentoPanel>
  )
}
