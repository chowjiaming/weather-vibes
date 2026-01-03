/**
 * ⌨️ useKeyboardShortcuts Hook
 * Global keyboard shortcuts for the application
 */
'use client'

import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

interface UseKeyboardShortcutsOptions {
  /** 🔍 Handler for opening search */
  onSearchOpen?: () => void
  /** 🌙 Handler for toggling theme */
  onThemeToggle?: () => void
  /** 🗺️ Handler for toggling layers */
  onLayersToggle?: () => void
}

export function useKeyboardShortcuts({
  onSearchOpen,
  onThemeToggle,
  onLayersToggle,
}: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isModifierKey = event.metaKey || event.ctrlKey

      // 🔍 ⌘K - Open search
      if (isModifierKey && event.key === 'k') {
        event.preventDefault()
        onSearchOpen?.()
        return
      }

      // 🧭 ⌘E - Go to Explore
      if (isModifierKey && event.key === 'e') {
        event.preventDefault()
        navigate({ to: '/explore' })
        return
      }

      // 📊 ⌘B - Go to Compare
      if (isModifierKey && event.key === 'b') {
        event.preventDefault()
        navigate({ to: '/compare' })
        return
      }

      // 🌙 ⌘D - Toggle dark mode
      if (isModifierKey && event.key === 'd') {
        event.preventDefault()
        onThemeToggle?.()
        return
      }

      // 📚 ⌘L - Toggle layers
      if (isModifierKey && event.key === 'l') {
        event.preventDefault()
        onLayersToggle?.()
        return
      }

      // ❌ Escape - Close modals (handled by individual components)
    },
    [navigate, onSearchOpen, onThemeToggle, onLayersToggle],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * 📋 Keyboard shortcuts reference
 */
export const keyboardShortcuts = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['⌘', 'E'], description: 'Go to Explore' },
  { keys: ['⌘', 'B'], description: 'Go to Compare' },
  { keys: ['⌘', 'D'], description: 'Toggle dark mode' },
  { keys: ['⌘', 'L'], description: 'Toggle layers' },
  { keys: ['Esc'], description: 'Close modal' },
]
