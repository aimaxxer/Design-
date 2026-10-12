import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import CountUp from '@/components/bits/CountUp'
import { Ph } from '@/components/ui/Ph'
import { partnerKit, proof, results, type KitBlock } from '@/content'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/cn'

/** The template's three angular card silhouettes, one per stat, plus where each card's text sits. */
const CARD_SHAPES = [
  {
    clip: 'polygon(64px 0, calc(100% - 14px) 0, calc(100% - 4px) 4px, 100% 14px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px), 0 64px)',
    offset: '',
    text: 'left-6 right-6 bottom-6',
  },
  {
    clip: 'polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 64px 100%, 0 calc(100% - 64px))',
    offset: 'lg:mt-24',
    text: 'left-6 bottom-20',
  },
  {
    clip: 'polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 64px), calc(100% - 64px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px))',
    offset: '',
    text: 'left-6 right-28 bottom-6',
  },
]

type Stat = (typeof results.stats)[number]

function StatValue({ stat }: { stat: Stat }) {
  if ('display' in stat) return <>{stat.display}</>
  return (
    <>
      {stat.prefix}
      <CountUp to={stat.count} duration={1.6} className="tabular" />
      {stat.suffix}
    </>
  )
}

function StatCard({ stat, shape }: { stat: Stat; shape: (typeof CARD_SHAPES)[number] }) {
  return (
    <figure data-stat-card className={cn('relative w-full', shape.offset)}>
      <div className="h-[280px] w-full sm:h-[340px]" style={{ clipPath: shape.clip, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '1.5px' }}>
        <div
          data-stat-img
          className="h-full w-full overflow-hidden bg-cover bg-center"
          style={{ clipPath: shape.clip, backgroundImage: `url(${asset(stat.image)})`, mixBlendMode: 'plus-darker' }}
        />
      </div>
      <figcaption className={cn('absolute', shape.text)}>
        <p className="font-firs text-gradient inline-block text-[36px] font-semibold uppercase leading-none sm:text-[52px]">
          <StatValue stat={stat} />
        </p>
        <p className="mt-3 max-w-[66%] text-[14px] leading-[1.4] text-navy">{stat.text}</p>
      </figcaption>
    </figure>
  )
}

/* ---------------------------------- Partner kit visuals ---------------------------------- */

const EARNING_TONES = ['bg-navy-3/45', 'bg-teal', 'bg-sky']
const EARNING_SHARES = [18000, 7200, 6300]

/** Same 16:9 chamfered frame as the photos, so data cells and photo cells line up in the bento. */
function Frame({ children }: { children: ReactNode }) {
  return <div className="chamfer-16 flex aspect-[16/9] flex-col justify-center bg-frost px-5 py-6 sm:px-8">{children}</div>
}

