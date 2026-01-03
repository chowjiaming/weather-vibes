/**
 * 💊 ModePill Component
 * Floating pill for switching between Explore and Compare modes
 */
'use client'

import { Link, useRouterState } from '@tanstack/react-router'
import { Compass, GitCompare } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

const modes = [
  {
    id: 'explore',
    label: 'Explore',
    icon: Compass,
    path: '/explore',
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: GitCompare,
    path: '/compare',
  },
] as const

export function ModePill() {
  const { location } = useRouterState()
  const activeMode = modes.find((m) => location.pathname.startsWith(m.path))

  return (
    <nav className="glass rounded-full p-1 flex items-center gap-1">
      {modes.map((mode) => {
        const isActive = activeMode?.id === mode.id
        const Icon = mode.icon

        return (
          <Link
            key={mode.id}
            to={mode.path}
            className={cn(
              'relative px-4 py-2 rounded-full',
              'flex items-center gap-2',
              'text-sm font-medium transition-colors duration-200',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {/* 🎨 Active background indicator */}
            {isActive && (
              <motion.div
                layoutId="mode-pill-active"
                className="absolute inset-0 bg-primary rounded-full"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}

            {/* 📍 Content */}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={18} />
              <span className="hidden sm:inline">{mode.label}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
