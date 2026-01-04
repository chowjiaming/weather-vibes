/**
 * 🧠 Compare Workspace Model
 * A URL-driven “analysis workspace” model for `/compare`.
 *
 * This file intentionally stays UI-agnostic:
 * - It converts `CompareSearchParams` -> a normalized `CompareWorkspaceView`
 * - It defines series/axis metadata used by Recharts rendering
 * - It provides basic aggregation + derived-series helpers (rolling average)
 */
import { format, parseISO } from 'date-fns'
import { chartColors, variableConfig } from '@/lib/chart-config'
import type {
  AxisSide,
  CompareAggregation,
  CompareDataSource,
  CompareLocation,
  CompareSearchParams,
  CompareStat,
  WeatherVariable,
} from '@/lib/search-params'
import type { ChartDataPoint } from '@/lib/weather-utils'

export type CompareWorkspaceView = {
  // 📍 Location selection (v1: focus on the primary location)
  location: CompareLocation

  // 📊 Variables & axes
  vars: WeatherVariable[]
  yAxes: Partial<Record<WeatherVariable, AxisSide>>

  // 🧪 Data sources
  source: CompareDataSource

  // 📦 Aggregation
  agg: CompareAggregation

  // 📅 Ranges
  start?: string
  end?: string

  // 🔍 Zoom restore
  zoomStart?: string
  zoomEnd?: string

  // 📊 Stats/overlays
  stats: CompareStat[]
  smoothDays: number

  // 🔢 Baseline / YoY context
  years?: number[]
  primaryVariable?: WeatherVariable

  // ⚙️ Units
  tempUnit: CompareSearchParams['tempUnit']
  windUnit: CompareSearchParams['windUnit']
  precipUnit: CompareSearchParams['precipUnit']

  // 📈 Rendering
  chart: CompareSearchParams['chart']
}

export type WorkspaceSeries = {
  variable: WeatherVariable
  dataKey: WeatherVariable
  name: string
  color: string
  unit: string
  yAxisId: AxisSide
}

export function getDefaultAxisSide(variable: WeatherVariable): AxisSide {
  // 🎯 Simple, ergonomic defaults for multi-axis charts
  switch (variableConfig[variable].category) {
    case 'temperature':
      return 'left'
    default:
      return 'right'
  }
}

export function buildWorkspaceSeries(
  vars: WeatherVariable[],
  yAxes: Partial<Record<WeatherVariable, AxisSide>>,
): WorkspaceSeries[] {
  return vars.map((variable) => {
    const cfg = variableConfig[variable]
    return {
      variable,
      dataKey: variable,
      name: cfg.shortLabel,
      color: chartColors[variable] ?? '#0ea5e9',
      unit: cfg.unit,
      yAxisId: yAxes[variable] ?? getDefaultAxisSide(variable),
    }
  })
}

export function normalizeCompareView(
  search: CompareSearchParams,
  fallbackLocation: CompareLocation,
): CompareWorkspaceView {
  const location =
    search.locations && search.locations.length > 0
      ? search.locations[0]
      : fallbackLocation

  const vars =
    search.vars && search.vars.length > 0
      ? search.vars
      : search.variable
        ? [search.variable]
        : (['temperature_2m_mean'] as WeatherVariable[])

  return {
    location,
    vars,
    yAxes: search.yAxes ?? {},
    source: search.source,
    agg: search.agg,
    start: search.start,
    end: search.end,
    zoomStart: search.zoomStart,
    zoomEnd: search.zoomEnd,
    stats: search.stats ?? [],
    smoothDays: search.smooth ?? 7,
    years: search.years,
    primaryVariable: search.variable,
    tempUnit: search.tempUnit,
    windUnit: search.windUnit,
    precipUnit: search.precipUnit,
    chart: search.chart,
  }
}

// ----------------------------------------------------------------------------
// Aggregation helpers
// ----------------------------------------------------------------------------

type NumericVar = WeatherVariable

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/**
 * Aggregate daily data into weekly or monthly buckets.
 * Keeps keys compatible with Recharts (`formattedDate` used by existing charts).
 */
export function aggregateSeries(
  data: ChartDataPoint[],
  vars: NumericVar[],
  agg: CompareAggregation,
): ChartDataPoint[] {
  if (agg === 'daily') return data

  const buckets = new Map<string, ChartDataPoint[]>()

  for (const row of data) {
    const date = row.date
    if (!date) continue

    const d = parseISO(date)
    const bucketKey =
      agg === 'weekly' ? format(d, "yyyy-'W'II") : format(d, 'yyyy-MM')

    const existing = buckets.get(bucketKey)
    if (existing) existing.push(row)
    else buckets.set(bucketKey, [row])
  }

  const result: ChartDataPoint[] = []
  for (const [, rows] of buckets) {
    const firstDate = rows[0]?.date
    if (!firstDate) continue

    const d = parseISO(firstDate)
    const formattedDate =
      agg === 'weekly' ? format(d, "MMM d 'W'II") : format(d, 'MMM yyyy')

    const out: ChartDataPoint = {
      date: firstDate,
      formattedDate,
      fullDate: formattedDate,
    }

    for (const v of vars) {
      const values = rows
        .map((r) => r[v])
        .filter((x): x is number => typeof x === 'number' && !Number.isNaN(x))
      const avg = average(values)
      out[v] = avg
    }

    result.push(out)
  }

  // Fallback: sort by actual date if possible
  return result.sort((a, b) => {
    const ad = a.date ? parseISO(a.date).getTime() : 0
    const bd = b.date ? parseISO(b.date).getTime() : 0
    return ad - bd
  })
}

// ----------------------------------------------------------------------------
// Derived series helpers
// ----------------------------------------------------------------------------

/**
 * Add a rolling average series into each point under `key`.
 * This keeps the original series untouched and writes the derived values
 * into a new data key (eg `temperature_2m_mean__rolling`).
 */
export function addRollingAverageSeries(
  data: ChartDataPoint[],
  variable: WeatherVariable,
  windowDays: number,
  key: string = `${variable}__rolling`,
): { data: ChartDataPoint[]; dataKey: string } {
  if (data.length === 0) return { data, dataKey: key }

  const w = Math.max(1, windowDays)
  const out = data.map((row, idx) => {
    const slice = data.slice(Math.max(0, idx - w + 1), idx + 1)
    const values = slice
      .map((r) => r[variable])
      .filter((x): x is number => typeof x === 'number' && !Number.isNaN(x))
    return {
      ...row,
      [key]: average(values),
    }
  })

  return { data: out, dataKey: key }
}

/**
 * Serialize axis mapping back to URL-friendly form.
 */
export function serializeYAxisMap(
  yAxes: Partial<Record<WeatherVariable, AxisSide>>,
): string | undefined {
  const pairs = Object.entries(yAxes)
    .filter(([, side]) => side === 'left' || side === 'right')
    .map(([v, side]) => `${v}:${side}`)

  return pairs.length > 0 ? pairs.join(';') : undefined
}