function EarningsVisual() {
  const total = EARNING_SHARES.reduce((a, b) => a + b, 0)
  return (
    <figure>
      <Frame>
      <p className="text-[11px] uppercase tracking-[0.14em] text-navy-3">{partnerKit.earningsTotalLabel}</p>
      <p className="font-firs tabular mt-2 text-[40px] leading-none text-navy sm:text-[52px]">{partnerKit.earningsTotal}</p>
      <div className="mt-6 flex h-3 w-full gap-1">
        {EARNING_SHARES.map((v, i) => (
          <span
            key={i}
            data-kit-bar
            className={cn('chamfer-6 h-full origin-left', EARNING_TONES[i])}
            style={{ width: `${(v / total) * 100}%` }}
          />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {partnerKit.earnings.map((e, i) => (
          <div key={e.label}>
            <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-navy-3">
              <span aria-hidden className={cn('size-2 shrink-0', EARNING_TONES[i])} />
              {e.label}
            </dt>
            <dd className="font-firs tabular mt-1.5 text-[18px] leading-none text-navy sm:text-[22px]">{e.amount}</dd>
          </div>
        ))}
      </dl>
      </Frame>
      <figcaption className="mt-4 text-[12px] text-navy-3">{partnerKit.earningsCaption}</figcaption>
    </figure>
  )
}

function PhotoVisual({ src, alt, caption, children }: { src: string; alt: string; caption: string; children?: ReactNode }) {
  return (
    <figure>
      <div className="chamfer-16 relative aspect-[16/9] overflow-hidden bg-frost">
        <img
          src={asset(src)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-strong)] [@media(hover:hover)]:group-hover:scale-[1.03]"
        />
      </div>
      {children}
      <figcaption className="mt-3 text-[12px] text-navy-3">{caption}</figcaption>
    </figure>
  )
}

function FunnelVisual() {
  return (
    <figure>
      <Frame>
      <div className="space-y-3">
        {partnerKit.funnel.map((f, i) => (
          <div key={f.label} className="flex items-center gap-4">
            <span className="w-[76px] shrink-0 text-[11px] uppercase tracking-[0.14em] text-navy-3">{f.label}</span>
            <span
              data-kit-bar
              className={cn('chamfer-6 h-9 origin-left', i === 2 ? 'bg-teal' : 'bg-teal/25')}
              style={{ width: `calc(${f.width * 100}% - 92px)` }}
            />
          </div>
        ))}
      </div>
      <p className="font-firs mt-5 text-[26px] leading-none text-navy sm:text-[32px]">{partnerKit.funnelResult} <span className="text-[15px] text-navy-2">{partnerKit.funnelResultLabel}</span></p>
      </Frame>
      <figcaption className="mt-4 text-[12px] text-navy-3">{partnerKit.funnelCaption}</figcaption>
    </figure>
  )
}

function KitVisual({ id }: { id: KitBlock['id'] }) {
  if (id === 'earn') return <EarningsVisual />
  if (id === 'convert') return <FunnelVisual />
  if (id === 'attract') return <PhotoVisual src={partnerKit.ugcImage} alt={partnerKit.ugcAlt} caption={partnerKit.ugcCaption} />
  return (
    <PhotoVisual src={partnerKit.traderImage} alt={partnerKit.traderAlt} caption={partnerKit.traderCaption}>
      <dl className="mt-4 flex gap-8">
        {partnerKit.traderStats.map((s) => (
          <div key={s.label}>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-navy-3">{s.label}</dt>
            <dd className="font-firs tabular mt-1.5 text-[22px] leading-none text-navy">{s.value}</dd>
          </div>
        ))}
      </dl>
    </PhotoVisual>
  )
}

/** Bento rhythm: wide, narrow / narrow, wide. */
const KIT_SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7']

function KitCell({ block, index }: { block: KitBlock; index: number }) {
  return (
    <article data-kit-cell className={cn('group chamfer-24 bg-line p-px', KIT_SPANS[index])}>
      <div className="chamfer-24 flex h-full flex-col gap-8 bg-white p-6 sm:p-8">
        <KitVisual id={block.id} />
        <div className="mt-auto">
          <h4 className="font-firs text-[24px] leading-tight text-navy sm:text-[28px]">{block.title}</h4>
          <p className="mt-1.5 text-[15px] text-navy-2">{block.text}</p>
          <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-3">
            {block.items.map(([t, d]) => (
              <li key={t} className="border-t border-line pt-3">
                <p className="text-[14px] font-semibold text-navy">{t}</p>
                <p className="mt-1 text-[13px] leading-snug text-navy-2">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

/* ----------------------------------------- Proof ----------------------------------------- */

function ProofCard({ item }: { item: (typeof proof.videos)[number] }) {
  return (
    <figure data-proof-card className="flex flex-col">
      <div className="chamfer-16 relative aspect-[16/10] overflow-hidden bg-frost">
        {item.video ? (
          <video controls preload="none" poster={asset(item.image)} className="h-full w-full object-cover">
            <source src={asset(item.video)} type="video/mp4" />
          </video>
        ) : (
          <img src={asset(item.image)} alt={item.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        )}
      </div>
      <figcaption className="mt-4">
        <p className="text-[14px] font-semibold text-navy">
          <Ph value={item.name} /> <span className="font-normal text-navy-3">/</span> <Ph value={item.meta} />
        </p>
        <p className="mt-1 text-[14px] leading-snug text-navy-2">
          <Ph value={item.quote} />
        </p>
      </figcaption>
    </figure>
  )
}

export function Results() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const reveal = (targets: string, trigger: string, vars: gsap.TweenVars = {}) =>
          gsap.from(targets, {
            autoAlpha: 0,
            y: 24,
            duration: 1.1,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: { trigger, start: 'top 84%', once: true },
            ...vars,
          })
        reveal('[data-results-copy] > *', '[data-results-copy]')
        reveal('[data-stat-card]', '[data-stat-grid]', { y: 48, duration: 1.3, stagger: 0.12 })
        gsap.from('[data-stat-img]', {
          scale: 1.14,
          duration: 1.8,
          stagger: 0.12,
          ease: 'expo.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: '[data-stat-grid]', start: 'top 84%', once: true },
        })
        reveal('[data-kit-head] > *', '[data-kit-head]')
        gsap.utils.toArray<HTMLElement>('[data-kit-cell]').forEach((cell) => {
          gsap.from(cell, { autoAlpha: 0, y: 32, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: cell, start: 'top 88%', once: true } })
          // Bars draw in from the left: the numbers they stand for land a beat later.
          const bars = cell.querySelectorAll('[data-kit-bar]')
          if (bars.length)
            gsap.from(bars, {
              scaleX: 0,
              duration: 1.1,
              stagger: 0.12,
              ease: 'expo.out',
              delay: 0.25,
              scrollTrigger: { trigger: cell, start: 'top 80%', once: true },
            })
        })
        reveal('[data-proof-head] > *', '[data-proof-head]')
        reveal('[data-proof-card], [data-proof-result]', '[data-proof-grid]', { stagger: 0.1 })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="results" ref={root} aria-labelledby="results-title" className="relative overflow-hidden bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto max-w-7xl">
        {/* Template's founders row: heading left, copy right. */}
        <div data-results-copy className="flex flex-col gap-8 text-navy lg:flex-row lg:items-start lg:justify-between">
          <h2 id="results-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]">
            {results.titleLine1}
            <br />
            {results.titleLine2}
          </h2>
          <div className="max-w-xl">
            {results.paragraphs.map((p, i) => (
              <p key={i} className={cn('text-[17px] leading-[1.5] sm:text-[18px]', i > 0 && 'mt-5')}>
                {p}
              </p>
            ))}
            <a
              href={results.link.href}
              className="group mt-6 inline-flex items-center gap-3 text-[14px] font-medium transition-transform duration-200 ease-[var(--ease-out-strong)] hover:-translate-y-0.5"
            >
              {results.link.label}
              <span aria-hidden className="chamfer-8 grid size-8 place-items-center bg-navy p-px">
                <span className="chamfer-8 grid h-full w-full place-items-center bg-frost transition-colors duration-200 group-hover:bg-white">
                  <ArrowUpRight strokeWidth={1.75} className="size-3.5" />
                </span>
              </span>
            </a>
          </div>
        </div>

        <div data-stat-grid className="mt-14 grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.stats.map((stat, i) => (
            <StatCard key={i} stat={stat} shape={CARD_SHAPES[i]} />
          ))}
        </div>

        {/* What you get as a partner */}
        <div className="mt-24 sm:mt-32">
          <div data-kit-head className="max-w-2xl text-navy">
            <h3 className="font-firs text-[30px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[40px]">{partnerKit.title}</h3>
            <p className="mt-4 text-[17px] leading-[1.5] text-navy-2">{partnerKit.intro}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {partnerKit.blocks.map((b, i) => (
              <KitCell key={b.id} block={b} index={i} />
            ))}
          </div>
          <p className="mt-6 text-[13px] text-navy-3">{partnerKit.footnote}</p>
        </div>

        {/* Proof */}
        <div className="mt-24 sm:mt-32">
          <div data-proof-head className="text-navy">
            <h3 className="font-firs text-[30px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[40px]">{proof.title}</h3>
            <p className="mt-4 text-[17px] leading-[1.5] text-navy-2">{proof.sub}</p>
          </div>
          <div data-proof-grid className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3">
            {proof.videos.map((v, i) => (
              <ProofCard key={i} item={v} />
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {proof.results.map((r, i) => (
              <div key={i} data-proof-result className="border-t border-line-strong pt-5">
                <dt className="font-firs text-[26px] leading-tight text-navy sm:text-[32px]">
                  <Ph value={r.value} />
                </dt>
                <dd className="mt-2 text-[14px] text-navy-2">
                  <Ph value={r.label} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(240, 240, 240, 0) 0%, rgba(240, 240, 240, 0.7) 60%, #F0F0F0 100%)' }}
      />
    </section>
  )
}
