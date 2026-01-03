/**
 * 🔍 SearchTrigger Component
 * Button to open the command palette search
 */
'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchTriggerProps {
  onClick: () => void
  className?: string
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <Button
      variant="glass"
      size="lg"
      onClick={onClick}
      className={cn(
        'gap-3 pr-4 rounded-full',
        'text-muted-foreground',
        className,
      )}
    >
      <Search size={18} />
      <span className="hidden sm:inline text-sm">Search location...</span>
      <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
