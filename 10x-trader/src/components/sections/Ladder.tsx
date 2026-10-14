import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cta, ladder, links } from '@/content'
import { useReveal } from '@/hooks/useReveal'

/** Where it goes: three rungs on one hairline, stacked on phones. */
export function Ladder() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="ladder" ref={root} aria-labelledby="ladder-title" className="relative bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-navy">
          <Eyebrow>{ladder.label}</Eyebrow>
          <h2 id="ladder-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]">
            {ladder.title}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{ladder.intro}</p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          {ladder.rungs.map((rung, i) => (
            <li key={rung.n} data-reveal className="relative flex gap-5 lg:flex-col lg:gap-0">
              {/* The hairline to the next rung: down the tiles on phones, across them on desktop. */}
              {i < ladder.rungs.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -bottom-10 left-5 top-10 w-px bg-[rgba(0,104,162,0.25)] lg:bottom-auto lg:left-10 lg:top-5 lg:h-px lg:w-[calc(100%+8px)]"
                />
              )}
              <span aria-hidden className="chamfer-8 relative grid size-10 shrink-0 place-items-center bg-[rgba(0,104,162,0.25)] p-px">
                <span className="chamfer-8 font-firs tabular grid h-full w-full place-items-center bg-white text-[18px] text-accent">{rung.n}</span>
              </span>
              <div className="lg:mt-6">
                <h3 className="text-[18px] font-semibold leading-snug text-navy">{rung.title}</h3>
                <p className="mt-3 max-w-[36ch] text-[15px] leading-[1.55] text-navy-2">{rung.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-[12px] leading-[1.6] text-navy-3">{ladder.note}</p>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
