import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ArrowDown } from 'lucide-react'
import { lazy, Suspense, useRef } from 'react'
import ShinyText from '@/components/bits/ShinyText'
import SplitText from '@/components/bits/SplitText'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Logo } from '@/components/ui/Logo'
import { cta, hero, links } from '@/content'

gsap.registerPlugin(useGSAP)

// three.js ships in its own chunk, so the headline paints before the coins arrive.
const TenXCoinRow = lazy(() => import('@/coin/TenXCoinRow').then((m) => ({ default: m.TenXCoinRow })))

/**
 * The framework's hero with the 10X coin row in place of the background video: the headline
 * sits in the upper half, six glass coins drift right to left through the lower half.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entry: the coins rise into the band, then the headline assembles above them.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('[data-hero-coins]', { autoAlpha: 0, y: 60, duration: 2.2 }, 0)
          .from('[data-hero-bar]', { autoAlpha: 0, y: -10, duration: 1 }, 0.2)
          .from('[data-hero-eyebrow]', { autoAlpha: 0, y: 14, duration: 1 }, 0.3)
          .from('[data-hero-line2]', { autoAlpha: 0, y: 28, filter: 'blur(10px)', duration: 1.4 }, 0.9)
          .from('[data-hero-sub]', { autoAlpha: 0, y: 16, duration: 1.1 }, 1.05)
          .from('[data-hero-cta] > *', { autoAlpha: 0, y: 12, duration: 1, stagger: 0.08 }, 1.2)

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
          <Logo />
        </a>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href={links.logIn}
            className="hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em] text-navy transition-colors duration-200 hover:text-accent sm:inline sm:text-[11px]"
          >
            {cta.logIn}
          </a>
          <ChamferButton href={links.signUp}>
            <span className="hidden sm:inline">{cta.primary}</span>
            <span className="sm:hidden">{cta.short}</span>
          </ChamferButton>
        </div>
      </header>

      <div data-hero-copy className="relative z-10 flex flex-col items-center px-6 pt-14 text-center text-navy sm:pt-16 lg:pt-14">
        <p data-hero-eyebrow className="mb-6 text-[11px] font-medium uppercase tracking-[0.3em] opacity-90 sm:text-[12px]">
          {hero.eyebrow}
        </p>

        <h1
          id="hero-title"
          className="font-firs text-[48px] font-normal leading-[0.9] tracking-[-0.04em] sm:text-[76px] lg:text-[100px] xl:text-[120px]"
        >
          <SplitText
            tag="span"
            text={hero.line1}
            splitType="chars"
            delay={36}
            duration={1.3}
            ease="expo.out"
            startDelay={0.5}
            from={{ opacity: 0, yPercent: 60, rotateX: -50 }}
            to={{ opacity: 1, yPercent: 0, rotateX: 0 }}
            className="block pb-[0.08em]"
          />
          <span data-hero-line2 className="block">
            <ShinyText text={hero.line2} color="#154359" shineColor="#4bbdf0" speed={2.8} delay={4} angle={110} />
          </span>
        </h1>

        <p
          data-hero-sub
          className="mt-8 max-w-md text-[12px] font-medium uppercase leading-[1.8] tracking-[0.22em] opacity-90 sm:text-[14px]"
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
