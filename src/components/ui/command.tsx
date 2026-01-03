/**
 * ⌨️ Command Component - Spotlight-style search
 * Command palette for location search and navigation
 */
'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { CheckIcon, SearchIcon } from 'lucide-react'
import type * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover/95 backdrop-blur-xl text-popover-foreground',
        'rounded-2xl flex size-full flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Search',
  description = 'Search for locations, weather data, or navigate...',
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          'rounded-2xl overflow-hidden p-0',
          'max-w-lg',
          'bg-transparent border-0 shadow-2xl',
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-3 px-4 py-4 border-b border-border/50"
    >
      <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-[400px] scroll-py-1 outline-none overflow-x-hidden overflow-y-auto',
        'p-2',
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        'py-12 text-center text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> & {
  heading?: string
}) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      heading={heading}
      className={cn(
        'text-foreground',
        '[&_[cmdk-group-heading]]:text-muted-foreground',
        '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2',
        '[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        '[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('bg-border/50 -mx-2 my-2 h-px', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-pointer items-center gap-3',
        'rounded-xl px-3 py-3 text-sm outline-none select-none',
        'transition-colors duration-150',
        // Hover/Selected states
        'data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        'hover:bg-muted/50',
        // Disabled state
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        // Icon sizing
        "[&_svg:not([class*='size-'])]:size-5",
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        '[&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-foreground',
        'group/command-item',
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon
        className={cn(
          'ml-auto size-4 opacity-0',
          'group-has-[[data-slot=command-shortcut]]/command-item:hidden',
          'group-data-[checked=true]/command-item:opacity-100',
        )}
      />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        'group-data-[selected=true]/command-item:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
