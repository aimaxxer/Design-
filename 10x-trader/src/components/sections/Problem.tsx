import { ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { LazyCoin } from '@/components/ui/LazyCoin'
import { PickCard, type PickItem } from '@/components/ui/PickCard'
import type { TenXCoinHandle } from '@/coin/mount'
import { cta, links, problem } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

type Card = PickItem & { body: string }

// The bridge line closes the story as the sixth card: its first sentence on top, the second under it.
const [bridgeTitle, bridgeBody = ''] = problem.bridge.split(/(?<=\.)\s+/)

const steps: Card[] = problem.steps.map((s) => ({ id: `step-${s.n}`, title: s.title, sub: `${problem.stepLabel} ${s.n}`, body: s.body }))
const LEFT = steps.slice(0, 3)
const RIGHT: Card[] = [...steps.slice(3), { id: 'bridge', title: bridgeTitle, sub: bridgeBody, body: bridgeBody }]

/**
 * The reader's own story told back to them in the site's signature second-section layout (the same
 * coin-and-cards composition as Benefits): five steps and the bridge line around the coin, then the
 * "built against you / built for you" block that hands over to the aligned model.
 */
export function Problem() {
  const root = useRef<HTMLElement>(null)
  const coin = useRef<TenXCoinHandle | null>(null)
  const [selected, setSelected] = useState(LEFT[0].id)
  const current = [...LEFT, ...RIGHT].find((c) => c.id === selected) ?? LEFT[0]
  useReveal(root)

  const select = (id: string) => {
    if (id === selected) return
    setSelected(id)
    coin.current?.spin(1, 1.6)
  }

  const column = (items: Card[], side: 'left' | 'right') => (
    <ul
      className={cn(
        'flex flex-col items-center gap-4 lg:mt-24',
        side === 'left' ? 'order-2 lg:order-1 lg:items-end' : 'order-3 lg:items-start',
      )}
    >
      {items.map((item) => (
        <PickCard key={item.id} item={item} active={item.id === selected} controls="problem-detail" onSelect={() => select(item.id)} />
      ))}
    </ul>
  )

  return (
    <section id="problem" ref={root} aria-labelledby="problem-title" className="relative overflow-hidden bg-mist px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center text-navy">
          <Eyebrow className="mb-2">{problem.label}</Eyebrow>
          <h2 id="problem-title" className="font-firs text-[40px] font-semibold uppercase leading-none tracking-tight sm:text-[54px]">
            {problem.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{problem.intro}</p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          <div className="order-1 flex flex-col items-center text-center text-navy lg:order-2">
            <LazyCoin
              className="size-[220px] sm:size-[380px] lg:size-[460px]"
              fill={0.8}
              spinPeriod={18}
              tilt={10}
              seed={3}
              label={problem.coinLabel}
              onReady={(h) => (coin.current = h)}
            />
            <div id="problem-detail" aria-live="polite" className="mt-6 grid min-h-[7.5em] max-w-sm justify-items-center">
              <p key={current.id} className="animate-[detail-in_420ms_cubic-bezier(0.23,1,0.32,1)] text-[15px] leading-relaxed text-navy-2 motion-reduce:animate-none">
                <span className="mb-2 block text-[13px] font-semibold text-navy">{current.title}</span>
                {current.body}
              </p>
            </div>
          </div>

          {column(LEFT, 'left')}
          {column(RIGHT, 'right')}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:gap-5">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-navy">{problem.against.label}</p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {problem.against.cards.map((card) => (
                <div key={card.title} data-reveal className="chamfer-16 h-full bg-line p-px">
                  <article className="chamfer-16 h-full bg-white p-6 sm:p-7">
                    <h3 className="text-[18px] font-semibold leading-snug text-navy">{card.title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.55] text-navy-2">{card.body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-accent">{problem.forYou.label}</p>
            <div data-reveal className="chamfer-16 mt-5 bg-accent/60 p-px">
              <article className="chamfer-16 relative bg-frost p-6 sm:p-7">
                <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-accent" />
                <h3 className="text-[18px] font-semibold leading-snug text-navy">{problem.forYou.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-navy-2">{problem.forYou.body}</p>
                <a href={problem.forYou.link.href} className="group mt-6 inline-flex items-center gap-3 text-[14px] font-medium text-navy">
                  {problem.forYou.link.label}
                  <span className="chamfer-8 grid size-8 place-items-center bg-navy p-px transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5">
                    <span className="chamfer-8 grid h-full w-full place-items-center bg-frost transition-colors duration-200 group-hover:bg-white">
                      <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
                    </span>
                  </span>
                </a>
              </article>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(240, 245, 247, 0) 0%, rgba(240, 245, 247, 0.7) 60%, #F0F5F7 100%)' }}
      />
    </section>
  )
}
