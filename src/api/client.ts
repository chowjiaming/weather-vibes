/**
 * 🔌 Open-Meteo API Client Utilities
 * HTTP client and helper functions for API calls
 */

import type { ApiErrorResponse } from './types'

/**
 * Custom error class for API errors
 */
export class OpenMeteoError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly reason?: string,
  ) {
    super(message)
    this.name = 'OpenMeteoError'
  }
}

/**
 * Build query string from parameters object
 * Handles arrays by joining with commas
 */
export function buildQueryString(
  params: Record<string, unknown>,
): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      // Join array values with commas
      searchParams.set(key, value.join(','))
    } else if (typeof value === 'boolean') {
      searchParams.set(key, value ? 'true' : 'false')
    } else {
      searchParams.set(key, String(value))
    }
  }

  return searchParams
}

/**
 * Build full URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  params: Record<string, unknown>,
): string {
  const queryString = buildQueryString(params)
  const queryPart = queryString.toString()
  return queryPart ? `${baseUrl}?${queryPart}` : baseUrl
}

/**
 * Type guard to check if response is an error
 */
function isApiError(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as ApiErrorResponse).error === true
  )
}

/**
 * Fetch data from Open-Meteo API with error handling
 */
export async function fetchFromApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  // Check for HTTP errors
  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json()
      if (isApiError(errorData)) {
        throw new OpenMeteoError(
          errorData.reason || 'API request failed',
          response.status,
          errorData.reason,
        )
      }
    } catch {
      // If we can't parse the error, throw a generic error
    }

    throw new OpenMeteoError(
      `API request failed with status ${response.status}`,
      response.status,
    )
  }

  const data = await response.json()

  // Check for API-level errors (some endpoints return 200 with error body)
  if (isApiError(data)) {
    throw new OpenMeteoError(
      data.reason || 'API returned an error',
      200,
      data.reason,
    )
  }

  return data as T
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get date string for N days ago
 */
export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

/**
 * Get date string for N days from now
 */
export function getDaysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string,
  endDate: string,
): { valid: boolean; error?: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' }
  }

  if (Number.isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' }
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' }
  }

  return { valid: true }
}
