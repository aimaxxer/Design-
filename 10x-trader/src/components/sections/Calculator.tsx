import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { calculator, cta, links } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'
import { formatCompactUsd, formatPct, formatUsd, MONTHS, monthsSince, project, series, type Method } from '@/lib/projection'

/** The deposit field's range ($100 to $100,000); out-of-range entries settle to the nearest end on blur. */
const MIN_DEPOSIT = 100
const MAX_DEPOSIT = 100_000
const MAX_PCT = 50

const withCommas = (digits: string) => (digits ? Number(digits).toLocaleString('en-US') : '')
/** Inline fields grow with what is typed, so the sentence keeps reading as a sentence. */
const fit = (chars: number, extra = 0.4): CSSProperties => ({ width: `${Math.max(chars, 1) + extra}ch` })

/* ------------------------------------------------------------------------------------------ */

const W = 600
const H = 260

/** The comparison line's ink: a cool gray from the navy family, validated against the accent (clear apart, 3:1 on white). */
const MUTED = '#7f94a0'

/** Clean axis ticks: four intervals of 1, 2, 2.5 or 5 times a power of ten, with headroom above the top value. */
function niceScale(top: number) {
  const raw = Math.max(top * 1.1, 1) / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow
  return { step, max: step * 4 }
}

type ChartProps = { deposit: number; pct: number; months: number; method: Method; startMonth: number; startYear: number }

