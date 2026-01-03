/**
 * 🔄 Compare Route
 * Year-over-year weather comparison
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Calendar, Plus, Share2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { getYearOverYearComparison } from '@/api'
import {
  ChartControls,
  ComparisonChart,
  type ComparisonDataPoint,
  exportComparisonToCsv,
} from '@/components/charts'
import { Container } from '@/components/layout'
import { CitySearch } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { variableConfig } from '@/lib/chart-config'
import type { WeatherVariable } from '@/lib/search-params'
import { serializeSearchParams, weatherVariables } from '@/lib/search-params'
import { getAvailableYears } from '@/lib/weather-utils'

// 🔍 Compare search params schema (for validation only)
const compareSearchSchema = z.object({
  city: z.string().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  years: z
    .string()
    .transform((v) =>
      v
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    )
    .optional()
    .catch([new Date().getFullYear() - 1, new Date().getFullYear()]),
  variable: z.enum(weatherVariables).optional().default('temperature_2m_mean'),
})

type CompareSearch = z.infer<typeof compareSearchSchema>

export const Route = createFileRoute('/compare')({
  validateSearch: compareSearchSchema,

  head: () => ({
    meta: [
      { title: 'Compare Weather | Weather Vibes' },
      {
        name: 'description',
        content:
          'Compare weather patterns across different years. Analyze climate trends and year-over-year changes.',
      },
    ],
  }),

  loader: async ({ location }) => {
    // Parse search params from URL
    const searchParams = new URLSearchParams(location.search)
    const latStr = searchParams.get('lat')
    const lonStr = searchParams.get('lon')
    const yearsStr = searchParams.get('years')
    const variable = searchParams.get('variable') || 'temperature_2m_mean'

    const lat = latStr ? Number.parseFloat(latStr) : undefined
    const lon = lonStr ? Number.parseFloat(lonStr) : undefined
    const years = yearsStr
      ? yearsStr
          .split(',')
          .map(Number)
          .filter((n) => !Number.isNaN(n))
      : [new Date().getFullYear() - 1, new Date().getFullYear()]

    if (lat === undefined || lon === undefined || years.length < 2) {
      return { data: null, hasData: false }
    }

    // 📊 Fetch year-over-year comparison
    const response = await getYearOverYearComparison({
      data: {
        latitude: lat,
        longitude: lon,
        years,
        variable: variable as WeatherVariable,
      },
    })

    return {
      data: response,
      hasData: true,
    }
  },

  pendingComponent: ComparePending,
  component: CompareComponent,
})

function ComparePending() {
  return (
    <Container className="py-8">
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[450px]" />
      </div>
    </Container>
  )
}

function CompareComponent() {
  const loaderData = Route.useLoaderData()
  const search = Route.useSearch() as CompareSearch
  const navigate = useNavigate()
  const chartRef = useRef<HTMLDivElement>(null)
  const availableYears = useMemo(() => getAvailableYears(), [])

  // Handle case where loaderData might be undefined
  const data = loaderData?.data ?? null
  const hasData = loaderData?.hasData ?? false

  // Get years from search (with default)
  const selectedYears = search.years || [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
  ]

  // 🔄 Transform comparison data for chart
  const chartData = useMemo((): ComparisonDataPoint[] => {
    if (!data || !Array.isArray(data)) return []

    // 📊 Combine data from all years
    const combinedData = new Map<number, ComparisonDataPoint>()

    for (const yearData of data) {
      if (!yearData.year || !yearData.data) continue

      for (const point of yearData.data) {
        const dayOfYear = point.dayOfYear
        const existing: ComparisonDataPoint = combinedData.get(dayOfYear) || {
          dayOfYear,
          label: format(
            new Date(2000, 0, dayOfYear), // Use a non-leap year for formatting
            'MMM d',
          ),
        }

        // Add year data with dynamic key
        existing[`year_${yearData.year}`] = point.value
        combinedData.set(dayOfYear, existing)
      }
    }

    return Array.from(combinedData.values()).sort(
      (a, b) => a.dayOfYear - b.dayOfYear,
    )
  }, [data])

  // 🔄 Handlers
  const handleLocationSelect = useCallback(
    (result: { name: string; latitude: number; longitude: number }) => {
      navigate({
        to: '/compare',
        search: serializeSearchParams({
          ...search,
          city: result.name,
          lat: result.latitude,
          lon: result.longitude,
        }),
      })
    },
    [navigate, search],
  )

  const handleYearToggle = useCallback(
    (year: number) => {
      const currentYears = selectedYears
      let newYears: number[]

      if (currentYears.includes(year)) {
        if (currentYears.length <= 2) {
          toast.error('Need at least 2 years to compare')
          return
        }
        newYears = currentYears.filter((y) => y !== year)
      } else {
        if (currentYears.length >= 5) {
          toast.error('Maximum 5 years can be compared')
          return
        }
        newYears = [...currentYears, year].sort((a, b) => a - b)
      }

      navigate({
        to: '/compare',
        search: serializeSearchParams({
          ...search,
          years: newYears,
        }),
      })
    },
    [selectedYears, navigate, search],
  )

  const handleVariableChange = useCallback(
    (variable: WeatherVariable) => {
      navigate({
        to: '/compare',
        search: serializeSearchParams({
          ...search,
          variable,
        }),
      })
    },
    [navigate, search],
  )

  const handleExport = useCallback(
    (exportFormat: 'png' | 'csv') => {
      if (exportFormat === 'csv') {
        exportComparisonToCsv(
          chartData,
          selectedYears,
          search.variable || 'temperature_2m_mean',
          `comparison-${search.city || 'data'}`,
        )
        toast.success('CSV exported')
      } else {
        toast.info('PNG export coming soon')
      }
    },
    [chartData, selectedYears, search.variable, search.city],
  )

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }, [])

  const variableOptions = weatherVariables.filter((v) =>
    ['temperature', 'precipitation'].some((cat) =>
      variableConfig[v].category.includes(cat),
    ),
  )

  return (
    <Container className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 🔍 Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Compare Years</h1>
            <p className="text-muted-foreground">
              Compare weather patterns across different years
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* 🔧 Controls */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* 🏙️ City selection */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-md">
                <label className="text-sm font-medium mb-2 block">
                  Location
                </label>
                <CitySearch
                  placeholder="Select a city..."
                  defaultValue={search.city}
                  onSelect={handleLocationSelect}
                />
              </div>

              {/* 📊 Variable selection */}
              <div className="w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  Variable
                </label>
                <Select
                  value={search.variable || 'temperature_2m_mean'}
                  onValueChange={(v) =>
                    handleVariableChange(v as WeatherVariable)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {variableOptions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {variableConfig[v].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🔢 Year selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Years to Compare
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedYears.map((year) => (
                  <Badge
                    key={year}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10"
                    onClick={() => handleYearToggle(year)}
                  >
                    {year}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                <Select onValueChange={(v) => handleYearToggle(Number(v))}>
                  <SelectTrigger className="w-[100px] h-6">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears
                      .filter((y) => !selectedYears.includes(y))
                      .slice(0, 20)
                      .map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📊 Comparison chart */}
        {!hasData ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Select Location and Years
              </h2>
              <p className="text-muted-foreground max-w-md">
                Choose a city and at least 2 years to compare weather patterns
                and identify climate trends.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div ref={chartRef} className="space-y-4">
            <div className="flex justify-end">
              <ChartControls
                chartType="line"
                onChartTypeChange={() => {}}
                onExport={handleExport}
                compact
              />
            </div>
            <ComparisonChart
              data={chartData}
              years={selectedYears}
              variable={search.variable || 'temperature_2m_mean'}
              title={`${variableConfig[search.variable || 'temperature_2m_mean'].label} - ${search.city || 'Location'}`}
              height={450}
            />
          </div>
        )}
      </motion.div>
    </Container>
  )
}
