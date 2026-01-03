/**
 * ⏱️ Debounced Callback Hook
 * Debounce function calls to reduce API requests
 */

import { useCallback, useEffect, useRef } from 'react'

/**
 * 🔄 Hook to debounce a callback function
 */
export function useDebouncedCallback<
  T extends (...args: Parameters<T>) => void,
>(callback: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // 🔄 Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 📦 Return debounced function
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay],
  ) as T

  return debouncedCallback
}

/**
 * 🔄 Hook to debounce a value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const previousValueRef = useRef(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      previousValueRef.current = value
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return previousValueRef.current
}
