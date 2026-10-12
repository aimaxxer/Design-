import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef, type ReactNode } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Ph } from '@/components/ui/Ph'
import { cta, trader } from '@/content'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/cn'

/** Same silhouette as the second stat card, so the glass reads as part of one family. */
const GLASS_CLIP =
  'polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 64px 100%, 0 calc(100% - 64px))'

/** Ladder heights as a share of the chart: $10k, $20k, $50k, $100k on a linear scale. */
const LADDER = [0.1, 0.2, 0.5, 1]

function Panel({ n, title, text, children }: { n: number; title: string; text: string; children: ReactNode }) {
  return (
    <article className="chamfer-24 bg-line p-px">
      <div className="chamfer-24 flex h-full flex-col bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span aria-hidden className="chamfer-6 grid size-8 shrink-0 place-items-center bg-ink text-[12px] font-medium text-white tabular">
            {n}
          </span>
          <div>
            <h4 className="text-[16px] font-semibold text-ink">{title}</h4>
            <p className="mt-0.5 text-[13px] text-ink-3">{text}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-1 flex-col justify-end">{children}</div>
      </div>
    </article>
  )
}

export function Trader() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-trader-copy] > *', {
          autoAlpha: 0,
          y: 24,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-trader-copy]', start: 'top 84%', once: true },
        })
        gsap.from('[data-trader-glass]', {
          autoAlpha: 0,
          scale: 0.94,
          rotate: -4,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-trader-glass]', start: 'top 85%', once: true },
        })
        gsap.to('[data-trader-glass] img', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: '[data-trader-glass]', start: 'top bottom', end: 'bottom top', scrub: true },
        })

        // Signature moment: one client's money multiplies as you scroll through the three panels.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '[data-how]', start: 'top 78%', end: 'bottom 62%', scrub: 0.6 },
        })
        tl.fromTo('[data-credit]', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          .fromTo('[data-power]', { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.4 }, 0.7)
        gsap.utils.toArray<HTMLElement>('[data-rung]').forEach((bar, i) => {
          tl.fromTo(bar, { scaleY: 0.04 }, { scaleY: 1, duration: 0.6 }, 0.9 + i * 0.32)
        })
        tl.fromTo('[data-earn="standard"]', { scaleY: 0.04 }, { scaleY: 1, duration: 0.5 }, 2.1)
          .fromTo('[data-earn="boosted"]', { scaleY: 0.04 }, { scaleY: 1, duration: 0.9 }, 2.3)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="trader" ref={root} aria-labelledby="trader-title" className="relative overflow-hidden bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto max-w-7xl">
        <div data-trader-copy>
          <h2 id="trader-title" className="font-firs text-[34px] font-semibold uppercase leading-[0.95] tracking-tight text-ink sm:text-[46px] lg:text-[54px]">
            {trader.titleLine1}
            <br />
            <span className="text-accent">{trader.titleLine2}</span>
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 items-center gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">
          <div data-trader-copy className="text-ink lg:col-span-7">
            <p className="max-w-[58ch] text-[17px] leading-[1.55] text-ink-2 sm:text-[18px]">{trader.body}</p>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-line-strong pt-6 sm:gap-4">
              {trader.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-firs text-gradient inline-block text-[24px] font-semibold uppercase leading-none sm:text-[40px]">{s.value}</span>
                    <span className="mt-2 block text-[13px] leading-snug text-ink-2">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ChamferButton href="#apply" data-move-focus size="md">
                {cta.primary}
              </ChamferButton>
              <span className="text-[13px] text-ink-3">{trader.access}</span>
            </div>
          </div>

          <div data-trader-glass className="mx-auto w-full max-w-[460px] lg:col-span-5">
            <div className="aspect-square w-full" style={{ clipPath: GLASS_CLIP, backgroundColor: 'rgba(255,255,255,0.8)', padding: '1.5px' }}>
              <div className="h-full w-full overflow-hidden bg-mist" style={{ clipPath: GLASS_CLIP }}>
                <img src={asset(trader.image)} alt="" loading="lazy" decoding="async" className="media-warm h-[112%] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 sm:mt-32">
          <div className="flex flex-wrap items-baseline justify-between gap-4 text-ink">
            <h3 className="font-firs text-[30px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[40px]">{trader.howTitle}</h3>
            <p className="text-[14px] text-ink-3">{trader.howSub}</p>
          </div>

          <div data-how className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Panel n={1} title={trader.deposit.title} text={trader.deposit.text}>
              <div aria-hidden className="flex h-12 w-full gap-1">
                <span className="chamfer-6 h-full w-[10%] shrink-0 bg-ink" />
                <span data-credit className="chamfer-6 h-full flex-1 origin-left bg-gradient-to-r from-accent to-champagne" />
              </div>
              <dl className="mt-6 space-y-2.5 text-[14px]">
                {trader.deposit.rows.map((r, i) => (
                  <div
                    key={r.label}
                    data-power={i === 2 ? '' : undefined}
                    className={cn('flex items-baseline justify-between gap-4', i === 2 && 'border-t border-line pt-3')}
                  >
                    <dt className={cn(i === 2 ? 'font-semibold text-ink' : 'text-ink-2')}>
                      {i === 1 ? '+ ' : i === 2 ? '= ' : ''}
                      {r.label}
                    </dt>
                    <dd className={cn('tabular', i === 2 ? 'font-firs text-[24px] leading-none text-ink' : 'font-medium text-ink')}>{r.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[12px] text-ink-3">{trader.deposit.rules}</p>
            </Panel>

            <Panel n={2} title={trader.scale.title} text={trader.scale.text}>
              <div className="grid h-[180px] grid-cols-4 items-end gap-3">
                {trader.scale.ladder.map((step, i) => (
                  <div key={step.label} className="flex h-full flex-col justify-end">
                    <p className="font-firs tabular mb-2 text-[15px] leading-none text-ink sm:text-[17px]">{step.value}</p>
                    <div
                      data-rung
                      className={cn('chamfer-6 w-full origin-bottom', i === LADDER.length - 1 ? 'bg-gradient-to-t from-accent to-champagne' : 'bg-accent/30')}
                      style={{ height: `${LADDER[i] * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {trader.scale.ladder.map((step) => (
                  <p key={step.label} className="text-[11px] uppercase leading-snug tracking-[0.1em] text-ink-3">
                    {step.label}
                  </p>
                ))}
              </div>
            </Panel>

            <Panel n={3} title={trader.earn.title} text={trader.earn.text}>
              <div className="grid h-[180px] grid-cols-2 items-end gap-5">
                {[trader.earn.standard, trader.earn.boosted].map((bar, i) => (
                  <div key={bar.label} className="flex h-full flex-col justify-end">
                    <p className={cn('font-firs mb-2 leading-none', i === 1 ? 'text-gradient text-[32px]' : 'text-[22px] text-ink-2')}>{bar.value}</p>
                    <div
                      data-earn={i === 0 ? 'standard' : 'boosted'}
                      className={cn('chamfer-6 w-full origin-bottom', i === 1 ? 'bg-gradient-to-t from-accent to-champagne' : 'bg-ink-3/35')}
                      style={{ height: i === 1 ? '100%' : '36%' }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-5">
                <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">{trader.earn.standard.label}</p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">{trader.earn.boosted.label}</p>
              </div>
              <p className="mt-5 text-[13px] leading-snug text-ink-2">{trader.earn.note}</p>
            </Panel>
          </div>

          <p className="mt-6 text-[12px] text-ink-3">
            <Ph value={trader.disclosure} />
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(242, 238, 233, 0) 0%, rgba(242, 238, 233, 0.7) 60%, #F2EEE9 100%)' }}
      />
    </section>
  )
}
