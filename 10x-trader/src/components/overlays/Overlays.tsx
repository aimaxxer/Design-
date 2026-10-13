import { ArrowUpRight } from 'lucide-react'
import { SECTION_IDS } from '@/hooks/useChapter'
import { useScrolled } from '@/hooks/useScrolled'
import { cta, links, nav } from '@/content'
import { cn } from '@/lib/cn'

const pad = (n: number) => String(n).padStart(2, '0')

const cornerMask = (side: 'left' | 'right') => {
  const mask = `radial-gradient(circle at ${side === 'left' ? '0' : '100%'} 100%, transparent 24px, black 25px)`
  return { WebkitMaskImage: mask, maskImage: mask }
}

/**
 * The template's notch: a white tab hanging into the card, joined to the white frame
 * by two inverted-radius corners cut with radial-gradient masks.
 */
export function TopNav({ active }: { active: number }) {
  const activeId = SECTION_IDS[active]
  return (
    <nav
      aria-label="Primary"
      className="absolute left-1/2 top-0 z-40 hidden -translate-x-1/2 items-center gap-6 rounded-b-[28px] bg-white px-6 py-4 md:flex lg:gap-10 lg:px-10"
    >
      <span aria-hidden className="absolute -left-6 top-0 size-6 bg-white" style={cornerMask('left')} />
      {nav.map((item) => {
        const current = item.id === activeId
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={current ? 'location' : undefined}
            className={cn(
              'relative whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200',
              current ? 'text-navy' : 'text-neutral-800 hover:text-neutral-500',
            )}
          >
            {item.label}
            <span
              aria-hidden
              className={cn(
                'absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ease-[var(--ease-out-strong)]',
                current ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </a>
        )
      })}
      <span aria-hidden className="absolute -right-6 top-0 size-6 bg-white" style={cornerMask('right')} />
    </nav>
  )
}

/** "01 ---- 08": which chapter of the page you are in. */
export function PageIndicator({ active }: { active: number }) {
  return (
    <div
      aria-hidden
      // Phones get the floating CTA in this corner instead, so the counter starts at tablet width.
      className="pointer-events-none absolute bottom-4 right-4 z-40 hidden items-center gap-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 mix-blend-difference sm:bottom-6 sm:right-8 md:flex"
    >
      <span className="tabular relative inline-block h-[1.2em] w-[2.2ch] overflow-hidden">
        <span key={active} className="absolute inset-0 animate-[counter-in_420ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none">
          {pad(active + 1)}
        </span>
      </span>
      <span className="relative h-px w-8 bg-white/40">
        <span
          className="absolute inset-y-0 left-0 bg-white/90 transition-[width] duration-500 ease-[var(--ease-out-strong)]"
          style={{ width: `${((active + 1) / SECTION_IDS.length) * 100}%` }}
        />
      </span>
      <span className="tabular">{pad(SECTION_IDS.length)}</span>
    </div>
  )
}

/** The template's bottom-left cue. It bows out once the visitor has started scrolling. */
export function ScrollHint() {
  const scrolled = useScrolled()
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-4 left-4 z-40 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 mix-blend-difference transition-[opacity,transform] duration-500 ease-[var(--ease-out-strong)] sm:bottom-6 sm:left-8',
        scrolled ? 'translate-y-2 opacity-0' : 'opacity-100',
      )}
    >
      Scroll to discover
    </div>
  )
}

/** Phones and tablets have no notch nav, so a compact CTA rides along once you leave the hero. */
export function MobileCta({ active }: { active: number }) {
  const show = active > 0
  return (
    <div
      className={cn(
        'absolute bottom-3 left-1/2 z-40 -translate-x-1/2 transition-[opacity,transform] duration-300 ease-[var(--ease-out-strong)] md:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      inert={!show}
    >
      <a
        href={links.signUp}
        className="chamfer-10 group inline-flex items-center gap-2 whitespace-nowrap bg-accent px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white shadow-[0_12px_32px_-12px_rgba(0,104,162,0.55)] transition-transform active:scale-[0.97]"
      >
        {cta.short}
        <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
      </a>
    </div>
  )
}
