import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Check, MessageCircle } from 'lucide-react'
import { useRef } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Logo } from '@/components/ui/Logo'
import { Ph } from '@/components/ui/Ph'
import { apply, cta, faq, finalCta, footer, links } from '@/content'
import { asset } from '@/lib/asset'
import { Qualifier } from './Qualifier'

const SHOW_PLACEHOLDERS = import.meta.env.DEV

function Badges({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((b) => (
        <li key={b} className="flex items-center gap-2 text-[13px] text-navy-2">
          <Check aria-hidden strokeWidth={2} className="size-3.5 text-teal" />
          {b}
        </li>
      ))}
    </ul>
  )
}

/** WhatsApp only renders once links.whatsapp is set; the dev server shows where it will go. */
function WhatsAppButton() {
  if (links.whatsapp)
    return (
      <ChamferButton href={links.whatsapp} target="_blank" rel="noreferrer" variant="outline" size="md" icon={<MessageCircle aria-hidden strokeWidth={1.75} className="size-3.5" />}>
        {cta.whatsapp}
      </ChamferButton>
    )
  if (!SHOW_PLACEHOLDERS) return null
  return (
    <span
      title="Placeholder: set links.whatsapp in src/content.ts"
      className="chamfer-10 inline-flex items-center gap-2 border border-dashed border-warn/70 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-navy-3 sm:text-[12px]"
    >
      <MessageCircle aria-hidden strokeWidth={1.75} className="size-3.5" />
      {cta.whatsapp}
    </span>
  )
}

export function Apply() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-apply-intro] > *', {
          autoAlpha: 0,
          y: 24,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-apply-intro]', start: 'top 84%', once: true },
        })
        gsap.from('[data-apply-form]', {
          autoAlpha: 0,
          y: 40,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-apply-form]', start: 'top 88%', once: true },
        })
        gsap.from('[data-final]', {
          autoAlpha: 0,
          y: 40,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-final]', start: 'top 88%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="apply" ref={root} tabIndex={-1} aria-labelledby="apply-title" className="relative overflow-hidden bg-mist outline-none">
      <div className="relative z-20 mx-auto max-w-7xl px-6 pb-12 pt-20 sm:px-10 sm:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div data-apply-intro className="text-navy lg:col-span-5 lg:pt-2">
            <h2 id="apply-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[44px] lg:text-[42px] xl:text-[48px]">
              {apply.titleLine1}
              <br />
              <span className="text-teal">{apply.titleLine2}</span>
            </h2>

            <ol className="relative mt-10 space-y-7 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-line-strong">
              {apply.steps.map((s, i) => (
                <li key={s.title} className="relative flex gap-5">
                  <span className="chamfer-6 relative grid size-8 shrink-0 place-items-center bg-navy text-[12px] font-medium text-white tabular">{i + 1}</span>
                  <div className="pt-1">
                    <p className="text-[16px] font-semibold">{s.title}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-navy-2">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <Badges items={apply.badges} />
            </div>
          </div>

          <div data-apply-form className="lg:col-span-7">
            <Qualifier />
          </div>
        </div>

        <div id="faq" className="mt-24 grid scroll-mt-8 grid-cols-1 gap-8 sm:mt-32 lg:grid-cols-12 lg:gap-16">
          <div className="text-navy lg:col-span-4">
            <h2 className="font-firs text-[32px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[40px]">{faq.title}</h2>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-navy-2">{faq.sub}</p>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faq.items.map((f, i) => ({ id: `q${i}`, q: f.q, a: f.a }))} defaultOpen="q0" />
          </div>
        </div>

        {/* Final call to action: the hero's glass returns as a bookend. */}
        <div data-final className="chamfer-24 relative mt-24 overflow-hidden bg-frost sm:mt-32">
          <img
            src={asset('/videos/posters/hero.webp')}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover opacity-70"
          />
          <div aria-hidden className="absolute inset-0 [background:radial-gradient(60%_70%_at_50%_50%,rgba(240,245,247,0.94),rgba(240,245,247,0.6)_70%,rgba(240,245,247,0.3))]" />
          <div className="relative flex flex-col items-center px-6 py-16 text-center text-navy sm:px-10 sm:py-24">
            <h2 className="font-firs text-[34px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[56px]">
              {finalCta.titleLine1}
              <br />
              <span className="text-teal">{finalCta.titleLine2}</span>
            </h2>
            <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-navy-2 sm:text-[17px]">{finalCta.text}</p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <ChamferButton href="#apply" data-move-focus size="md">
                {cta.primary}
              </ChamferButton>
              <WhatsAppButton />
            </div>
            <div className="mt-8">
              <Badges items={finalCta.badges} />
            </div>
          </div>
        </div>

        <footer className="mt-20 border-t border-line-strong pt-10 sm:mt-24">
          <div className="flex flex-col gap-8 text-navy sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-[13px] leading-relaxed text-navy-2">{footer.blurb}</p>
            </div>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
              {footer.links.map((l) => (
                <a key={l.label} href={l.href} className="text-[13px] text-navy-2 underline-offset-4 transition-colors hover:text-navy hover:underline">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="mt-8 max-w-[90ch] text-[12px] leading-relaxed text-navy-3">
            {footer.disclaimer} <Ph value={footer.risk} />
          </p>
          <p className="mt-4 pb-12 text-[12px] text-navy-3 sm:pb-6">{footer.copyright}</p>
        </footer>
      </div>
    </section>
  )
}
