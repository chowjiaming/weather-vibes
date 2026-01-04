/**
 * 🌳 Root Route
 * Spatial app shell with floating navigation and theme providers
 */

import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Home, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, useState } from 'react'

import { FloatingNav } from '@/components/navigation'
import { LocationSearchOverlay } from '@/components/search'
import { Toaster } from '@/components/ui/sonner'
import { LayerProvider } from '@/contexts'
import { createQueryClient } from '@/lib/query-client'

import appCss from '../styles.css?url'

// ⚡ Create query client instance (singleton per render)
const queryClient = createQueryClient()

// 🌐 Site configuration
const siteConfig = {
  name: 'Weather Vibes',
  description:
    'Explore historical weather patterns from 1940 to present. Compare climate trends across cities and years with interactive charts and data visualization.',
  url: 'https://weathervibes.xyz',
  // ✅ Use an existing public asset to ensure unfurlers always succeed.
  // (A dedicated 1200x630 OG image can be added later.)
  ogImage: 'https://weathervibes.xyz/logo512.png',
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
      { property: 'og:image:width', content: '512' },
      { property: 'og:image:height', content: '512' },
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

      // 🔄 Preconnect to API (with crossorigin for CORS)
      {
        rel: 'preconnect',
        href: 'https://api.open-meteo.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://archive-api.open-meteo.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://geocoding-api.open-meteo.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://air-quality-api.open-meteo.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://marine-api.open-meteo.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://flood-api.open-meteo.com',
        crossOrigin: 'anonymous',
      },

      // 🌐 DNS Prefetch (fallback for browsers that don't support preconnect)
      { rel: 'dns-prefetch', href: 'https://api.open-meteo.com' },
      { rel: 'dns-prefetch', href: 'https://archive-api.open-meteo.com' },
      { rel: 'dns-prefetch', href: 'https://geocoding-api.open-meteo.com' },
      { rel: 'dns-prefetch', href: 'https://tiles.openfreemap.org' },

      // 🗺️ Preconnect to map tiles
      {
        rel: 'preconnect',
        href: 'https://tiles.openfreemap.org',
        crossOrigin: 'anonymous',
      },
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
  notFoundComponent: NotFoundComponent,
})

/**
 * 🔍 Not Found Component
 * Shown when a route doesn't exist
 */
function NotFoundComponent() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8 max-w-md text-center"
      >
        <div className="text-6xl mb-4">🌧️</div>
        <h1 className="font-display text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Looks like this location doesn't exist on our map. Let's get you back
          on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <MapPin size={18} />
            Explore Weather
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased overflow-hidden">
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
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LayerProvider>
          {/* 🗺️ Full-screen spatial canvas */}
          <div className="relative h-screen w-screen">
            {/* 🧭 Floating navigation */}
            <FloatingNav onSearchOpen={() => setSearchOpen(true)} />

            {/* 📄 Route content */}
            <Outlet />

            {/* 🔍 Search overlay */}
            <LocationSearchOverlay
              open={searchOpen}
              onOpenChange={setSearchOpen}
            />

            {/* 🔔 Toast notifications */}
            <Toaster />
          </div>
        </LayerProvider>
      </ThemeProvider>

      {/* 🔧 React Query DevTools (dev only) */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}
