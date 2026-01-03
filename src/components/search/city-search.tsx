/**
 * 🔍 City Search Component
 * Autocomplete city search using Open-Meteo Geocoding API
 */

'use client'

import { Loader2, MapPin, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { searchLocations } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn } from '@/lib/utils'
import { createCitySlug } from '@/lib/weather-utils'

// 🏙️ Search result type
interface SearchResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  country_code: string
  timezone: string
  population?: number
}

interface CitySearchProps {
  /**
   * 📦 Placeholder text
   */
  placeholder?: string
  /**
   * 📐 Size variant
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 🎯 Callback when a city is selected
   */
  onSelect?: (result: SearchResult) => void
  /**
   * 🔗 Navigate to city page on select
   */
  navigateOnSelect?: boolean
  /**
   * 📍 Navigate to explore with coordinates
   */
  navigateToExplore?: boolean
  /**
   * 🎨 Additional className
   */
  className?: string
  /**
   * 🏷️ Initial value
   */
  defaultValue?: string
  /**
   * 🔄 Auto focus
   */
  autoFocus?: boolean
}

const sizeClasses = {
  sm: 'h-9 text-sm',
  default: 'h-10',
  lg: 'h-12 text-lg',
}

export function CitySearch({
  placeholder = 'Search for a city...',
  size = 'default',
  onSelect,
  navigateOnSelect = false,
  navigateToExplore = false,
  className,
  defaultValue = '',
  autoFocus = false,
}: CitySearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 🔍 Debounced search function
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await searchLocations({
        data: {
          name: searchQuery,
          count: 8,
          language: 'en',
        },
      })

      if (data && data.length > 0) {
        setResults(data as SearchResult[])
        setIsOpen(true)
        setSelectedIndex(0)
      } else {
        setResults([])
        setIsOpen(false)
      }
    } catch {
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // 🔄 Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      debouncedSearch(value)
    },
    [debouncedSearch],
  )

  // 🎯 Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery(result.name)
      setIsOpen(false)
      setResults([])

      onSelect?.(result)

      if (navigateOnSelect) {
        const slug = createCitySlug(result.name, result.country, result.admin1)
        window.location.href = `/city/${slug}?lat=${result.latitude}&lon=${result.longitude}`
      } else if (navigateToExplore) {
        window.location.href = `/explore?q=${encodeURIComponent(result.name)}&lat=${result.latitude}&lon=${result.longitude}`
      }
    },
    [onSelect, navigateOnSelect, navigateToExplore],
  )

  // ⌨️ Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    },
    [isOpen, results, selectedIndex, handleSelect],
  )

  // 🖱️ Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 🔄 Clear input
  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 🔍 Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn('pl-9 pr-9', sizeClasses[size])}
        />
        {/* 🔄 Loading / Clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* 📋 Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-md shadow-lg"
          >
            <div className="max-h-[300px] overflow-auto">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                    index === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {[result.admin1, result.country]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                  {result.population && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {(result.population / 1000).toFixed(0)}k
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
