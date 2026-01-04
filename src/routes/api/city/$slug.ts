/**
 * 🏙️ City metadata endpoint (Server Route)
 * Returns stable, machine-friendly info for a city slug.
 *
 * Intended consumers:
 * - LLMs (via llms.txt)
 * - Integrations / future “saved views”
 */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getHistoricalWeather, searchLocation } from '@/api'
import type { HistoricalDailyWeatherVariable } from '@/api/types'
import { getDefaultDateRange, variableConfig } from '@/lib/chart-config'
import { parseCitySlug } from '@/lib/weather-utils'

const HOST = 'https://weathervibes.xyz'

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
})

export const Route = createFileRoute('/api/city/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url)
        const parsed = querySchema.safeParse({
          lat: url.searchParams.get('lat') ?? undefined,
          lon: url.searchParams.get('lon') ?? undefined,
        })

        const slug = params.slug
        const nameFromSlug = parseCitySlug(slug)

        let latitude = parsed.success ? parsed.data.lat : undefined
        let longitude = parsed.success ? parsed.data.lon : undefined
        let timezone: string | undefined
        let displayName = nameFromSlug
        let country: string | undefined
        let admin1: string | undefined

        if (latitude == null || longitude == null) {
          const geo = await searchLocation({
            data: { name: nameFromSlug, count: 1 },
          })
          if (geo) {
            latitude = geo.latitude
            longitude = geo.longitude
            timezone = geo.timezone
            displayName = geo.name
            country = geo.country
            admin1 = geo.admin1
          }
        }

        if (latitude == null || longitude == null) {
          return Response.json(
            {
              error: 'Not found',
              slug,
              message: 'Unable to resolve coordinates for this slug',
            },
            { status: 404 },
          )
        }

        const canonicalUrl = `${HOST}/city/${slug}`

        // Default “summary window” (same as UI default) 📅
        const { start, end } = getDefaultDateRange()
        const dailyVars: HistoricalDailyWeatherVariable[] = [
          'temperature_2m_max',
          'temperature_2m_min',
          'temperature_2m_mean',
          'precipitation_sum',
          'wind_speed_10m_max',
        ]

        const weather = await getHistoricalWeather({
          data: {
            latitude,
            longitude,
            start_date: start,
            end_date: end,
            daily: dailyVars,
            timezone: 'auto',
          },
        })

        const times = (weather.daily?.time as string[] | undefined) ?? []
        const lastIdx = times.length > 0 ? times.length - 1 : -1
        const latestDate = lastIdx >= 0 ? times[lastIdx] : null

        const latest = latestDate
          ? {
              date: latestDate,
              temperature_2m_max:
                weather.daily?.temperature_2m_max?.[lastIdx] ?? null,
              temperature_2m_min:
                weather.daily?.temperature_2m_min?.[lastIdx] ?? null,
              temperature_2m_mean:
                weather.daily?.temperature_2m_mean?.[lastIdx] ?? null,
              precipitation_sum:
                weather.daily?.precipitation_sum?.[lastIdx] ?? null,
              wind_speed_10m_max:
                weather.daily?.wind_speed_10m_max?.[lastIdx] ?? null,
            }
          : null

        return Response.json(
          {
            slug,
            name: displayName,
            country,
            admin1,
            timezone,
            coordinates: { latitude, longitude },
            canonicalUrl,
            summaryWindow: { start, end },
            latestDaily: latest,
            variables: Object.fromEntries(
              Object.entries(variableConfig).map(([key, cfg]) => [
                key,
                { label: cfg.label, unit: cfg.unit, category: cfg.category },
              ]),
            ),
          },
          {
            headers: {
              'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
          },
        )
      },
    },
  },
})
