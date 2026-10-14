import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ArrowDown } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Chip } from '@/components/ui/Chip'
import { Logo } from '@/components/ui/Logo'
import { RollingAmount } from '@/components/ui/RollingAmount'
import { cta, hero, links } from '@/content'
import { formatUsd } from '@/lib/projection'

gsap.registerPlugin(useGSAP)

// three.js ships in its own chunk, so the headline paints before the coins arrive.
const TenXCoinRow = lazy(() => import('@/coin/TenXCoinRow').then((m) => ({ default: m.TenXCoinRow })))

/**
 * The framework's hero with the 10X coin row in place of the background video: the headline
 * sits in the upper half, six glass coins drift right to left through the lower half.
 */
/** How long each deposit holds before the next: the first waits for the entry, the top one lingers. */
const holdFor = (step: number, first: boolean) => (first ? 3200 : step === hero.amounts.length - 1 ? 3200 : 1900)

/** The headline as one sentence for screen readers, at the starting amount (the visual one keeps counting). */
const headline = `${hero.depositLabel} ${formatUsd(hero.amounts[0])}. ${hero.tradeLabel} ${formatUsd(hero.amounts[0] * 10)}.`

export function Hero() {
  const root = useRef<HTMLElement>(null)

  // The deposit counts up through hero.amounts and loops; the trade amount is always 10x.
  // Reduced motion keeps the starting amount.
  const [step, setStep] = useState(0)
  const firstHold = useRef(true)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => {
      firstHold.current = false
      setStep((s) => (s + 1) % hero.amounts.length)
    }, holdFor(step, firstHold.current))
    return () => window.clearTimeout(t)
  }, [step])
  const deposit = hero.amounts[step]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entry: the coins rise into the band, then the headline assembles above them.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('[data-hero-coins]', { autoAlpha: 0, y: 60, duration: 2.2 }, 0)
          .from('[data-hero-bar]', { autoAlpha: 0, y: -10, duration: 1 }, 0.2)
          .from('[data-hero-eyebrow]', { autoAlpha: 0, y: 14, duration: 1 }, 0.3)
          .from('[data-hero-line1]', { autoAlpha: 0, y: 28, filter: 'blur(10px)', duration: 1.4 }, 0.55)
          .from('[data-hero-line2]', { autoAlpha: 0, y: 28, filter: 'blur(10px)', duration: 1.4 }, 0.9)
          .from('[data-hero-sub]', { autoAlpha: 0, y: 16, duration: 1.1 }, 1.05)
          .from('[data-hero-cta] > *', { autoAlpha: 0, y: 12, duration: 1, stagger: 0.08 }, 1.2)
          .from('[data-hero-trust] > *', { autoAlpha: 0, y: 10, duration: 1, stagger: 0.06 }, 1.3)

        // Scroll: the copy lifts away faster than the coins, which gives the stage some depth.
        gsap.to('[data-hero-copy]', {
          yPercent: -18,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 40%', scrub: true },
        })
        gsap.to('[data-hero-coins]', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100dvh-24px)] flex-col overflow-hidden bg-frost sm:min-h-[calc(100dvh-40px)]"
    >
      {/* Light falls on the coin band from above; the top stays clean for the headline. */}
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(75%_55%_at_50%_82%,rgba(75,189,240,0.22),transparent_72%),linear-gradient(to_bottom,#f0f5f7_0%,#ffffff_48%,#e8f2f7_100%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/[0.02] via-transparent to-black/[0.05]" />

      <header data-hero-bar className="relative z-20 flex items-center justify-between gap-4 px-4 pt-5 text-navy sm:px-10 sm:pt-8">
        <a href="#top" aria-label="10X Trader, back to top">
          {/* The long tagline shows wherever the header has room for it beside the notch nav. */}
          <Logo taglineClassName="hidden md:block xl:hidden min-[1440px]:block" />
        </a>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href={links.logIn}
            className="hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em] text-navy transition-colors duration-200 hover:text-accent sm:inline sm:text-[11px] xl:hidden min-[1440px]:inline"
          >
            {cta.logIn}
          </a>
          <ChamferButton href={links.signUp}>{cta.primary}</ChamferButton>
        </div>
      </header>

      <div data-hero-copy className="relative z-10 flex flex-col items-center px-6 pt-14 text-center text-navy sm:pt-16 lg:pt-14">
        <p data-hero-eyebrow className="mb-6 text-[11px] font-medium uppercase tracking-[0.3em] opacity-90 sm:text-[12px]">
          {hero.eyebrow}
        </p>

        {/* Fluid size: "Trade with $100,000." fits one line from tablet up, and on phones each amount
            takes its own line, so the headline keeps its height while it counts. */}
        <h1
          id="hero-title"
          className="font-firs text-[clamp(48px,calc(10vw-12px),120px)] font-normal leading-[0.9] tracking-[-0.04em]"
        >
          <span className="sr-only">{headline}</span>
          <span aria-hidden data-hero-line1 className="block pb-[0.08em]">
            {hero.depositLabel} <span className="whitespace-nowrap max-sm:block"><RollingAmount value={deposit} />.</span>
          </span>
          <span aria-hidden data-hero-line2 className="block">
            {hero.tradeLabel}{' '}
            <span className="whitespace-nowrap max-sm:block">
              <RollingAmount value={deposit * 10} className="chamfer-em bg-accent px-[0.16em] text-white" />.
            </span>
          </span>
        </h1>

        <p
          data-hero-sub
          className="mt-8 max-w-2xl text-[12px] font-medium uppercase leading-[1.8] tracking-[0.22em] opacity-90 sm:text-[14px]"
        >
          {hero.sub}
        </p>

        <div data-hero-cta className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
          <a
            href="#process"
            className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-navy transition-colors duration-200 hover:text-accent sm:text-[12px]"
          >
            {hero.secondary}
            <ArrowDown
              aria-hidden
              strokeWidth={1.75}
              className="size-3.5 transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:translate-y-0.5"
            />
          </a>
        </div>

        <ul data-hero-trust aria-label="At a glance" className="mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
          {hero.trust.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </ul>
      </div>

      <div data-hero-coins className="relative -mt-4 min-h-[clamp(220px,34dvh,520px)] w-full flex-1 sm:-mt-6">
        {/* Absolutely placed so the canvas can never feed its own size back into the flexible band. */}
        <Suspense fallback={null}>
          <TenXCoinRow style={{ position: 'absolute', inset: 0 }} size={0.84} label={hero.coinsLabel} />
        </Suspense>
      </div>
    </section>
  )
}
