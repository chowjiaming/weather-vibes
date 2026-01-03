/**
 * 📑 Tabs Component - Mode switching
 * Pill-style navigation for Explore/Compare modes
 */
'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'gap-3 group/tabs flex',
        'data-[orientation=horizontal]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    'inline-flex items-center justify-center w-fit',
    'text-muted-foreground',
    'group/tabs-list',
    'group-data-[orientation=vertical]/tabs:h-fit',
    'group-data-[orientation=vertical]/tabs:flex-col',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-muted p-1 rounded-xl gap-1',
        line: 'bg-transparent gap-2 border-b border-border pb-2',
        pills: 'bg-transparent gap-2',
        glass: 'glass p-1 rounded-xl gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // 📐 Base styles
        'relative inline-flex items-center justify-center',
        'px-4 py-2 text-sm font-medium',
        'whitespace-nowrap transition-all duration-200',
        'rounded-lg',
        // 🎨 Icon handling
        "gap-2 [&_svg:not([class*='size-'])]:size-4",
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        // 🎯 States
        'text-muted-foreground hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        // ✅ Active state
        'data-active:bg-background data-active:text-foreground',
        'data-active:shadow-sm',
        'dark:data-active:bg-muted',
        // 🎯 Focus
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        'focus-visible:outline-none',
        // 📏 Orientation variants
        'group-data-[orientation=vertical]/tabs:w-full',
        'group-data-[orientation=vertical]/tabs:justify-start',
        // 🎨 Line variant underline
        'group-data-[variant=line]/tabs-list:rounded-none',
        'group-data-[variant=line]/tabs-list:bg-transparent',
        'group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'group-data-[variant=line]/tabs-list:data-active:shadow-none',
        'group-data-[variant=line]/tabs-list:after:absolute',
        'group-data-[variant=line]/tabs-list:after:inset-x-0',
        'group-data-[variant=line]/tabs-list:after:bottom-[-10px]',
        'group-data-[variant=line]/tabs-list:after:h-0.5',
        'group-data-[variant=line]/tabs-list:after:bg-primary',
        'group-data-[variant=line]/tabs-list:after:opacity-0',
        'group-data-[variant=line]/tabs-list:after:transition-opacity',
        'group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        // 🎨 Pills variant
        'group-data-[variant=pills]/tabs-list:bg-transparent',
        'group-data-[variant=pills]/tabs-list:data-active:bg-primary',
        'group-data-[variant=pills]/tabs-list:data-active:text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        'text-sm leading-relaxed',
        'animate-fade-in',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
