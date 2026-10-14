import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** The small numbered label above a section headline ("01 · The problem"), as on Benefits. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mb-4 text-[12px] uppercase tracking-[0.24em] text-navy', className)}>{children}</p>
}
