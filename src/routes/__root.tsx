/**
 * 🌳 Root Route
 * App shell with SEO, layout, and providers
 */

import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import type { ReactNode } from 'react'
import { SiteFooter, SiteHeader } from '@/components/layout'
import { Toaster } from '@/components/ui/sonner'
import appCss from '../styles.css?url'

// 🌐 Site configuration
const siteConfig = {
  name: 'Weather Vibes',
  description:
    'Explore historical weather patterns from 1940 to present. Compare climate trends across cities and years with interactive charts and data visualization.',
  url: 'https://weathervibes.xyz',
  ogImage: 'https://weathervibes.xyz/og-image.png',
  twitterHandle: '@chowjiaming',
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      // 📋 Base meta
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteConfig.name },
      { name: 'description', content: siteConfig.description },

      // 🔍 SEO meta
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Joseph Chow' },
      {
        name: 'keywords',
        content:
          'weather, historical weather, climate data, weather patterns, temperature trends, precipitation, climate change, weather comparison',
      },

      // 🌐 Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:title', content: siteConfig.name },
      { property: 'og:description', content: siteConfig.description },
      { property: 'og:url', content: siteConfig.url },
      { property: 'og:image', content: siteConfig.ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:locale', content: 'en_US' },

      // 🐦 Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: siteConfig.twitterHandle },
      { name: 'twitter:creator', content: siteConfig.twitterHandle },
      { name: 'twitter:title', content: siteConfig.name },
      { name: 'twitter:description', content: siteConfig.description },
      { name: 'twitter:image', content: siteConfig.ogImage },

      // 📱 PWA / Theme
      { name: 'theme-color', content: '#0ea5e9' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    ],
    links: [
      // 🎨 Stylesheets
      { rel: 'stylesheet', href: appCss },

      // 🔗 Canonical URL
      { rel: 'canonical', href: siteConfig.url },

      // 🌐 Icons
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },

      // 🔄 Preconnect to API
      { rel: 'preconnect', href: 'https://api.open-meteo.com' },
      { rel: 'preconnect', href: 'https://archive-api.open-meteo.com' },
      { rel: 'preconnect', href: 'https://geocoding-api.open-meteo.com' },
    ],
    scripts: [
      // 📊 JSON-LD Structured Data
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: siteConfig.name,
          description: siteConfig.description,
          url: siteConfig.url,
          applicationCategory: 'WeatherApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: {
            '@type': 'Person',
            name: 'Joseph Chow',
            url: 'https://josephchow.dev',
          },
        }),
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  )
}
