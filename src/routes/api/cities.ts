/**
 * 🧾 Curated city index (Server Route)
 * A bounded, machine-friendly list of “known” cities used across sitemap/LLMs.
 */
import { createFileRoute } from '@tanstack/react-router'

import { getAllDefaultLocations } from '@/lib/default-locations'
import { createCitySlug } from '@/lib/weather-utils'

const HOST = 'https://weathervibes.xyz'

export const Route = createFileRoute('/api/cities')({
  server: {
    handlers: {
      GET: async () => {
        const cities = getAllDefaultLocations().map((loc) => {
          const slug = createCitySlug(loc.name, loc.country)
          return {
            slug,
            name: loc.name,
            country: loc.country,
            timezone: loc.timezone,
            latitude: loc.lat,
            longitude: loc.lon,
            url: `${HOST}/city/${slug}`,
          }
        })

        return Response.json(
          {
            source: 'Weather Vibes curated defaults',
            host: HOST,
            count: cities.length,
            cities,
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
