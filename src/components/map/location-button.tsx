/**
 * 📍 LocationButton Component
 * Floating button to request user's geolocation
 * Positioned bottom-right of map canvas with glass styling
 */
'use client'

import { useNavigate } from '@tanstack/react-router'
import { Crosshair, Loader2, Navigation } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LocationButtonProps {
  /** 🎨 Additional CSS classes */
  className?: string
  /** 🔧 Custom callback after successful geolocation */
  onLocationSuccess?: (coords: { lat: number; lon: number }) => void
}

type GeolocationState = 'idle' | 'loading' | 'success' | 'error'

/**
 * 📍 Floating button to get user's current location
 * Uses browser Geolocation API with permission handling
 */
export function LocationButton({
  className,
  onLocationSuccess,
}: LocationButtonProps) {
  const navigate = useNavigate()
  const [state, setState] = useState<GeolocationState>('idle')

  // 🎯 Handle geolocation request
  const handleGetLocation = useCallback(async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services.',
      })
      return
    }

    setState('loading')

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // Cache position for 1 minute
          })
        },
      )

      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }

      setState('success')

      // 🎉 Success toast
      toast.success('Location found!', {
        description: 'Showing weather for your current location.',
      })

      // Navigate to the location
      navigate({
        to: '/explore',
        search: {
          lat: coords.lat,
          lon: coords.lon,
          q: 'My Location',
        },
      })

      // Call custom callback if provided
      onLocationSuccess?.(coords)

      // Reset state after animation
      setTimeout(() => setState('idle'), 2000)
    } catch (error) {
      setState('error')

      // Handle specific geolocation errors
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

      // Reset state after delay
      setTimeout(() => setState('idle'), 2000)
    }
  }, [navigate, onLocationSuccess])

  // 🎨 Get icon based on state
  const Icon =
    state === 'loading' ? Loader2 : state === 'success' ? Navigation : Crosshair

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={handleGetLocation}
      disabled={state === 'loading'}
      className={cn(
        'fixed bottom-24 right-4 z-20 h-12 w-12 rounded-full',
        'shadow-lg backdrop-blur-md',
        'transition-all duration-300',
        state === 'loading' && 'animate-pulse',
        state === 'success' && 'bg-emerald-500/20 border-emerald-500/30',
        state === 'error' && 'bg-red-500/20 border-red-500/30',
        className,
      )}
      title="Use my location"
      aria-label="Get current location"
    >
      <Icon
        className={cn(
          'h-5 w-5',
          state === 'loading' && 'animate-spin',
          state === 'success' && 'text-emerald-500',
          state === 'error' && 'text-red-500',
        )}
      />
    </Button>
  )
}
