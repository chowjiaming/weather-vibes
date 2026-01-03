/**
 * 🔘 Button Component - Modern rounded style
 * Consistent with bento/glass aesthetic
 */
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // 📐 Base styles
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-medium transition-all duration-150',
    'border border-transparent bg-clip-padding',
    'select-none shrink-0 outline-none',
    // 🎯 Focus styles
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',
    // ⚠️ Invalid/Error styles
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    'dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50',
    // 🚫 Disabled styles
    'disabled:pointer-events-none disabled:opacity-50',
    // 🎨 SVG handling
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    'group/button',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:bg-primary/80',
          'shadow-sm hover:shadow',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 active:bg-secondary/70',
          'aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ].join(' '),
        outline: [
          'border-border bg-background',
          'hover:bg-muted hover:text-foreground',
          'dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
          'aria-expanded:bg-muted aria-expanded:text-foreground',
        ].join(' '),
        ghost: [
          'hover:bg-muted hover:text-foreground',
          'dark:hover:bg-muted/50',
          'aria-expanded:bg-muted aria-expanded:text-foreground',
        ].join(' '),
        destructive: [
          'bg-destructive/10 text-destructive',
          'hover:bg-destructive/20 active:bg-destructive/30',
          'dark:bg-destructive/20 dark:hover:bg-destructive/30',
          'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          'focus-visible:border-destructive/40',
        ].join(' '),
        link: ['text-primary underline-offset-4', 'hover:underline'].join(' '),
        glass: [
          'glass text-foreground',
          'hover:bg-white/20 dark:hover:bg-white/10',
          'border-glass-border',
        ].join(' '),
      },
      size: {
        default: 'h-9 gap-2 px-4 text-sm rounded-lg',
        xs: "h-6 gap-1 px-2 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-3 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 gap-2 px-6 text-base rounded-xl',
        xl: 'h-12 gap-3 px-8 text-base rounded-xl font-semibold',
        icon: 'size-9 rounded-lg',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-7 rounded-md',
        'icon-lg': 'size-11 rounded-xl',
        pill: 'h-9 gap-2 px-6 text-sm rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
