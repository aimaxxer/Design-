import { useRef } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { faq } from '@/content'
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
        </div>
      </div>
    </section>
  )
}
