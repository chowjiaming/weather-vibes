/**
 * 📦 BentoPanel Component
 * Flexible bento-style panel container with glass effect
 */
'use client'

import type { VariantProps } from 'class-variance-authority'
import { motion, type Variants } from 'motion/react'
import type * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type cardVariants,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// 🎬 Animation variants
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// 📏 Span sizes for grid layout
export type BentoSpan = 1 | 2 | 3 | 4 | 'full' | 'half'

const spanClasses: Record<BentoSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  full: 'col-span-full',
  half: 'col-span-6',
}

// 📏 Row spans
export type BentoRowSpan = 1 | 2 | 3

const rowSpanClasses: Record<BentoRowSpan, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
}

interface BentoPanelProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof cardVariants> {
  /** 📏 Column span (1-4 or 'full'/'half') */
  colSpan?: BentoSpan
  /** 📏 Row span (1-3) */
  rowSpan?: BentoRowSpan
  /** 🎬 Whether to animate on mount */
  animate?: boolean
  /** ⏱️ Animation delay index */
  animationDelay?: number
}

export function BentoPanel({
  className,
  variant = 'glass',
  size = 'bento',
  colSpan = 1,
  rowSpan = 1,
  animate = true,
  animationDelay = 0,
  children,
  ...props
}: BentoPanelProps) {
  const Wrapper = animate ? motion.div : 'div'
  const animationProps = animate
    ? {
        variants: panelVariants,
        initial: 'hidden',
        animate: 'visible',
        transition: { delay: animationDelay * 0.1 },
      }
    : {}

  return (
    <Wrapper
      className={cn(spanClasses[colSpan], rowSpanClasses[rowSpan])}
      {...animationProps}
    >
      <Card
        variant={variant}
        size={size}
        className={cn('h-full', className)}
        {...props}
      >
        {children}
      </Card>
    </Wrapper>
  )
}

interface BentoPanelHeaderProps
  extends React.ComponentProps<typeof CardHeader> {
  /** 🏷️ Title text */
  title: string
  /** 📝 Optional subtitle */
  subtitle?: string
  /** 🎨 Icon component */
  icon?: React.ReactNode
  /** 🎯 Action button/element */
  action?: React.ReactNode
}

export function BentoPanelHeader({
  title,
  subtitle,
  icon,
  action,
  className,
  ...props
}: BentoPanelHeaderProps) {
  return (
    <CardHeader
      className={cn('flex flex-row items-start gap-3', className)}
      {...props}
    >
      {icon && (
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <CardTitle className="truncate">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </CardHeader>
  )
}

interface BentoPanelContentProps
  extends React.ComponentProps<typeof CardContent> {}

export function BentoPanelContent({
  className,
  children,
  ...props
}: BentoPanelContentProps) {
  return (
    <CardContent className={cn('flex-1', className)} {...props}>
      {children}
    </CardContent>
  )
}

// 🎨 Bento Grid Container
// Note: Omitting props that conflict with motion.div's types
interface BentoGridProps
  extends Omit<
    React.ComponentProps<'div'>,
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onAnimationStart'
    | 'onAnimationEnd'
  > {
  /** 📏 Number of columns (default: 12) */
  columns?: 4 | 6 | 8 | 12
  /** 📏 Gap size */
  gap?: 'sm' | 'md' | 'lg'
}

const columnClasses = {
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
  12: 'grid-cols-12',
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

export function BentoGrid({
  columns = 12,
  gap = 'md',
  className,
  children,
  ...props
}: BentoGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={cn('grid', columnClasses[columns], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