function Chart({ deposit, pct, months, method, startMonth, startYear }: ChartProps) {
  const data = useMemo(() => series(deposit, pct, months), [deposit, pct, months])
  const [hover, setHover] = useState<number | null>(null)
  const { step, max } = niceScale(Math.max(...data.map((d) => d.tenX)))
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step)

  // Positions as fractions of the plot, so HTML marks (dots, tags, crosshair) can sit on the stretched SVG.
  const fx = (i: number) => (months === 0 ? (i === 0 ? 0 : 1) : i / months)
  const fy = (v: number) => 1 - v / max
  const pts = (key: 'tenX' | 'traditional') => {
    const list = months === 0 ? [data[0], data[0]] : data
    return list.map((d, i) => `${(fx(months === 0 ? i : d.i) * W).toFixed(1)},${(fy(d[key]) * H).toFixed(1)}`)
  }
  const line = (key: 'tenX' | 'traditional') => 'M' + pts(key).join('L')
  const area = (key: 'tenX' | 'traditional') => `${line(key)}L${W},${H}L0,${H}Z`
  type Key = 'tenX' | 'traditional'
  const selected: Key = method === '10x' ? 'tenX' : 'traditional'
  const other: Key = method === '10x' ? 'traditional' : 'tenX'
  const colour = (key: 'tenX' | 'traditional') => (key === selected ? '#0068a2' : MUTED)
  const last = data[data.length - 1]

  const monthLabel = (i: number) => {
    const m = startMonth + i
    return `${MONTHS[m % 12].slice(0, 3)} ${startYear + Math.floor(m / 12)}`
  }
  const xTicks = [...new Set(months < 3 ? [0, months] : [0, Math.round(months / 3), Math.round((2 * months) / 3), months])]
  const pos = (i: number, v: number): CSSProperties => ({ left: `${fx(i) * 100}%`, top: `${fy(v) * 100}%` })

  const keys = [
    { key: 'tenX' as const, label: calculator.legend.tenX },
    { key: 'traditional' as const, label: calculator.legend.traditional },
  ]
  const lineKey = (key: 'tenX' | 'traditional') => (
    <span
      aria-hidden
      className={cn('w-5 border-t-2', key === selected ? 'border-solid' : 'border-dashed')}
      style={{ borderColor: colour(key) }}
    />
  )

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    setHover(Math.round(f * months))
  }
  const hovered = hover === null ? null : data[Math.min(hover, data.length - 1)]

  return (
    <figure
      className="chamfer-16 bg-line p-px"
      aria-label={`${calculator.chartLabel}: ${calculator.legend.tenX} reaches ${formatUsd(last.tenX)}, ${calculator.legend.traditional} reaches ${formatUsd(last.traditional)}.`}
      role="img"
    >
      <div className="chamfer-16 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-[13px] font-semibold text-navy">{calculator.chartLabel}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-navy-2">
            {keys.map((k) => (
              <span key={k.key} className="flex items-center gap-2">
                {lineKey(k.key)}
                {k.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-8 pl-11">
          <div
            aria-hidden
            className="relative h-[200px] touch-pan-y sm:h-[240px]"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          >
            {/* Y ticks in a gutter left of the plot, on the same hairlines the plot draws. */}
            <div className="pointer-events-none absolute inset-y-0 right-full mr-2 w-9">
              {ticks.map((t) => (
                <span key={t} className="tabular absolute right-0 -translate-y-1/2 text-[11px] text-navy-3" style={{ top: `${fy(t) * 100}%` }}>
                  {t === 0 ? '$0' : formatCompactUsd(t)}
                </span>
              ))}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 block h-full w-full overflow-visible">
              <defs>
                <linearGradient id="calc-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4bbdf0" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="#4bbdf0" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#4bbdf0" stopOpacity="0" />
                </linearGradient>
              </defs>
              {ticks.slice(1).map((t) => (
                <line key={t} x1="0" x2={W} y1={fy(t) * H} y2={fy(t) * H} stroke="#e4ecf0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area(selected)} fill="url(#calc-area)" className="transition-[d] duration-500 ease-[var(--ease-out-strong)]" />
              <path
                d={line(other)}
                fill="none"
                stroke={MUTED}
                strokeWidth="1.75"
                strokeDasharray="5 5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="transition-[d] duration-500 ease-[var(--ease-out-strong)]"
              />
              <path
                d={line(selected)}
                fill="none"
                stroke="#0068a2"
                strokeWidth="2.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="transition-[d] duration-500 ease-[var(--ease-out-strong)]"
              />
              <line x1="0" x2={W} y1={H} y2={H} stroke="#b7cbd3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* End markers: a ringed dot on each line, the leading one with a soft halo, and its value just above. */}
            {(['traditional', 'tenX'] as const).map((key) => {
              const lead = key === selected
              return (
                <span
                  key={key}
                  className={cn('absolute transition-[left,top,opacity] duration-500 ease-[var(--ease-out-strong)]', hovered && 'opacity-30')}
                  style={pos(months, last[key])}
                >
                  <span
                    className={cn('absolute -translate-x-1/2 -translate-y-1/2 rounded-full', lead ? 'size-2.5' : 'size-2')}
                    style={{
                      background: colour(key),
                      boxShadow: lead ? '0 0 0 2px #fff, 0 0 0 7px rgba(0, 104, 162, 0.12)' : '0 0 0 2px #fff',
                    }}
                  />
                  <span
                    className={cn(
                      'tabular absolute right-3 bottom-2.5 whitespace-nowrap',
                      lead ? 'chamfer-6 bg-line p-px text-[12px] font-semibold text-navy' : 'text-[11px] font-medium text-navy-2',
                    )}
                  >
                    {lead ? <span className="chamfer-6 block bg-white px-2 py-0.5">{formatUsd(last[key])}</span> : formatUsd(last[key])}
                  </span>
                </span>
              )
            })}

            {/* Hover: a crosshair snapped to the month, a ringed dot on each line, one readout for both. */}
            {hovered && hover !== null && (
              <>
                <span className="pointer-events-none absolute inset-y-0 w-px bg-navy-3/35" style={{ left: `${fx(hover) * 100}%` }} />
                {(['traditional', 'tenX'] as const).map((key) => (
                  <span
                    key={key}
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ ...pos(hover, hovered[key]), background: colour(key), boxShadow: '0 0 0 2px #fff' }}
                  />
                ))}
                <div
                  className={cn(
                    'chamfer-8 pointer-events-none absolute top-1 bg-line p-px shadow-[0_12px_32px_-16px_rgba(21,67,89,0.35)]',
                    fx(hover) > 0.55 ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3',
                    // Phones: the readout parks in the plot's top-left corner instead of chasing the crosshair off the card.
                    'max-sm:!left-0 max-sm:!translate-x-0',
                  )}
                  style={{ left: `${fx(hover) * 100}%` }}
                >
                  <div className="chamfer-8 bg-white px-3.5 py-3">
                    <p className="text-[11px] text-navy-3">{monthLabel(hover)}</p>
                    {[selected, other].map((key) => (
                      <p key={key} className="mt-1.5 flex items-center gap-2 whitespace-nowrap text-[12px] text-navy-2">
                        {lineKey(key)}
                        <span className="tabular text-[13px] font-semibold text-navy">{formatUsd(hovered[key])}</span>
                        {keys.find((k) => k.key === key)!.label}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div aria-hidden className="relative mt-3 h-4 text-[11px] text-navy-3">
            {xTicks.map((i, n) => (
              <span
                key={i}
                className={cn(
                  'tabular absolute whitespace-nowrap',
                  n === 0 ? '' : n === xTicks.length - 1 ? '-translate-x-full' : 'hidden -translate-x-1/2 sm:inline',
                )}
                style={{ left: `${fx(i) * 100}%` }}
              >
                {monthLabel(i)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  )
}

/* ------------------------------------------------------------------------------------------ */

export function Calculator() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const d = calculator.defaults
  const now = new Date()

  const [depositDigits, setDepositDigits] = useState(String(d.deposit))
  const [pctText, setPctText] = useState(String(d.monthlyPct))
  const [method, setMethod] = useState<Method>(d.method)
  const [month, setMonth] = useState(d.month)
  const [year, setYear] = useState(d.year)

  const deposit = Math.min(Number(depositDigits || 0), MAX_DEPOSIT)
  const pct = Math.min(Number.parseFloat(pctText) || 0, MAX_PCT)
  const months = monthsSince(month, year, now)
  const result = project(deposit, pct, months, method)
  const years = Array.from({ length: now.getFullYear() - calculator.firstYear + 1 }, (_, i) => now.getFullYear() - i)
  const methodLabel = calculator.methods.find((m) => m.id === method)!.label
  const s = calculator.sentence

  return (
    <section id="calculator" ref={root} aria-labelledby="calculator-title" className="relative bg-mist px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-navy">
          <Eyebrow>{calculator.label}</Eyebrow>
          <h2
            id="calculator-title"
            className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-[48px] lg:text-[54px]"
          >
            {calculator.title[0]}
            <br />
            {calculator.title[1]}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{calculator.intro}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div data-reveal className="font-firs text-[26px] leading-[1.5] text-navy sm:text-[34px] lg:text-[38px]">
            <p>
              {s.deployed}{' '}
              <span className="whitespace-nowrap">
                $
                <input
                  aria-label="Deposit in US dollars"
                  inputMode="numeric"
                  autoComplete="off"
                  value={withCommas(depositDigits)}
                  onChange={(e) => setDepositDigits(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onBlur={() => setDepositDigits(String(Math.max(deposit, MIN_DEPOSIT)))}
                  className="inline-field tabular"
                  style={fit(withCommas(depositDigits).length)}
                />
              </span>{' '}
              {s.with}{' '}
              <select
                aria-label="Method"
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
                className="inline-field"
                style={fit(methodLabel.length, 1.6)}
              >
                {calculator.methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>{' '}
              {s.method}{' '}
              <span className="whitespace-nowrap">
                <input
                  aria-label="Monthly gain in percent"
                  inputMode="decimal"
                  autoComplete="off"
                  value={pctText}
                  onChange={(e) => setPctText(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 5))}
                  onBlur={() => setPctText(String(pct))}
                  className="inline-field tabular text-right"
                  style={fit(pctText.length, 0.25)}
                />
                %
              </span>{' '}
              {s.gain}{' '}
              <select
                aria-label="Start month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="inline-field"
                style={fit(MONTHS[month].length, 1.2)}
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>{' '}
              <select
                aria-label="Start year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="inline-field tabular"
                style={fit(4, 1.4)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              , {s.result}{' '}
            </p>
            <p aria-live="polite" className="mt-1">
              <AnimatedNumber value={result.balance} format={formatUsd} className="text-gradient tabular font-semibold" />, {s.profit}{' '}
              <AnimatedNumber value={result.profit} format={formatUsd} className="tabular" />{' '}
              <span className="chamfer-6 tabular relative -top-[0.2em] ml-1 inline-block bg-accent px-2.5 py-1 align-middle font-sans text-[13px] font-semibold text-white sm:text-[14px]">
                <AnimatedNumber value={result.returnPct} format={formatPct} />
              </span>
            </p>
          </div>

          <div data-reveal>
            <Chart deposit={deposit} pct={pct} months={months} method={method} startMonth={month} startYear={year} />
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-[12px] leading-[1.6] text-navy-3">{calculator.note}</p>

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
