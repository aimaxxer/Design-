import { brand } from '@/content'
import { cn } from '@/lib/cn'

/** The 10X mark (same geometry as the 10X Affiliation build). */
const MARK =
  'M95 282L205 212H294V658H200V302L95 366Z M557 206C669.2 206 738 293.8 738 437C738 580.2 669.2 668 557 668C444.8 668 376 580.2 376 437C376 293.8 444.8 206 557 206Z M557 284C607.4 284 641 345.2 641 437C641 528.8 607.4 590 557 590C506.6 590 473 528.8 473 437C473 345.2 506.6 284 557 284Z M773 204H889L1215 650H1101Z M1101 204H1215L1107 350H996Z M878 507H995L889 650H773Z'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="95 204 1120 464" fill="currentColor" aria-hidden className={className}>
      <path fillRule="evenodd" d={MARK} />
    </svg>
  )
}

/** The template's two-line lockup: mark, name, and a light sub-line underneath. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-[18px] w-auto shrink-0 sm:h-5" />
      <span className="flex flex-col leading-none">
        <span className="text-[14px] font-semibold tracking-tight sm:text-[15px]">{brand.word}</span>
        <span className="mt-1 whitespace-nowrap text-[10px] font-light opacity-90 sm:text-[11px]">{brand.tagline}</span>
      </span>
    </span>
  )
}
