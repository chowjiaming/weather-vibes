/**
 * 🦶 Site Footer Component
 * Footer with links and attribution
 */

import { Link } from '@tanstack/react-router'
import { Cloud, ExternalLink, Github } from 'lucide-react'

import { Container } from './container'

// 📑 Footer link groups
const footerLinks = {
  explore: {
    title: 'Explore',
    links: [
      { to: '/explore', label: 'Search Cities' },
      { to: '/compare', label: 'Compare Years' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      {
        href: 'https://open-meteo.com',
        label: 'Open-Meteo API',
        external: true,
      },
      {
        href: 'https://github.com/chowjiaming/weather-vibes',
        label: 'Source Code',
        external: true,
      },
    ],
  },
} as const

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <Container>
        <div className="py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* 🌦️ Brand */}
            <div className="space-y-4">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <Cloud className="h-6 w-6 text-sky-500" />
                <span>Weather Vibes</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore historical weather patterns from 1940 to present.
                Compare climate trends across cities and years.
              </p>
            </div>

            {/* 🔗 Explore Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">{footerLinks.explore.title}</h3>
              <ul className="space-y-2">
                {footerLinks.explore.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to as '/'}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🔗 Resources Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">{footerLinks.resources.title}</h3>
              <ul className="space-y-2">
                {footerLinks.resources.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 📊 Data Attribution */}
            <div className="space-y-4">
              <h3 className="font-semibold">Data Sources</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Weather data provided by{' '}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Open-Meteo
                </a>
                . Historical data available from 1940 using ERA5 reanalysis.
              </p>
            </div>
          </div>
        </div>

        {/* 📜 Copyright */}
        <div className="border-t border-border/40 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear}{' '}
              <a
                href="https://josephchow.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Joseph Chow
              </a>
              . Made with ☀️ and ❄️
            </p>
            <a
              href="https://github.com/chowjiaming/weather-vibes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
