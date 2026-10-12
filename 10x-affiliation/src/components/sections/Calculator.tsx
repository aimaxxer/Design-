import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Calculator as CalcIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { brokers, calculator, cta } from '@/content'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/cn'
import { estimate, lastEstimate, usd } from '@/lib/estimate'

const { min: MIN, max: MAX } = calculator.lots
const STEPS = 1000

/** The slider is logarithmic, so 500 lots and 100k lots are both easy to hit. */
const toLots = (pos: number) => {
  const raw = MIN * Math.pow(MAX / MIN, pos / STEPS)
  const step = raw < 2_000 ? 50 : raw < 10_000 ? 100 : raw < 50_000 ? 500 : 1_000
  return Math.min(MAX, Math.max(MIN, Math.round(raw / step) * step))
}
const toPos = (lots: number) => Math.round((STEPS * Math.log(lots / MIN)) / Math.log(MAX / MIN))
const TICKS = [500, 2_000, 10_000, 50_000, 100_000]
/** Ticks that would collide on a phone-width track. */
const DESKTOP_ONLY_TICKS = new Set([2_000, 50_000])
const short = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n))
const plusUsd = (n: number) => '+' + usd(n)

function Row({ n, label, hint, children, htmlFor }: { n: number; label: string; hint: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 py-7 first:pt-0 last:pb-0 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-x-4">
      <span aria-hidden className="chamfer-6 grid size-8 place-items-center bg-ink text-[12px] font-medium text-white tabular">
        {n}
      </span>
      <div>
        <label htmlFor={htmlFor} className="block text-[16px] font-semibold text-ink">
          {label}
        </label>
        <p className="mt-0.5 text-[13px] text-ink-3">{hint}</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function Calculator() {
  const root = useRef<HTMLElement>(null)
  const uid = useId().replace(/:/g, '')
  const [lots, setLots] = useState<number>(calculator.lots.initial)
  const [lotsText, setLotsText] = useState<string>(calculator.lots.initial.toLocaleString('en-US'))
  const [rateText, setRateText] = useState('')
  const [withTrader, setWithTrader] = useState(false)

  const parsed = parseFloat(rateText.replace(',', '.'))
  const rateValid = parsed > 0 && parsed <= calculator.rate.max
  const rateError = rateText.trim() !== '' && !rateValid
  const result = useMemo(() => estimate(lots, rateValid ? parsed : null, withTrader), [lots, parsed, rateValid, withTrader])

  useEffect(() => {
    lastEstimate.set(rateValid ? result : null)
  }, [result, rateValid])

  const setFromSlider = (pos: number) => {
    const next = toLots(pos)
    setLots(next)
    setLotsText(next.toLocaleString('en-US'))
  }
  const commitLotsText = () => {
    const n = parseInt(lotsText.replace(/[^\d]/g, ''), 10)
    const next = Number.isFinite(n) ? Math.min(MAX, Math.max(MIN, n)) : lots
    setLots(next)
    setLotsText(next.toLocaleString('en-US'))
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-calc-head] > *', {
          autoAlpha: 0,
          y: 24,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-calc-head]', start: 'top 85%', once: true },
        })
        gsap.from('[data-calc-panel]', {
          autoAlpha: 0,
          y: 40,
          duration: 1.3,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-calc-grid]', start: 'top 85%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const pos = toPos(lots)
  const share = (v: number) => (result.total ? `${(v / result.total) * 100}%` : '0%')

  return (
    <section id="calculator" ref={root} aria-labelledby="calc-title" className="relative overflow-hidden bg-mist px-6 py-20 sm:px-10 sm:py-28">
      <div className="relative z-20 mx-auto max-w-7xl">
        <div data-calc-head className="max-w-3xl text-ink">
          <h2 id="calc-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]">
            {calculator.titleLine1}
            <br />
            {calculator.titleLine2}
          </h2>
          <p className="mt-5 text-[17px] leading-[1.5] text-ink-2 sm:text-[18px]">{calculator.sub}</p>
        </div>

        <div data-calc-grid className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Inputs */}
          <div data-calc-panel className="chamfer-24 bg-line p-px lg:col-span-7">
            <div className="chamfer-24 h-full divide-y divide-line bg-white px-5 py-8 sm:px-10 sm:py-10">
              <Row n={1} label={calculator.lots.label} hint={calculator.lots.hint} htmlFor={`${uid}-lots`}>
                <div className="flex items-baseline gap-2">
                  <input
                    id={`${uid}-lots`}
                    inputMode="numeric"
                    autoComplete="off"
                    value={lotsText}
                    onChange={(e) => setLotsText(e.target.value)}
                    onBlur={commitLotsText}
                    onKeyDown={(e) => e.key === 'Enter' && commitLotsText()}
                    className="font-firs tabular w-[5.5ch] min-w-0 border-b border-line-strong bg-transparent pb-1 text-[34px] leading-none text-ink outline-none transition-colors focus:border-accent sm:text-[40px]"
                  />
                  <span className="whitespace-nowrap text-[14px] text-ink-2">lots / month</span>
                </div>
                <input
                  type="range"
                  aria-label="Monthly volume in lots"
                  aria-valuetext={`${lots.toLocaleString('en-US')} lots`}
                  min={0}
                  max={STEPS}
                  value={pos}
                  onChange={(e) => setFromSlider(Number(e.target.value))}
                  className="range mt-5 w-full"
                  style={{ ['--fill' as string]: `${(pos / STEPS) * 100}%` }}
                />
                <div aria-hidden className="relative mt-1 h-4 text-[11px] text-ink-3 tabular">
                  {TICKS.map((t, i) => (
                    <span
                      key={t}
                      className={cn(
                        'absolute',
                        i === 0 ? 'left-0' : i === TICKS.length - 1 ? 'right-0' : '-translate-x-1/2',
                        DESKTOP_ONLY_TICKS.has(t) && 'hidden sm:inline',
                      )}
                      style={i === 0 || i === TICKS.length - 1 ? undefined : { left: `${(toPos(t) / STEPS) * 100}%` }}
                    >
                      {short(t)}
                    </span>
                  ))}
                </div>
              </Row>

              <Row n={2} label={calculator.rate.label} hint={calculator.rate.hint} htmlFor={`${uid}-rate`}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'chamfer-8 flex h-14 w-[150px] items-center p-px transition-colors sm:w-[180px]',
                      rateError ? 'bg-neg' : 'bg-line-strong focus-within:bg-accent',
                    )}
                  >
                    <div className="chamfer-8 flex h-full w-full items-center bg-white pl-4">
                      <span aria-hidden className="font-firs text-[22px] text-ink-3">
                        $
                      </span>
                      <input
                        id={`${uid}-rate`}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min={0}
                        max={calculator.rate.max}
                        placeholder={calculator.rate.placeholder}
                        value={rateText}
                        onChange={(e) => setRateText(e.target.value)}
                        aria-invalid={rateError || undefined}
                        aria-describedby={rateError ? `${uid}-rate-error` : undefined}
                        className="font-firs tabular h-full w-full bg-transparent px-2 text-[22px] text-ink outline-none placeholder:text-[16px] placeholder:text-ink-3"
                      />
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[14px] text-ink-2">per lot</span>
                </div>
                {rateError && (
                  <p id={`${uid}-rate-error`} className="mt-2 text-[12px] text-neg">
                    {calculator.invalidRate}
                  </p>
                )}
              </Row>

              <Row n={3} label={calculator.trader.label} hint={calculator.trader.hint}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={withTrader}
                  aria-label={calculator.trader.label}
                  onClick={() => setWithTrader((v) => !v)}
                  className={cn(
                    'chamfer-10 group flex w-full max-w-[360px] items-center justify-between gap-4 p-px transition-colors duration-200',
                    withTrader ? 'bg-accent' : 'bg-line-strong hover:bg-line-hover',
                  )}
                >
                  <span
                    className={cn(
                      'chamfer-10 flex w-full items-center justify-between gap-3 px-3.5 py-3.5 transition-colors duration-200 sm:gap-4 sm:px-4',
                      withTrader ? 'bg-tint' : 'bg-white',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5 text-left sm:gap-3">
                      <span className="whitespace-nowrap text-[14px] font-semibold text-ink">10X Trader</span>
                      <span className="chamfer-6 hidden bg-ink px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white min-[420px]:inline-block">
                        {calculator.trader.badge}
                      </span>
                    </span>
                    {/* Track + knob */}
                    <span aria-hidden className={cn('relative h-6 w-11 shrink-0 transition-colors duration-200', withTrader ? 'bg-accent' : 'bg-line-strong')}>
                      <span
                        className={cn(
                          'absolute left-0.5 top-0.5 size-5 bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-out-strong)]',
                          withTrader && 'translate-x-5',
                        )}
                      />
                    </span>
                  </span>
                </button>
              </Row>
            </div>
          </div>

          {/* Result */}
          <div data-calc-panel className="chamfer-24 bg-line p-px lg:col-span-5">
            <div className="chamfer-24 flex h-full flex-col bg-white px-5 py-8 sm:px-10 sm:py-10" aria-live="polite">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-3">{calculator.result.title}</h3>

              {rateValid ? (
                <>
                  <dl className="mt-6 space-y-3 text-[15px]">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="flex items-center gap-2.5 text-ink-2">
                        <span aria-hidden className="size-2.5 bg-ink-3/45" />
                        {calculator.result.now}
                      </dt>
                      <dd className="tabular font-medium text-ink">
                        <AnimatedNumber value={result.now} format={usd} />
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="flex items-center gap-2.5 text-ink-2">
                        <span aria-hidden className="size-2.5 bg-accent" />
                        {calculator.result.deal}
                      </dt>
                      <dd className="tabular font-medium text-accent">
                        <AnimatedNumber value={result.deal} format={plusUsd} />
                      </dd>
                    </div>
                    <div className={cn('flex items-baseline justify-between gap-4 transition-opacity duration-200', !withTrader && 'opacity-45')}>
                      <dt className="flex items-center gap-2.5 text-ink-2">
                        <span aria-hidden className="size-2.5 bg-champagne" />
                        {calculator.result.trader}
                      </dt>
                      <dd className="tabular font-medium text-umber">
                        {withTrader ? <AnimatedNumber value={result.trader} format={plusUsd} /> : 'Off'}
                      </dd>
                    </div>
                  </dl>

                  <div aria-hidden className="mt-6 flex h-3 w-full gap-1">
                    <span className="chamfer-6 bg-ink-3/45 transition-[flex-basis] duration-500 ease-[var(--ease-out-strong)]" style={{ flexBasis: share(result.now) }} />
                    <span className="chamfer-6 bg-accent transition-[flex-basis] duration-500 ease-[var(--ease-out-strong)]" style={{ flexBasis: share(result.deal) }} />
                    <span className="chamfer-6 bg-champagne transition-[flex-basis] duration-500 ease-[var(--ease-out-strong)]" style={{ flexBasis: share(result.trader) }} />
                  </div>

                  <div className="mt-8 border-t border-line pt-7">
                    <p className="font-firs text-gradient text-[46px] leading-none sm:text-[56px]">
                      <AnimatedNumber value={result.gap} format={plusUsd} className="tabular" />
                    </p>
                    <p className="mt-2 text-[14px] text-ink-2">{calculator.result.perMonth}</p>
                    <p className="mt-4 text-[15px] text-ink">
                      <AnimatedNumber value={result.gap * 12} format={usd} className="tabular font-semibold" /> {calculator.result.perYear}.
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-6 flex flex-1 flex-col items-start justify-center gap-4 py-6">
                  <span className="chamfer-10 grid size-12 place-items-center bg-frost text-accent">
                    <CalcIcon aria-hidden strokeWidth={1.5} className="size-5" />
                  </span>
                  <p className="font-firs text-[24px] leading-tight text-ink">{calculator.empty.title}</p>
                  <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-2">{calculator.empty.text}</p>
                </div>
              )}

              <div className="mt-auto pt-8">
                <ChamferButton href="#apply" data-move-focus size="md" className="w-full">
                  {cta.primary}
                </ChamferButton>
                <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
                  {calculator.note}
                  {withTrader && ` ${calculator.traderNote}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logo wall: the brokers whose deals are live */}
        <div className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <p className="shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-3">{calculator.brokersLabel}</p>
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-5">
            {brokers.map((b) => (
              <li key={b.name} className="flex items-center gap-3">
                <img src={asset(b.logo)} alt="" width={b.w} height={b.h} loading="lazy" className="h-8 w-auto" />
                <span className="text-[15px] font-semibold tracking-tight text-ink">{b.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
        style={{ background: 'linear-gradient(to bottom, rgba(248, 246, 242, 0) 0%, rgba(248, 246, 242, 0.7) 60%, #F8F6F2 100%)' }}
      />
    </section>
  )
}
