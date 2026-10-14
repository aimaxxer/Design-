import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cta, links, problem } from '@/content'
import { useReveal } from '@/hooks/useReveal'

/**
 * The reader's own story told back to them: five numbered steps beside a sticky bridge line,
 * then the "built against you / built for you" block that hands over to the aligned model.
 */
export function Problem() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="problem" ref={root} aria-labelledby="problem-title" className="relative bg-white px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-navy">
          <Eyebrow>{problem.label}</Eyebrow>
          <h2
            id="problem-title"
            className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]"
          >
            {problem.title}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{problem.intro}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <ol className="divide-y divide-line border-y border-line">
            {problem.steps.map((step) => (
              <li key={step.n} data-reveal className="flex gap-5 py-6 sm:gap-6">
                <span aria-hidden className="chamfer-8 grid size-10 shrink-0 place-items-center bg-line p-px">
                  <span className="chamfer-8 font-firs tabular grid h-full w-full place-items-center bg-frost text-[18px] text-accent">{step.n}</span>
                </span>
                <div>
                  <h3 className="text-[18px] font-semibold leading-snug text-navy">{step.title}</h3>
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55] text-navy-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="self-start lg:sticky lg:top-24">
            <div data-reveal className="chamfer-24 bg-[rgba(0,104,162,0.25)] p-px">
              <p className="chamfer-24 font-firs bg-frost p-8 text-[28px] leading-[1.15] tracking-[-0.02em] text-navy sm:p-10 sm:text-[36px]">
                {problem.bridge}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:gap-5">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-navy">{problem.against.label}</p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {problem.against.cards.map((card) => (
                <div key={card.title} data-reveal className="chamfer-16 h-full bg-line p-px">
                  <article className="chamfer-16 h-full bg-white p-6 sm:p-7">
                    <h3 className="text-[18px] font-semibold leading-snug text-navy">{card.title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.55] text-navy-2">{card.body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-accent">{problem.forYou.label}</p>
            <div data-reveal className="chamfer-16 mt-5 bg-accent/60 p-px">
              <article className="chamfer-16 relative bg-frost p-6 sm:p-7">
                <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-accent" />
                <h3 className="text-[18px] font-semibold leading-snug text-navy">{problem.forYou.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-navy-2">{problem.forYou.body}</p>
                <a href={problem.forYou.link.href} className="group mt-6 inline-flex items-center gap-3 text-[14px] font-medium text-navy">
                  {problem.forYou.link.label}
                  <span className="chamfer-8 grid size-8 place-items-center bg-navy p-px transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5">
                    <span className="chamfer-8 grid h-full w-full place-items-center bg-frost transition-colors duration-200 group-hover:bg-white">
                      <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
                    </span>
                  </span>
                </a>
              </article>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
