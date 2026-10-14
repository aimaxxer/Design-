import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** A small chamfered fact chip: hairline edge, white face, coin-blue tick (the plan cards' check, inline). */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li className={cn('chamfer-6 bg-line p-px', className)}>
      <span className="chamfer-6 flex items-center gap-2 bg-white/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-navy">
        <Check aria-hidden strokeWidth={2} className="size-3 shrink-0 text-accent" />
        {children}
      </span>
    </li>
  )
}
