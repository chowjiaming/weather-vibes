/**
 * 📥 Chart Export Utilities
 * Export charts to PNG and CSV formats
 */

import { variableConfig } from '@/lib/chart-config'
import type { WeatherVariable } from '@/lib/search-params'
import type { ChartDataPoint } from '@/lib/weather-utils'

/**
 * 📷 Export chart element to PNG
 */
export async function exportChartToPng(
  chartRef: HTMLDivElement | null,
  filename: string = 'chart',
): Promise<void> {
  if (!chartRef) return

  // 📊 Try using SVG export
  const svg = chartRef.querySelector('svg')
  if (svg) {
    await exportSvgToPng(svg, filename)
  }
}

/**
 * 📷 Export SVG to PNG
 */
async function exportSvgToPng(
  svg: SVGElement,
  filename: string,
): Promise<void> {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svg.clientWidth * 2
    canvas.height = svg.clientHeight * 2

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    URL.revokeObjectURL(svgUrl)
  }

  img.src = svgUrl
}

/**
 * 📊 Export chart data to CSV
 */
export function exportChartToCsv(
  data: ChartDataPoint[],
  variables: WeatherVariable[],
  filename: string = 'weather-data',
): void {
  if (data.length === 0) return

  // 📋 Build headers
  const headers = ['Date', ...variables.map((v) => variableConfig[v].label)]

  // 📊 Build rows
  const rows = data.map((row) => {
    const values = [
      row.date,
      ...variables.map((v) => {
        const value = row[v]
        return value !== null && value !== undefined ? String(value) : ''
      }),
    ]
    return values.join(',')
  })

  // 📝 Combine into CSV
  const csv = [headers.join(','), ...rows].join('\n')

  // 💾 Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(link.href)
}

/**
 * 📊 Export comparison data to CSV
 */
export function exportComparisonToCsv(
  data: Array<{ dayOfYear: number; label: string; [key: string]: unknown }>,
  years: number[],
  variable: WeatherVariable,
  filename: string = 'comparison-data',
): void {
  if (data.length === 0) return

  const config = variableConfig[variable]

  // 📋 Build headers
  const headers = ['Day of Year', 'Date', ...years.map((y) => y.toString())]

  // 📊 Build rows
  const rows = data.map((row) => {
    const values = [
      row.dayOfYear.toString(),
      row.label,
      ...years.map((y) => {
        const value = row[`year_${y}`]
        return value !== null && value !== undefined ? String(value) : ''
      }),
    ]
    return values.join(',')
  })

  // 📝 CSV with metadata
  const metadata = [
    `# ${config.label} Comparison`,
    `# Years: ${years.join(', ')}`,
    `# Unit: ${config.unit}`,
    '',
  ].join('\n')

  const csv = metadata + [headers.join(','), ...rows].join('\n')

  // 💾 Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(link.href)
}

/**
 * 📋 Copy data to clipboard as tab-separated values
 */
export async function copyChartDataToClipboard(
  data: ChartDataPoint[],
  variables: WeatherVariable[],
): Promise<boolean> {
  if (data.length === 0) return false

  try {
    // 📋 Build headers
    const headers = ['Date', ...variables.map((v) => variableConfig[v].label)]

    // 📊 Build rows
    const rows = data.map((row) => {
      const values = [
        row.date,
        ...variables.map((v) => {
          const value = row[v]
          return value !== null && value !== undefined ? String(value) : ''
        }),
      ]
      return values.join('\t')
    })

    // 📝 Combine into TSV
    const tsv = [headers.join('\t'), ...rows].join('\n')

    await navigator.clipboard.writeText(tsv)
    return true
  } catch {
    return false
  }
}
