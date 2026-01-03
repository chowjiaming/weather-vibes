/**
 * 📦 Container Component
 * Responsive container with consistent padding
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  /**
   * 📐 Container size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /**
   * 🔲 Add padding
   */
  padded?: boolean
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export function Container({
  children,
  className,
  size = 'xl',
  padded = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padded && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
