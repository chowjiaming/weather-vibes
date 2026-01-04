/**
 * 🤖 robots.txt (Server Route)
 * Keep crawlers pointed at our sitemap and allow indexing.
 */
import { createFileRoute } from '@tanstack/react-router'

const HOST = 'https://weathervibes.xyz'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /

Sitemap: ${HOST}/sitemap.xml
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
