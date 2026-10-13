import { Check } from 'lucide-react'
import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { LazyCoin } from '@/components/ui/LazyCoin'
import { cta, links, plans, type Plan } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

/**
 * Plan cards borrow the stat cards' silhouettes (one per card) so the page keeps a single
 * angular vocabulary. Each plan carries its own coin, a shade deeper per tier.
 */
const SHAPES = [
  'polygon(64px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 64px)',
  'polygon(14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 64px 100%, 0 calc(100% - 64px), 0 14px)',
  'polygon(14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 64px), calc(100% - 64px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
]
// The middle card steps down like the template's middle stat card; on two-column tablets the third card centres on its own row.
const OFFSETS = ['', 'lg:mt-16', 'md:col-span-2 md:mx-auto md:w-1/2 lg:col-span-1 lg:w-auto']

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const shape = SHAPES[index % SHAPES.length]
  return (
    <article data-reveal aria-labelledby={`plan-${plan.id}`} className={cn('relative', OFFSETS[index])}>
      <div className="h-full bg-line-strong/70 p-px" style={{ clipPath: shape }}>
        <div className="flex h-full flex-col bg-white px-6 pb-12 pt-6 sm:px-8" style={{ clipPath: shape }}>
          <LazyCoin
            className="mx-auto size-[150px] sm:size-[170px]"
            fill={0.86}
            preset="blue"
            tint={plan.coin.tint}
            finish={plan.coin.finish}
            spinPeriod={16 + index * 3}
            tilt={index % 2 ? 10 : -10}
            seed={index + 1}
            label={`The ${plan.name} plan's 10X coin.`}
          />
          <h3 id={`plan-${plan.id}`} className="font-firs text-gradient mt-4 self-center text-[34px] font-semibold uppercase leading-none sm:text-[40px]">
            {plan.name}
          </h3>
          <p className="mx-auto mt-4 max-w-[28ch] text-center text-[15px] leading-[1.5] text-navy-2">{plan.tagline}</p>

          <ul className="mt-7 space-y-3.5 border-t border-line pt-6">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[14px] leading-[1.45] text-navy">
                <span aria-hidden className="chamfer-6 mt-px grid size-[18px] shrink-0 place-items-center bg-frost">
                  <Check strokeWidth={2} className="size-3 text-accent" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <ChamferButton href={links.signUp} size="md" className="mt-8 w-full" aria-label={`${cta.primary}: ${plan.name}`}>
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </article>
  )
}

export function Plans() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="plans" ref={root} aria-labelledby="plans-title" className="relative bg-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center text-navy">
          <h2 id="plans-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]">
            {plans.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{plans.intro}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:items-start">
          {plans.list.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
