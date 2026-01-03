/**
 * 🔍 LocationSearchOverlay Component
 * Spotlight-style command palette for location search
 * Includes geolocation support with error handling
 */
'use client'

import { useNavigate } from '@tanstack/react-router'
import {
  Clock,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { searchLocations } from '@/api'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface LocationResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
  timezone?: string
}

interface LocationSearchOverlayProps {
  /** 🔓 Whether the overlay is open */
  open: boolean
  /** 🔒 Callback to close the overlay */
  onOpenChange: (open: boolean) => void
  /** 📍 Callback when location is selected */
  onLocationSelect?: (location: LocationResult) => void
}

// 🕒 Recent searches (would be stored in localStorage in production)
const recentSearches: LocationResult[] = []

// ⭐ Popular cities
const popularCities: LocationResult[] = [
  {
    id: 1,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    admin1: 'New York',
  },
  {
    id: 2,
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
  },
  {
    id: 3,
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
  },
  {
    id: 4,
    name: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    country: 'France',
  },
  {
    id: 5,
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    country: 'Australia',
  },
]

export function LocationSearchOverlay({
  open,
  onOpenChange,
  onLocationSelect,
}: LocationSearchOverlayProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // 🔍 Search for locations
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchTimer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await searchLocations({
          data: { name: query, count: 8 },
        })
        setResults(
          response.map((r) => ({
            id: r.id,
            name: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            country: r.country,
            admin1: r.admin1,
            timezone: r.timezone,
          })),
        )
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query])

  // 🎯 Handle location selection
  const handleSelect = useCallback(
    (location: LocationResult) => {
      onLocationSelect?.(location)
      onOpenChange(false)
      setQuery('')

      // Navigate to explore with location
      navigate({
        to: '/explore',
        search: {
          q: location.name,
          lat: location.latitude,
          lon: location.longitude,
        },
      })
    },
    [navigate, onLocationSelect, onOpenChange],
  )

  // ⌨️ Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // 📍 Get current location with proper error handling
  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services.',
      })
      return
    }

    setIsGettingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          })
        },
      )

      toast.success('Location found!', {
        description: 'Showing weather for your current location.',
      })

      navigate({
        to: '/explore',
        search: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          q: 'My Location',
        },
      })
      onOpenChange(false)
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied', {
              description:
                'Please enable location permissions in your browser settings.',
            })
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Location unavailable', {
              description:
                'Unable to determine your location. Try again later.',
            })
            break
          case error.TIMEOUT:
            toast.error('Location request timed out', {
              description: 'Please try again.',
            })
            break
        }
      } else {
        toast.error('Location error', {
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      setIsGettingLocation(false)
    }
  }, [navigate, onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search for a city or location..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {/* 🔄 Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* 📭 No results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No locations found for "{query}"</CommandEmpty>
          )}

          {/* 🔍 Search results */}
          {!isLoading && results.length > 0 && (
            <CommandGroup heading="Locations">
              {results.map((location) => (
                <CommandItem
                  key={location.id}
                  value={`${location.name}-${location.id}`}
                  onSelect={() => handleSelect(location)}
                >
                  <MapPin className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[location.admin1, location.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* 🏠 Default state (no query) */}
          {!query && (
            <>
              {/* 📍 Quick actions */}
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className="text-primary animate-spin" />
                  ) : (
                    <Navigation className="text-primary" />
                  )}
                  <span>
                    {isGettingLocation
                      ? 'Getting location...'
                      : 'Use my current location'}
                  </span>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    navigate({ to: '/explore' })
                    onOpenChange(false)
                  }}
                >
                  <Compass className="text-primary" />
                  <span>Explore weather data</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/* 🕒 Recent searches */}
              {recentSearches.length > 0 && (
                <>
                  <CommandGroup heading="Recent">
                    {recentSearches.map((location) => (
                      <CommandItem
                        key={location.id}
                        value={`recent-${location.name}-${location.id}`}
                        onSelect={() => handleSelect(location)}
                      >
                        <Clock className="text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {location.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {location.country}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* ⭐ Popular cities */}
              <CommandGroup heading="Popular Cities">
                {popularCities.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={`popular-${location.name}-${location.id}`}
                    onSelect={() => handleSelect(location)}
                  >
                    <Sparkles className="text-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {location.country}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* ⌨️ Footer with keyboard hints */}
        <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  )
}
