/**
 * 🗺️ Sitemap (Server Route)
 * Generates a curated sitemap for SEO discoverability.
 *
 * Notes:
 * - We intentionally include a bounded set of city pages (timezone defaults)
 *   to avoid infinite expansion from arbitrary user searches.
 */
import { createFileRoute } from '@tanstack/react-router'

import { getAllDefaultLocations } from '@/lib/default-locations'
import { createCitySlug } from '@/lib/weather-utils'

const HOST = 'https://weathervibes.xyz'

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function buildUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${HOST}${path.startsWith('/') ? '' : '/'}${path}`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const staticUrls = [
          { loc: buildUrl('/'), changefreq: 'daily', priority: '1.0' },
          { loc: buildUrl('/explore'), changefreq: 'daily', priority: '0.8' },
          { loc: buildUrl('/compare'), changefreq: 'weekly', priority: '0.7' },
        ]

        const cityUrls = getAllDefaultLocations().map((loc) => {
          const slug = createCitySlug(loc.name, loc.country)
          const url = new URL(buildUrl(`/city/${slug}`))
          // Provide coords to avoid geocoding on first load, but allow canonical to de-dupe.
          url.searchParams.set('lat', String(loc.lat))
          url.searchParams.set('lon', String(loc.lon))

          return { loc: url.toString(), changefreq: 'weekly', priority: '0.6' }
        })

        const urls = [...staticUrls, ...cityUrls]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
        })
      },
    },
  },
})
