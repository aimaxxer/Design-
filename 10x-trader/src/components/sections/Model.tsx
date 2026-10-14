import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import CountUp from '@/components/bits/CountUp'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cta, links, model } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/cn'

/** The framework's three angular card silhouettes, one per stat, plus where each card's text sits. */
const CARD_SHAPES = [
  {
    clip: 'polygon(64px 0, calc(100% - 14px) 0, calc(100% - 4px) 4px, 100% 14px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px), 0 64px)',
    offset: '',
    text: 'left-6 right-6 bottom-6',
  },
  {
    clip: 'polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 64px 100%, 0 calc(100% - 64px))',
    offset: 'lg:mt-24',
    text: 'left-6 bottom-20',
  },
  {
    clip: 'polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 64px), calc(100% - 64px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px))',
    offset: '',
    text: 'left-6 right-28 bottom-6',
  },
]

type Stat = (typeof model.stats)[number]

function StatCard({ stat, shape }: { stat: Stat; shape: (typeof CARD_SHAPES)[number] }) {
  return (
    <figure data-reveal className={cn('relative w-full', shape.offset)}>
      <div className="h-[280px] w-full sm:h-[340px]" style={{ clipPath: shape.clip, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '1.5px' }}>
        <div
          className="h-full w-full overflow-hidden bg-cover bg-center"
          style={{ clipPath: shape.clip, backgroundImage: `url(${asset(stat.image)})`, mixBlendMode: 'plus-darker' }}
        />
      </div>
      <figcaption className={cn('absolute', shape.text)}>
        <p className="font-firs text-gradient inline-block text-[36px] font-semibold leading-none sm:text-[52px]">
          {stat.prefix}
          <CountUp to={stat.count} duration={1.4} className="tabular" />
          {stat.suffix}
        </p>
        <p className="mt-3 max-w-[66%] text-[14px] leading-[1.4] text-navy">{stat.text}</p>
      </figcaption>
    </figure>
  )
}

/** The framework's "about" section: heading left, two paragraphs and a link right, three stat cards below. */
export function Model() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section id="model" ref={root} aria-labelledby="model-title" className="relative overflow-hidden bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 text-navy lg:flex-row lg:justify-between lg:gap-16">
          <div>
            <Eyebrow>{model.label}</Eyebrow>
            <h2
              id="model-title"
              className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]"
            >
              {model.title[0]}
              <br />
              {model.title[1]}
            </h2>
          </div>
          <div className="max-w-xl">
            {model.paragraphs.map((p, i) => (
              <p key={i} className={cn('text-[17px] leading-[1.5] sm:text-[18px]', i > 0 && 'mt-5')}>
                {p}
              </p>
            ))}
            <a href={model.link.href} className="group mt-6 inline-flex items-center gap-3 text-[14px] font-medium">
              {model.link.label}
              <span className="chamfer-8 grid size-8 place-items-center bg-navy p-px transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5">
                <span className="chamfer-8 grid h-full w-full place-items-center bg-frost transition-colors duration-200 group-hover:bg-white">
                  <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {model.stats.map((stat, i) => (
            <StatCard key={stat.text} stat={stat} shape={CARD_SHAPES[i]} />
          ))}
        </div>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(240, 245, 247, 0) 0%, rgba(240, 245, 247, 0.7) 60%, #F0F5F7 100%)' }}
      />
    </section>
  )
}
