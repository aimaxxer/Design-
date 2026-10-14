import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cta, links, proof } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { proofReady } from '@/lib/placeholders'

/** Community tiles point at the live channels once their links exist. */
const COMMUNITY_HREF: Record<string, string> = { '#whatsapp': links.whatsapp, '#discord': links.discord }

/** Traders, numbers, community. Never ships with "[...]" placeholders: until they are filled it renders nothing. */
export function Proof() {
  if (!proofReady) {
    if (import.meta.env.DEV) console.warn('[Proof] hidden: content.proof still has [placeholder] values.')
    return null
  }
  return <ProofSection />
}

function ProofSection() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="proof" ref={root} aria-labelledby="proof-title" className="relative bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-navy">
          <Eyebrow>{proof.label}</Eyebrow>
          <h2 id="proof-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]">
            {proof.title}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{proof.intro}</p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {proof.stats.map((stat) => (
            <li key={stat.text} data-reveal className="chamfer-16 bg-line p-px">
              <div className="chamfer-16 h-full bg-white p-6 sm:p-7">
                <p className="font-firs text-gradient tabular inline-block text-[40px] font-semibold uppercase leading-none sm:text-[52px]">{stat.value}</p>
                <p className="mt-3 text-[14px] leading-[1.45] text-navy">{stat.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-[12px] leading-[1.6] text-navy-3">{proof.verification}</p>
        <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {proof.testimonials.map((t) => (
            <li key={t.name} data-reveal className="chamfer-16 bg-line p-px">
              <figure className="chamfer-16 flex h-full flex-col bg-white p-6 sm:p-7">
                <blockquote className="flex-1 text-[15px] leading-[1.55] text-navy">{t.quote}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-5 text-[13px] leading-[1.5] text-navy-2">
                  <span className="block font-semibold text-navy">{t.name}</span>
                  {t.country} · on 10X since {t.since}
                  <span className="tabular mt-1 block text-accent">
                    {t.from} → {t.to} buying power
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {proof.community.map((tile) => (
            <li key={tile.title} data-reveal>
              <a href={COMMUNITY_HREF[tile.href] ?? tile.href} className="group chamfer-16 block h-full bg-line p-px">
                <span className="chamfer-16 flex h-full flex-col bg-white p-6 transition-colors duration-200 group-hover:bg-frost sm:p-7">
                  <span className="flex items-center justify-between gap-4 text-[16px] font-semibold text-navy">
                    {tile.title}
                    <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-2 text-[14px] leading-[1.5] text-navy-2">{tile.body}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
