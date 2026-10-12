import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Check } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import { ChamferFrame } from '@/components/ui/ChamferFrame'
import { LoopVideo } from '@/components/ui/LoopVideo'
import { problems, problemsIntro, type Problem } from '@/content'
import { cn } from '@/lib/cn'

/** The fix for the selected wall: title, text and what it replaces. */
function Fix({ problem }: { problem: Problem }) {
  return (
    <>
      <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
        <Check aria-hidden strokeWidth={2} className="size-3.5" />
        With 10X Affiliation
      </p>
      <h3 className="font-firs mt-3 text-[24px] leading-tight sm:text-[28px]">{problem.fixTitle}</h3>
      <p className="mx-auto mt-3 max-w-[42ch] text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">{problem.fixText}</p>
    </>
  )
}

/** The template's nomination card, made a toggle: it picks which wall the centre panel answers. */
function WallCard({ problem, active, onSelect }: { problem: Problem; active: boolean; onSelect: () => void }) {
  return (
    <div data-wall-card className="w-full max-w-[20em]">
      <button
        type="button"
        aria-pressed={active}
        aria-controls={`wall-fix wall-inline-${problem.id}`}
        onClick={onSelect}
        className="group relative min-h-[5em] w-full py-3 text-ink transition-transform duration-200 ease-[var(--ease-out-strong)] hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <ChamferFrame active={active} />
        <span className="relative flex min-h-[calc(5em-24px)] flex-col items-center justify-center px-6 text-center">
          <span className="text-[13px] font-semibold">{problem.title}</span>
          <span className="mt-0.5 text-[12px] font-normal leading-snug opacity-80">{problem.subtitle}</span>
        </span>
      </button>

      {/* Below lg the centre panel sits above the list, so the fix opens in place instead. */}
      <div
        id={`wall-inline-${problem.id}`}
        inert={!active}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-strong)] lg:hidden',
          active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-5 text-center text-ink">
            <Fix problem={problem} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Problems() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const problem = problems[active]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-problems-head] > *', {
          autoAlpha: 0,
          y: 24,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-problems-head]', start: 'top 85%', once: true },
        })
        gsap.from('[data-problems-visual]', {
          autoAlpha: 0,
          scale: 0.94,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-problems-visual]', start: 'top 85%', once: true },
        })
        // Cards arrive in reading order: down the left column, then down the right.
        gsap.utils.toArray<HTMLElement>('[data-wall-col]').forEach((col, c) => {
          gsap.from(col.querySelectorAll('[data-wall-card]'), {
            autoAlpha: 0,
            y: 22,
            duration: 0.9,
            stagger: 0.09,
            delay: c * 0.18,
            ease: 'expo.out',
            scrollTrigger: { trigger: col, start: 'top 85%', once: true },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const column = (from: number, to: number, side: 'left' | 'right') => (
    <div
      data-wall-col
      className={cn(
        'flex flex-col items-center gap-4 lg:mt-36',
        side === 'left' ? 'order-2 lg:order-1 lg:items-end' : 'order-3 lg:items-start',
      )}
    >
      {problems.slice(from, to).map((p, i) => (
        <WallCard key={p.id} problem={p} active={active === from + i} onSelect={() => setActive(from + i)} />
      ))}
    </div>
  )

  return (
    <section id="problems" ref={root} aria-labelledby="problems-title" className="relative overflow-hidden bg-mist px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
        {column(0, 3, 'left')}

        <div className="order-1 flex flex-col items-center text-ink lg:order-2">
          <div data-problems-head className="text-center">
            <p className="text-[12px] uppercase tracking-[0.24em]">{problemsIntro.label}</p>
            <h2 id="problems-title" className="font-firs mt-2 text-[44px] font-semibold uppercase leading-none tracking-tight sm:text-[54px]">
              {problemsIntro.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[34ch] text-[14px] leading-relaxed text-ink-2">{problemsIntro.hint}</p>
          </div>

          <div data-problems-visual className="relative mt-6 size-[220px] sm:mt-8 sm:size-[380px] lg:size-[460px]">
            {/* Feathered edges: the render's studio grey melts into the section instead of reading as a box. */}
            <LoopVideo
              name="glass"
              alt="A glass sculpture turning slowly, its folds catching warm champagne light"
              className="media-warm h-full w-full object-cover [mask-image:radial-gradient(closest-side,black_72%,transparent)]"
            />
          </div>

          {/* Desktop: the fix for the selected wall. Fixed min-height so switching never shifts the page. */}
          <div id="wall-fix" aria-live="polite" className="mt-6 hidden min-h-[150px] w-full max-w-[460px] lg:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={problem.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(3px)' }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                className="text-center"
              >
                <Fix problem={problem} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {column(3, 6, 'right')}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(248, 246, 242, 0) 0%, rgba(248, 246, 242, 0.7) 60%, #F8F6F2 100%)' }}
      />
    </section>
  )
}
