import { ArrowUpRight } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'teal' | 'light' | 'outline'

type Props = {
  variant?: Variant
  size?: 'sm' | 'md'
  /** Custom icon, or false for none. Defaults to the template's up-right arrow. */
  icon?: ReactNode | false
  children: ReactNode
} & ComponentPropsWithoutRef<'a'>

const arrow = (
  <ArrowUpRight
    aria-hidden
    strokeWidth={1.75}
    className="size-3.5 transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
  />
)

/** The template's chamfered CTA: clipped corners, uppercase label, arrow that nudges up-right on hover. */
export function ChamferButton({ variant = 'teal', size = 'sm', icon, className, children, ...rest }: Props) {
  const sizing =
    size === 'sm' ? 'px-4 py-2.5 text-[10px] sm:px-5 sm:py-3 sm:text-[11px]' : 'px-6 py-4 text-[11px] sm:px-7 sm:text-[12px]'
  const label = (
    <>
      {children}
      {icon === false ? null : (icon ?? arrow)}
    </>
  )
  const base = 'chamfer-10 group inline-flex select-none whitespace-nowrap font-medium uppercase tracking-[0.14em]'

  if (variant === 'outline') {
    // A 1px navy edge made from a clipped layer behind a clipped white face.
    return (
      <a
        {...rest}
        className={cn(base, 'bg-navy/80 p-px transition-transform duration-150 ease-[var(--ease-out-strong)] active:scale-[0.97]', className)}
      >
        <span
          className={cn(
            'chamfer-10 inline-flex w-full items-center justify-center gap-2 bg-white text-navy transition-colors duration-200 group-hover:bg-frost',
            sizing,
          )}
        >
          {label}
        </span>
      </a>
    )
  }

  return (
    <a
      {...rest}
      className={cn(
        base,
        'items-center justify-center gap-2 transition-[filter,background-color,transform] duration-200 ease-[var(--ease-out-strong)] active:scale-[0.97]',
        sizing,
        // White on #066377 is 6.9:1; the template lifts it with brightness on hover.
        variant === 'teal' ? 'bg-teal text-white hover:brightness-125' : 'bg-white text-navy hover:bg-frost',
        className,
      )}
    >
      {label}
    </a>
  )
}
