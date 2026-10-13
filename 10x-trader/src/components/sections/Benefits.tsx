import { useRef, useState } from 'react'
import { ChamferFrame } from '@/components/ui/ChamferFrame'
import { LazyCoin } from '@/components/ui/LazyCoin'
import type { TenXCoinHandle } from '@/coin/mount'
import { benefits, type Benefit } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

/** The framework's nomination card, as a toggle: picking one turns the coin and shows the full benefit. */
function BenefitCard({ item, active, onSelect }: { item: Benefit; active: boolean; onSelect: () => void }) {
  return (
    <li data-reveal className="w-full max-w-[20em]">
      <button
        type="button"
        aria-pressed={active}
        aria-controls="benefit-detail"
        onClick={onSelect}
        className="group relative flex h-[5em] w-full flex-col items-center justify-center px-6 text-center text-navy transition-transform duration-200 ease-[var(--ease-out-strong)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
      >
        <ChamferFrame active={active} />
        <span className="relative text-[13px] font-semibold">{item.title}</span>
        <span className="relative mt-0.5 text-[12px] font-normal opacity-80">{item.sub}</span>
      </button>
    </li>
  )
}

export function Benefits() {
  const root = useRef<HTMLElement>(null)
  const coin = useRef<TenXCoinHandle | null>(null)
  const all = [...benefits.left, ...benefits.right]
  const [selected, setSelected] = useState(all[0].id)
  const current = all.find((b) => b.id === selected) ?? all[0]
  useReveal(root)

  const select = (id: string) => {
    if (id === selected) return
    setSelected(id)
    coin.current?.spin(1, 1.6)
  }

  const column = (items: Benefit[], side: 'left' | 'right') => (
    <ul
      className={cn(
        'flex flex-col items-center gap-4 lg:mt-36',
        side === 'left' ? 'order-2 lg:order-1 lg:items-end' : 'order-3 lg:items-start',
      )}
    >
      {items.map((item) => (
        <BenefitCard key={item.id} item={item} active={item.id === selected} onSelect={() => select(item.id)} />
      ))}
    </ul>
  )

  return (
    <section id="features" ref={root} aria-labelledby="benefits-title" className="relative overflow-hidden bg-mist px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
        <div className="order-1 flex flex-col items-center text-center text-navy lg:order-2">
          <p className="text-[12px] uppercase tracking-[0.24em]">{benefits.label}</p>
          <h2 id="benefits-title" className="font-firs text-[44px] font-semibold uppercase leading-none tracking-tight sm:text-[54px]">
            {benefits.title}
          </h2>

          <LazyCoin
            className="mt-6 size-[220px] sm:mt-8 sm:size-[380px] lg:size-[460px]"
            fill={0.8}
            spinPeriod={18}
            tilt={-10}
            label={benefits.coinLabel}
            onReady={(h) => (coin.current = h)}
          />

          <div id="benefit-detail" aria-live="polite" className="mt-6 grid min-h-[7.5em] max-w-sm justify-items-center">
            <p key={current.id} className="animate-[detail-in_420ms_cubic-bezier(0.23,1,0.32,1)] text-[15px] leading-relaxed text-navy-2 motion-reduce:animate-none">
              <span className="mb-2 block text-[13px] font-semibold text-navy">{current.title}</span>
              {current.body}
            </p>
          </div>
        </div>

        {column(benefits.left, 'left')}
        {column(benefits.right, 'right')}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(240, 245, 247, 0) 0%, rgba(240, 245, 247, 0.7) 60%, #F0F5F7 100%)' }}
      />
    </section>
  )
}
