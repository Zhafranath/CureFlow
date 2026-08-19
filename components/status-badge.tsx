'use client'

import type { PlantStatus } from '@/lib/store'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

const STYLES: Record<PlantStatus, string> = {
  ready:
    'bg-success/15 text-success border-success/30',
  inGrowth:
    'bg-warning/15 text-warning border-warning/30',
  outOfStock:
    'bg-muted text-muted-foreground border-border',
}

export function StatusBadge({
  status,
  className,
}: {
  status: PlantStatus
  className?: string
}) {
  const { t } = useApp()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'ready' && 'bg-success animate-pulse shadow-[0_0_8px_#10b981]',
          status === 'inGrowth' && 'bg-warning',
          status === 'outOfStock' && 'bg-muted-foreground',
        )}
      />
      {t(status)}
    </span>
  )
}
