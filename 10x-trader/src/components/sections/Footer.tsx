import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Chip } from '@/components/ui/Chip'
import { LazyCoin } from '@/components/ui/LazyCoin'
import { Logo } from '@/components/ui/Logo'
import { closing, cta, footer, links } from '@/content'
import { useReveal } from '@/hooks/useReveal'

/** Closing call to action with one last coin, then the legal footer from the live site. */
export function Footer() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <footer ref={root} className="relative overflow-hidden bg-mist px-6 pb-24 pt-20 text-navy sm:px-10 sm:pb-28 sm:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div data-reveal>
            <h2 className="font-firs text-[40px] font-normal leading-[0.95] tracking-[-0.03em] sm:text-[60px] lg:text-[76px]">
              {closing.title[0]}
              <br />
              <span className="text-gradient">{closing.title[1]}</span>
            </h2>
            <p className="mt-8 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{closing.body}</p>
            <ul aria-label="At a glance" className="mt-6 flex flex-wrap gap-2">
              {closing.bullets.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <ChamferButton href={links.signUp} size="md">
                {cta.primary}
              </ChamferButton>
              <ChamferButton href={links.whatsapp} size="md" variant="outline">
                {cta.whatsapp}
              </ChamferButton>
            </div>
          </div>
          <LazyCoin
            className="mx-auto size-[240px] sm:size-[320px] lg:size-[380px]"
            fill={0.82}
            finish="cutout"
            spinPeriod={20}
            tilt={12}
            seed={9}
            label={closing.coinLabel}
          />
        </div>

        <div className="mt-20 border-t border-line pt-10 sm:mt-24">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm shrink-0">
              <a href="#top" aria-label="10X Trader, back to top" className="inline-block">
                <Logo />
              </a>
              <p className="mt-4 text-[13px] leading-[1.6] text-navy-2">{footer.tagline}</p>
            </div>
            <nav aria-label={footer.legalTitle}>
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {footer.legal.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.12em] text-navy transition-colors duration-200 hover:text-accent"
                    >
                      {item.label}
                      <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3 opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <section aria-labelledby="disclaimer-title" className="mt-10">
            <h2 id="disclaimer-title" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy">
              {footer.disclaimerTitle}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-[12px] leading-[1.65] text-navy-3 lg:grid-cols-2 lg:gap-x-12">
              {footer.disclaimer.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </footer>
  )
}
