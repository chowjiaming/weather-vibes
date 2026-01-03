/**
 * 📦 Card Component - Bento Panel Style
 * Glass morphism aesthetic with rounded corners
 */

import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'overflow-hidden text-card-foreground group/card flex flex-col transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card border border-border shadow-sm',
        glass:
          'glass border-0 bg-glass-bg backdrop-blur-[var(--glass-blur)] shadow-[var(--glass-shadow)]',
        ghost: 'bg-transparent border-0 shadow-none',
        outline: 'bg-transparent border border-border',
      },
      size: {
        default: 'gap-4 py-4 rounded-xl',
        sm: 'gap-2 py-3 rounded-lg',
        lg: 'gap-6 py-6 rounded-2xl',
        bento: 'gap-4 p-4 rounded-3xl',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
    },
  },
)

interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, size, interactive, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min items-start gap-1.5 px-4',
        'group-data-[size=sm]/card:px-3',
        'group-data-[size=bento]/card:px-0',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        'has-data-[slot=card-description]:grid-rows-[auto_auto]',
        '@container/card-header group/card-header',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-display text-base font-semibold tracking-tight',
        'group-data-[size=sm]/card:text-sm',
        'group-data-[size=lg]/card:text-lg',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'px-4 flex-1',
        'group-data-[size=sm]/card:px-3',
        'group-data-[size=bento]/card:px-0',
        className,
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center gap-2 px-4 pt-2',
        'border-t border-border/50',
        'group-data-[size=sm]/card:px-3',
        'group-data-[size=bento]/card:px-0 group-data-[size=bento]/card:pt-4',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
