import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ArrowDown } from 'lucide-react'
import { useRef } from 'react'
import ShinyText from '@/components/bits/ShinyText'
import SplitText from '@/components/bits/SplitText'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Logo } from '@/components/ui/Logo'
import { LoopVideo } from '@/components/ui/LoopVideo'
import { cta, hero } from '@/content'

gsap.registerPlugin(useGSAP)

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entry: the glass settles in, then the headline assembles on top of it.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('[data-hero-video]', { autoAlpha: 0, scale: 1.06, duration: 2.2, ease: 'power2.out' }, 0)
          .from('[data-hero-bar]', { autoAlpha: 0, y: -10, duration: 1 }, 0.3)
          .from('[data-hero-eyebrow]', { autoAlpha: 0, y: 14, duration: 1 }, 0.4)
          .from('[data-hero-line2]', { autoAlpha: 0, y: 28, filter: 'blur(10px)', duration: 1.4 }, 1.0)
          .from('[data-hero-sub]', { autoAlpha: 0, y: 16, duration: 1.1 }, 1.15)
          .from('[data-hero-cta] > *', { autoAlpha: 0, y: 12, duration: 1, stagger: 0.08 }, 1.3)

        // Scroll: the copy lifts away faster than the glass, which gives the stage some depth.
        gsap.to('[data-hero-copy]', {
          yPercent: -14,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 35%', scrub: true },
        })
        gsap.to('[data-hero-parallax]', {
          yPercent: 8,
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
      <div data-hero-parallax className="absolute inset-0">
        <div data-hero-video className="absolute inset-0">
          <LoopVideo name="hero" mobileName="hero-sm" eager className="media-warm h-full w-full object-cover" />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      {/* A soft veil behind the copy keeps the espresso type above 7:1 where the glass ribbons cross it. */}
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(58%_50%_at_50%_52%,rgba(248,246,242,0.82),rgba(248,246,242,0.45)_55%,transparent_82%)]"
      />

      <header data-hero-bar className="relative z-20 flex items-center justify-between px-4 pt-5 text-white sm:px-10 sm:pt-8">
        <a href="#top" aria-label="10X Affiliation, back to top" className="drop-shadow-[0_1px_8px_rgba(28,25,22,0.35)]">
          <Logo />
        </a>
        <ChamferButton href="#apply" data-move-focus>
          <span className="hidden sm:inline">{cta.primary}</span>
          <span className="sm:hidden">{cta.short}</span>
        </ChamferButton>
      </header>

      <div
        data-hero-copy
        className="relative z-10 flex flex-1 flex-col items-center px-6 pb-24 pt-24 text-center text-ink sm:pt-32 lg:pt-36"
      >
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
            delay={40}
            duration={1.3}
            ease="expo.out"
            startDelay={0.6}
            from={{ opacity: 0, yPercent: 60, rotateX: -50 }}
            to={{ opacity: 1, yPercent: 0, rotateX: 0 }}
            className="block pb-[0.08em]"
          />
          <span data-hero-line2 className="block">
            <ShinyText text={hero.line2} color="#1c1916" shineColor="#c8b08e" speed={2.8} delay={4} angle={110} />
          </span>
        </h1>

        <p
          data-hero-sub
          className="mt-8 max-w-md text-[12px] font-medium uppercase leading-[1.8] tracking-[0.22em] opacity-90 sm:text-[14px]"
        >
          {hero.sub}
        </p>

        <div data-hero-cta className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <ChamferButton href="#apply" data-move-focus size="md">
            {cta.primary}
          </ChamferButton>
          <a
            href="#problems"
            className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 hover:text-accent sm:text-[12px]"
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
    </section>
  )
}
