import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { CircleCheck } from 'lucide-react'
import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cta, links, processFlow } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

gsap.registerPlugin(useGSAP)

/** Each step sits one stair higher than the last on desktop: the account grows as you go. */
const STAIRS = ['lg:mt-[168px]', 'lg:mt-[112px]', 'lg:mt-[56px]', 'lg:mt-0']

export function Process() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The coin-blue rail on each step fills in order as the section scrolls through.
        gsap.fromTo(
          '[data-step-rail]',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            stagger: 0.5,
            scrollTrigger: { trigger: '[data-steps]', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="process" ref={root} aria-labelledby="process-title" className="relative bg-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-navy">
          <Eyebrow>{processFlow.label}</Eyebrow>
          <h2
            id="process-title"
            className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]"
          >
            {processFlow.title}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{processFlow.intro}</p>
        </div>

        <ol data-steps className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {processFlow.steps.map((step, i) => (
            <li key={step.n} data-reveal className={cn('relative', STAIRS[i])}>
              <div className="chamfer-16 h-full bg-line p-px">
                <article className="chamfer-16 relative flex h-full flex-col bg-white p-6 sm:p-7">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-line" />
                  <span data-step-rail aria-hidden className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent" />
                  <p className="font-firs text-gradient tabular text-[40px] font-semibold leading-none sm:text-[52px]">{step.n}</p>
                  <h3 className="mt-6 text-[18px] font-semibold leading-snug text-navy">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-navy-2">{step.body}</p>
                  <ul className="mt-6 space-y-3 border-t border-line pt-5">
                    {step.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[14px] leading-[1.45] text-navy">
                        <CircleCheck aria-hidden strokeWidth={1.5} className="mt-px size-4 shrink-0 text-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
