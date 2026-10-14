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

function Chart({ deposit, pct, months, method, startLabel }: { deposit: number; pct: number; months: number; method: Method; startLabel: string }) {
  const data = useMemo(() => series(deposit, pct, months), [deposit, pct, months])
  const max = Math.max(1, ...data.map((d) => d.tenX)) * 1.08
  const x = (i: number) => (months === 0 ? (i === 0 ? 0 : W) : (i / months) * W)
  const y = (v: number) => H - (v / max) * H
  const pts = (key: 'tenX' | 'traditional') => {
    const list = months === 0 ? [data[0], data[0]] : data
    return list.map((d, i) => `${x(months === 0 ? i : d.i).toFixed(1)},${y(d[key]).toFixed(1)}`)
  }
  const line = (key: 'tenX' | 'traditional') => 'M' + pts(key).join('L')
  const area = (key: 'tenX' | 'traditional') => `${line(key)}L${W},${H}L0,${H}Z`
  const selected = method === '10x' ? 'tenX' : 'traditional'
  const other = method === '10x' ? 'traditional' : 'tenX'
  const now = new Date()
  const endLabel = `${MONTHS[now.getMonth()].slice(0, 3)} ${now.getFullYear()}`

  return (
    <figure
      className="chamfer-16 bg-line p-px"
      aria-label={`${calculator.chartLabel}: ${calculator.legend.tenX} reaches ${formatUsd(data[data.length - 1].tenX)}, ${calculator.legend.traditional} reaches ${formatUsd(data[data.length - 1].traditional)}.`}
      role="img"
    >
      <div className="chamfer-16 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-[13px] font-semibold text-navy">{calculator.chartLabel}</p>
          <div className="flex items-center gap-5 text-[12px] text-navy-2">
            <span className="flex items-center gap-2">
              <span aria-hidden className={cn('h-[2px] w-5', method === '10x' ? 'bg-accent' : 'bg-navy-3/60')} />
              {calculator.legend.tenX}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className={cn('h-[2px] w-5', method === 'traditional' ? 'bg-accent' : 'bg-navy-3/60')} />
              {calculator.legend.traditional}
            </span>
          </div>
        </div>

        <div className="relative mt-6">
          <div aria-hidden className="tabular absolute right-0 top-0 -translate-y-full pb-1 text-[11px] text-navy-3">
            {formatCompactUsd(max)}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[200px] w-full overflow-visible sm:h-[240px]" aria-hidden>
            <defs>
              <linearGradient id="calc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4bbdf0" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#4bbdf0" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1="0" x2={W} y1={H * (1 - f)} y2={H * (1 - f)} stroke="#d7e2e7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area(selected)} fill="url(#calc-area)" className="transition-[d] duration-500 ease-[var(--ease-out-strong)]" />
            <path
              d={line(other)}
              fill="none"
              stroke="#557080"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              vectorEffect="non-scaling-stroke"
              className="transition-[d] duration-500 ease-[var(--ease-out-strong)]"
            />
            <path
              d={line(selected)}
              fill="none"
              stroke="#0068a2"
              strokeWidth="2.25"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="transition-[d] duration-500 ease-[var(--ease-out-strong)]"
            />
            <line x1="0" x2={W} y1={H} y2={H} stroke="#b7cbd3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <div aria-hidden className="mt-2 flex justify-between text-[11px] text-navy-3">
            <span>{startLabel}</span>
            <span>{endLabel}</span>
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
            <Chart deposit={deposit} pct={pct} months={months} method={method} startLabel={`${MONTHS[month].slice(0, 3)} ${year}`} />
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
