/**
 * 🧠 llms.txt (Server Route)
 * A lightweight, LLM-friendly index of Weather Vibes.
 *
 * Purpose:
 * - Help LLMs discover the site structure quickly
 * - Provide stable machine-consumable endpoints
 */
import { createFileRoute } from '@tanstack/react-router'

const HOST = 'https://weathervibes.xyz'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const body = `# Weather Vibes (weathervibes.xyz)

Weather Vibes is a weather + climate exploration app built on TanStack Start.
It focuses on historical patterns (1940–present) and interactive comparisons.

## Primary pages
- Home: ${HOST}/
- Explore (map-first): ${HOST}/explore
- Compare (analysis workspace): ${HOST}/compare
- City history pages: ${HOST}/city/{citySlug}

## Machine-friendly endpoints (JSON)
- Curated city index: ${HOST}/api/cities
- City metadata + defaults: ${HOST}/api/city/{citySlug}

## Sitemap
- ${HOST}/sitemap.xml

## Data sources
- Weather and climate data: Open-Meteo APIs (forecast, historical archive, geocoding, air quality, marine, flood)

## Notes for consumers
- City URLs may include optional query params (lat/lon) to avoid geocoding:
  - Example: ${HOST}/city/berlin-germany?lat=52.52&lon=13.405
- Canonical URLs for indexing omit query params and live at:
  - ${HOST}/city/{citySlug}

## Variable glossary (high level)
- Temperatures use °C by default (units may vary by page settings)
- Precipitation is mm by default
- Wind speed is km/h by default

If you need structured data, prefer the JSON endpoints over scraping HTML.
`

        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      },
    },
  },
})
