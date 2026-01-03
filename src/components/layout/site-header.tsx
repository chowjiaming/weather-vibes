/**
 * 🧭 Site Header Component
 * Navigation with search and theme toggle
 */

'use client'

import { Link } from '@tanstack/react-router'
import { Cloud, Menu, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Container } from './container'

// 🧭 Navigation links
const navLinks = [
  { to: '/' as const, label: 'Home' },
  { to: '/explore' as const, label: 'Explore' },
  { to: '/compare' as const, label: 'Compare' },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* 🌦️ Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <Cloud className="h-6 w-6 text-sky-500" />
            <span className="hidden sm:inline-block">Weather Vibes</span>
          </Link>

          {/* 🖥️ Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as '/'} // Type assertion for navigation
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className: 'text-foreground',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 🔧 Actions */}
          <div className="flex items-center gap-2">
            {/* 🔍 Search button (links to explore) */}
            <Link to={'/' as '/'}>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search cities</span>
              </Button>
            </Link>

            {/* 📱 Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </Container>

      {/* 📱 Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/40"
          >
            <Container>
              <nav className="flex flex-col py-4 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to as '/'}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                    activeProps={{
                      className: 'text-foreground bg-accent',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
