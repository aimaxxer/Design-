import { useRef } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { faq, links } from '@/content'
import { useReveal } from '@/hooks/useReveal'

export function Faq() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="faq" ref={root} aria-labelledby="faq-title" className="relative bg-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <h2
          id="faq-title"
          className="font-firs self-start text-[36px] font-semibold uppercase leading-[0.95] tracking-tight text-navy sm:text-[48px] lg:sticky lg:top-24 lg:text-[54px]"
        >
          {faq.title[0]}
          <br />
          {faq.title[1]}
        </h2>
        <div data-reveal>
          <Accordion items={faq.items} defaultOpen={faq.items[0].id} />
          <p className="mt-8 text-[15px] leading-relaxed text-navy-2">
            {faq.outro.split(/(WhatsApp|Discord)/).map((part, i) =>
              part === 'WhatsApp' || part === 'Discord' ? (
                <a
                  key={i}
                  href={part === 'WhatsApp' ? links.whatsapp : links.discord}
                  className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors duration-200 hover:text-navy"
                >
                  {part}
                </a>
              ) : (
                part
              ),
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
