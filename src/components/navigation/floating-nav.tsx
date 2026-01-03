/**
 * 🧭 FloatingNav Component
 * Main floating navigation bar
 */
'use client'

import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { useAdaptiveTheme } from '@/hooks/use-adaptive-theme'
import { cn } from '@/lib/utils'

import { LayerDrawer } from './layer-drawer'
import { ModePill } from './mode-pill'
import { SearchTrigger } from './search-trigger'

interface FloatingNavProps {
  /** 🔍 Callback when search is triggered */
  onSearchOpen?: () => void
  /** 📚 Callback when layer is toggled */
  onLayerToggle?: (layerId: string, enabled: boolean) => void
  /** 🎨 Additional class names */
  className?: string
}

export function FloatingNav({
  onSearchOpen,
  onLayerToggle,
  className,
}: FloatingNavProps) {
  const { isDark, toggleTheme } = useAdaptiveTheme()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3',
        className,
      )}
    >
      {/* 🔍 Search trigger */}
      <SearchTrigger onClick={() => onSearchOpen?.()} />

      {/* 💊 Mode switcher pill */}
      <ModePill />

      {/* 📚 Layer drawer */}
      <LayerDrawer onLayerToggle={onLayerToggle} />

      {/* 🌙 Theme toggle */}
      <Button
        variant="glass"
        size="icon-lg"
        onClick={toggleTheme}
        className="rounded-full"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>
      </Button>
    </motion.header>
  )
}
