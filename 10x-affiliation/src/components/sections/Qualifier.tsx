import { ArrowLeft, ArrowRight, CalendarDays, Check, Loader2, RotateCcw, Send } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useId, useRef, useState, type FormEvent } from 'react'
import { ChoiceGroup, Field, Select, TextInput } from '@/components/ui/Field'
import { cta, links, qualifier, type Option } from '@/content'
import { cn } from '@/lib/cn'
import { lastEstimate } from '@/lib/estimate'

type Answers = {
  role: string
  clients: string
  volume: string
  blockers: string[]
  broker: string
  name: string
  email: string
  handle: string
  region: string
}

type Errors = Partial<Record<keyof Answers, string>>
type Status = 'idle' | 'submitting' | 'error'
type View = 'form' | 'result' | 'booking'

const EMPTY: Answers = { role: '', clients: '', volume: '', blockers: [], broker: '', name: '', email: '', handle: '', region: '' }
const LAST = qualifier.steps.length - 1
const ease = [0.23, 1, 0.32, 1] as const

/** Partner track: anyone past "just starting" with a growing book or real flow (the canvas rule). */
function isPartner(a: Answers) {
  const bigBook = a.clients === '26-100' || a.clients === '100+'
  const bigFlow = a.volume === '500-2000' || a.volume === '2000+'
  return a.role !== 'new' && (bigBook || bigFlow)
}

function attribution() {
  const params = new URLSearchParams(window.location.search)
  const pick = (k: string) => params.get(k) || undefined
  return {
    partner: pick('ref') ?? pick('partner'),
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    page: window.location.href,
    referrer: document.referrer || undefined,
  }
}

function makeReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return '10X-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Big single-choice rows backed by real radios. A pointer pick advances; keyboard users press Continue. */
function OptionList({
  name,
  options,
  value,
  onPick,
  large,
}: {
  name: string
  options: Option[]
  value: string
  onPick: (v: string, viaPointer: boolean) => void
  large?: boolean
}) {
  const pointer = useRef(false)
  return (
    <div className="grid gap-2.5">
      {options.map((o) => {
        const selected = value === o.value
        return (
          <label key={o.value} className="group cursor-pointer" onPointerDown={() => (pointer.current = true)}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => {
                onPick(o.value, pointer.current)
                pointer.current = false
              }}
              onKeyDown={() => (pointer.current = false)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'chamfer-10 block p-px transition-colors duration-150 peer-focus-visible:bg-accent',
                selected ? 'bg-accent' : 'bg-line-strong group-hover:bg-line-hover',
              )}
            >
              <span
                className={cn(
                  'chamfer-10 flex items-center gap-4 px-4 py-3.5 transition-[background-color,transform] duration-150 group-active:scale-[0.99] sm:px-5',
                  selected ? 'bg-tint' : 'bg-white',
                )}
              >
                <span
                  aria-hidden
                  className={cn('grid size-[18px] shrink-0 place-items-center border transition-colors', selected ? 'border-accent bg-accent' : 'border-ink-3/60')}
                >
                  {selected && <Check strokeWidth={3} className="size-3 text-white" />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn('font-medium text-ink', large ? 'font-firs text-[20px] leading-tight' : 'text-[15px]')}>{o.label}</span>
                  {o.sub && <span className="text-[13px] text-ink-3">{o.sub}</span>}
                </span>
              </span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

export function Qualifier() {
  const uid = useId().replace(/:/g, '')
  const id = (f: keyof Answers) => `${uid}-${f}`
  const reduce = useReducedMotion()

  const [step, setStep] = useState(0)
  const [a, setA] = useState<Answers>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [view, setView] = useState<View>('form')
  const [reference, setReference] = useState('')

  // Move focus to each new heading once it mounts (after the exit animation), so keyboard and
  // screen-reader users land at the start of the next question.
  const focusNext = useRef(false)
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusNext.current) {
      focusNext.current = false
      el.focus({ preventScroll: true })
    }
  }, [])

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setA((d) => ({ ...d, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const go = (next: number) => {
    window.clearTimeout(advanceTimer.current)
    setErrors({})
    focusNext.current = true
    setStep(next)
  }

  // A short beat after a pointer pick so the selection registers before the next question slides in.
  const advanceTimer = useRef<number | undefined>(undefined)
  const pick = (key: 'role' | 'clients' | 'volume' | 'broker') => (v: string, viaPointer: boolean) => {
    set(key, v)
    window.clearTimeout(advanceTimer.current)
    if (viaPointer) advanceTimer.current = window.setTimeout(() => go(step + 1), 220)
  }

  const required: Partial<Record<number, keyof Answers>> = { 0: 'role', 1: 'clients', 2: 'volume', 4: 'broker' }

  const validate = (): Errors => {
    const e: Errors = {}
    const key = required[step]
    if (key && !a[key]) e[key] = 'Choose one option to continue.'
    if (step === LAST) {
      if (a.name.trim().length < 2) e.name = 'Enter your full name.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) e.email = 'Enter a valid email, like name@example.com.'
      if (!a.region) e.region = 'Choose where most of your clients are.'
    }
    return e
  }

  const submit = async () => {
    setStatus('submitting')
    const ref = reference || makeReference()
    setReference(ref)
    const payload = {
      reference: ref,
      submittedAt: new Date().toISOString(),
      track: isPartner(a) ? 'partner' : 'growth',
      ...a,
      name: a.name.trim(),
      email: a.email.trim(),
      handle: a.handle.trim() || undefined,
      estimate: lastEstimate.get() ?? undefined,
      source: attribution(),
    }
    try {
      if (links.qualifierEndpoint) {
        const res = await fetch(links.qualifierEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`Endpoint answered ${res.status}`)
      } else {
        // No endpoint configured yet (see content.ts): simulate the round trip so the flow is testable.
        await new Promise((r) => setTimeout(r, 800))
        console.info('[10X Affiliation] Qualifier payload (VITE_QUALIFIER_ENDPOINT not set):', payload)
      }
      setStatus('idle')
      focusNext.current = true
      setView('result')
    } catch (err) {
      console.error('[10X Affiliation] Qualifier failed to send', err)
      setStatus('error')
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return
    const errs = validate()
    setErrors(errs)
    const first = Object.keys(errs)[0] as keyof Answers | undefined
    if (first) {
      document.getElementById(['role', 'clients', 'volume', 'broker'].includes(first) ? `${uid}-group` : id(first))?.focus()
      return
    }
    if (step < LAST) return go(step + 1)
    void submit()
  }

  const firstName = a.name.trim().split(/\s+/)[0] || 'Good news'
  const partner = isPartner(a)
  const transition = { duration: 0.22, ease }
  const enter = reduce ? { opacity: 0 } : { opacity: 0, x: 16 }
  const exit = reduce ? { opacity: 0 } : { opacity: 0, x: -12 }
  const describedBy = (f: keyof Answers) => (errors[f] ? `${id(f)}-error` : undefined)

  const calendlyUrl = (() => {
    if (!links.calendly) return ''
    const url = new URL(links.calendly)
    url.searchParams.set('name', a.name.trim())
    url.searchParams.set('email', a.email.trim())
    url.searchParams.set('hide_gdpr_banner', '1')
    if (a.region) url.searchParams.set('a1', a.region)
    return url.toString()
  })()

  return (
    <div className="chamfer-24 bg-line-strong p-px">
      <div className="chamfer-24 relative bg-white px-5 py-7 sm:px-10 sm:py-10">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'form' && (
            <motion.form key="form" noValidate onSubmit={onSubmit} exit={exit} transition={transition} aria-labelledby={`${uid}-q`}>
              {/* Progress */}
              <div className="flex items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                <span className="tabular">
                  Step {String(step + 1).padStart(2, '0')} / {String(qualifier.steps.length).padStart(2, '0')}
                </span>
                <span>About 2 min</span>
              </div>
              <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label="Qualifier progress">
                {qualifier.steps.map((s, i) => (
                  <li key={s} aria-current={i === step ? 'step' : undefined}>
                    <span aria-hidden className={cn('chamfer-6 block h-1.5 transition-colors duration-300', i < step ? 'bg-accent' : i === step ? 'bg-accent/60' : 'bg-line')} />
                    <span className="sr-only">
                      Step {i + 1}: {s}
                      {i < step ? ' (done)' : ''}
                    </span>
                  </li>
                ))}
              </ol>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={enter} animate={{ opacity: 1, x: 0 }} exit={exit} transition={transition} className="mt-8">
                  <h3 id={`${uid}-q`} ref={headingRef} tabIndex={-1} className="font-firs text-[24px] leading-tight text-ink outline-none sm:text-[28px]">
                    <span className="sr-only">
                      Step {step + 1} of {qualifier.steps.length}:{' '}
                    </span>
                    {step === 0 && qualifier.role.question}
                    {step === 1 && qualifier.clients.question}
                    {step === 2 && qualifier.volume.question}
                    {step === 3 && qualifier.blockers.question}
                    {step === 4 && qualifier.broker.question}
                    {step === 5 && qualifier.contact.question}
                  </h3>

                  <div className="mt-6">
                    {[0, 1, 2, 4].includes(step) && (
                      <fieldset
                        id={`${uid}-group`}
                        tabIndex={-1}
                        aria-labelledby={`${uid}-q`}
                        aria-describedby={errors[required[step]!] ? `${uid}-group-error` : undefined}
                        className="outline-none"
                      >
                        {step === 0 && <OptionList name="role" options={qualifier.role.options} value={a.role} onPick={pick('role')} />}
                        {step === 1 && (
                          <div className="[&>div]:grid-cols-2">
                            <OptionList name="clients" options={qualifier.clients.options} value={a.clients} onPick={pick('clients')} large />
                          </div>
                        )}
                        {step === 2 && <OptionList name="volume" options={qualifier.volume.options} value={a.volume} onPick={pick('volume')} />}
                        {step === 4 && <OptionList name="broker" options={qualifier.broker.options} value={a.broker} onPick={pick('broker')} />}
                        {errors[required[step]!] && (
                          <p id={`${uid}-group-error`} className="mt-3 text-[12px] text-neg">
                            {errors[required[step]!]}
                          </p>
                        )}
                      </fieldset>
                    )}

                    {step === 3 && (
                      <ChoiceGroup
                        name="blockers"
                        legend={qualifier.blockers.hint}
                        options={qualifier.blockers.options}
                        value={a.blockers}
                        multiple
                        onChange={(v) => set('blockers', v as string[])}
                      />
                    )}

                    {step === 5 && (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field id={id('name')} label={qualifier.contact.name} error={errors.name} className="sm:col-span-2">
                          <TextInput
                            id={id('name')}
                            autoComplete="name"
                            value={a.name}
                            onChange={(e) => set('name', e.target.value)}
                            invalid={!!errors.name}
                            aria-describedby={describedBy('name')}
                          />
                        </Field>
                        <Field id={id('email')} label={qualifier.contact.email} error={errors.email}>
                          <TextInput
                            id={id('email')}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={a.email}
                            onChange={(e) => set('email', e.target.value)}
                            invalid={!!errors.email}
                            aria-describedby={describedBy('email')}
                          />
                        </Field>
                        <Field id={id('handle')} label={qualifier.contact.handle} hint={qualifier.contact.handleHint}>
                          <TextInput
                            id={id('handle')}
                            autoComplete="tel"
                            value={a.handle}
                            onChange={(e) => set('handle', e.target.value)}
                            aria-describedby={`${id('handle')}-hint`}
                          />
                        </Field>
                        <Field
                          id={id('region')}
                          label={qualifier.contact.region}
                          error={errors.region}
                          hint={qualifier.contact.regionHint}
                          className="sm:col-span-2"
                        >
                          <Select
                            id={id('region')}
                            options={qualifier.contact.regions}
                            placeholder="Choose a region"
                            value={a.region}
                            onChange={(e) => set('region', e.target.value)}
                            invalid={!!errors.region}
                            aria-describedby={errors.region ? `${id('region')}-error` : `${id('region')}-hint`}
                          />
                        </Field>
                        <p className="text-[12px] text-ink-3 sm:col-span-2">
                          {qualifier.contact.privacy}{' '}
                          <a href={links.privacy} className="underline hover:text-ink">
                            Privacy policy
                          </a>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {status === 'error' && (
                <div role="alert" className="mt-6 border-l-2 border-neg bg-neg/5 px-4 py-3 text-[13px] leading-relaxed text-ink">
                  {qualifier.error}
                </div>
              )}

              <div className="mt-9 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => go(step - 1)}
                    className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-2 transition-colors hover:text-ink"
                  >
                    <ArrowLeft aria-hidden strokeWidth={1.75} className="size-3.5" />
                    Back
                  </button>
                ) : (
                  <span className="text-[12px] text-ink-3">Free, no obligation</span>
                )}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="chamfer-10 group inline-flex items-center gap-2 whitespace-nowrap bg-cta-gloss px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-[filter,transform] duration-200 ease-[var(--ease-out-strong)] hover:brightness-125 active:scale-[0.97] disabled:cursor-wait disabled:opacity-80 sm:text-[12px]"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 aria-hidden strokeWidth={2} className="size-3.5 animate-spin" />
                      Sending
                    </>
                  ) : step < LAST ? (
                    <>
                      Continue
                      {step === 3 && a.blockers.length > 0 && <span className="tabular opacity-80">({a.blockers.length})</span>}
                      <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  ) : status === 'error' ? (
                    <>
                      Try again
                      <RotateCcw aria-hidden strokeWidth={1.75} className="size-3.5" />
                    </>
                  ) : (
                    <>
                      {qualifier.contact.submit}
                      <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {status === 'submitting' ? 'Sending your answers' : ''}
              </p>
            </motion.form>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={enter} animate={{ opacity: 1, x: 0 }} exit={exit} transition={transition} className="flex min-h-[460px] flex-col">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                Result: {partner ? qualifier.partnerTrack.label : qualifier.growthTrack.label}
              </p>
              <h3 ref={headingRef} tabIndex={-1} className="font-firs mt-4 text-[28px] leading-[1.1] text-ink outline-none sm:text-[34px]">
                {firstName}, {partner ? qualifier.partnerTrack.title : qualifier.growthTrack.title}
              </h3>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
                {partner ? qualifier.partnerTrack.text : qualifier.growthTrack.text}
              </p>
              {partner && (
                <ol className="mt-6 grid gap-2.5">
                  {qualifier.partnerTrack.points.map((p, i) => (
                    <li key={p} className="chamfer-10 flex items-baseline gap-4 bg-frost px-5 py-4">
                      <span className="tabular text-[12px] font-medium text-accent">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[15px] text-ink">{p}</span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => {
                    focusNext.current = true
                    setView('booking')
                  }}
                  className="chamfer-10 group inline-flex w-full items-center justify-center gap-2 bg-cta-gloss px-6 py-4 text-[12px] font-medium uppercase tracking-[0.14em] text-white transition-[filter,transform] duration-200 hover:brightness-125 active:scale-[0.97]"
                >
                  {cta.primary}
                  <CalendarDays aria-hidden strokeWidth={1.75} className="size-4" />
                </button>
                <p className="mt-3 text-center text-[12px] text-ink-3">
                  Reference <span className="tabular font-medium tracking-wider text-ink">{reference}</span>
                </p>
              </div>
            </motion.div>
          )}

          {view === 'booking' && (
            <motion.div key="booking" initial={enter} animate={{ opacity: 1, x: 0 }} transition={transition}>
              <h3 ref={headingRef} tabIndex={-1} className="font-firs text-[28px] leading-[1.1] text-ink outline-none sm:text-[34px]">
                {qualifier.booking.title}
              </h3>
              <div className="mt-6">
                {calendlyUrl ? (
                  <iframe
                    title="Book your partner strategy call"
                    src={calendlyUrl}
                    loading="lazy"
                    className="h-[640px] w-full border-0 bg-white"
                    data-lenis-prevent
                  />
                ) : (
                  <div className="chamfer-16 flex min-h-[260px] flex-col items-center justify-center gap-3 border border-dashed border-warn/70 bg-frost px-6 py-10 text-center">
                    <CalendarDays aria-hidden strokeWidth={1.5} className="size-8 text-accent" />
                    <p className="text-[12px] font-medium tracking-[0.08em] text-ink">{qualifier.booking.placeholder}</p>
                    <p className="max-w-[46ch] text-[12px] leading-relaxed text-ink-3">{qualifier.booking.placeholderHint}</p>
                  </div>
                )}
              </div>
              <div className="mt-7 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-3">{qualifier.booking.afterTitle}</p>
                  <ul className="mt-3 space-y-2">
                    {qualifier.booking.after.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-[15px] text-ink">
                        <Check aria-hidden strokeWidth={2} className="size-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {links.telegram && (
                  <a
                    href={links.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-accent underline-offset-4 hover:underline"
                  >
                    <Send aria-hidden strokeWidth={1.75} className="size-4" />
                    {qualifier.booking.telegram}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
