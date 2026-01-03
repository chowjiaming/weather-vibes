/**
 * 🏷️ Badge Component - Pill-style indicators
 * For labels, categories, and data tags
 */
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    // 📐 Base styles
    'inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0',
    'border border-transparent transition-all duration-150',
    'text-xs font-medium',
    // 🎨 Icon handling
    'gap-1.5 [&>svg]:size-3 [&>svg]:pointer-events-none',
    'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
    // 🎯 Focus styles
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',
    // ⚠️ Invalid styles
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    'dark:aria-invalid:ring-destructive/40',
    'group/badge overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground bg-transparent',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive: [
          'bg-destructive/10 text-destructive',
          'dark:bg-destructive/20',
        ].join(' '),
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        glass: 'glass text-foreground border-glass-border',
      },
      size: {
        default: 'h-6 px-2.5 rounded-md',
        sm: 'h-5 px-2 text-[11px] rounded',
        lg: 'h-7 px-3 rounded-lg',
        pill: 'h-6 px-3 rounded-full',
      },
      interactive: {
        true: 'cursor-pointer hover:opacity-80 active:scale-95',
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

function Badge({
  className,
  variant = 'default',
  size = 'default',
  interactive = false,
  render,
  ...props
}: useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { interactive?: boolean }) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ className, variant, size, interactive })),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
