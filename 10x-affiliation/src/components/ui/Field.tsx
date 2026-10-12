import { ChevronDown } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Label above, control, then hint or error below. Errors are announced and linked to the control. */
export function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-3">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[12px] text-neg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** The chamfered input shell: a 1px border layer that turns bronze on focus and red on error. */
export function InputShell({ invalid, children, className }: { invalid?: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'chamfer-8 p-px transition-colors duration-150',
        invalid ? 'bg-neg/80' : 'bg-line-strong focus-within:bg-accent hover:bg-line-hover',
        className,
      )}
    >
      {children}
    </div>
  )
}

const control =
  'chamfer-8 block w-full bg-white px-4 text-[15px] text-ink placeholder:text-ink-3 outline-none transition-colors focus:bg-white'

export function TextInput({
  invalid,
  shellClassName,
  ...props
}: ComponentPropsWithoutRef<'input'> & { invalid?: boolean; shellClassName?: string }) {
  return (
    <InputShell invalid={invalid} className={shellClassName}>
      <input {...props} aria-invalid={invalid || undefined} className={cn(control, 'h-12', props.className)} />
    </InputShell>
  )
}

export function TextArea({ invalid, ...props }: ComponentPropsWithoutRef<'textarea'> & { invalid?: boolean }) {
  return (
    <InputShell invalid={invalid}>
      <textarea {...props} aria-invalid={invalid || undefined} className={cn(control, 'min-h-[132px] resize-y py-3 leading-relaxed', props.className)} />
    </InputShell>
  )
}

export function Select({
  invalid,
  options,
  placeholder,
  ...props
}: ComponentPropsWithoutRef<'select'> & { invalid?: boolean; options: string[]; placeholder?: string }) {
  return (
    <InputShell invalid={invalid} className="relative">
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(control, 'h-12 cursor-pointer appearance-none pr-10', !props.value && 'text-ink-3', props.className)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-2" />
    </InputShell>
  )
}

/** A group of chamfered toggle chips backed by real radios or checkboxes. */
export function ChoiceGroup({
  name,
  legend,
  options,
  value,
  multiple,
  onChange,
  error,
  hint,
}: {
  name: string
  legend: string
  options: string[]
  value: string | string[]
  multiple?: boolean
  onChange: (next: string | string[]) => void
  error?: string
  hint?: string
}) {
  const selected = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o)
  const toggle = (o: string) => {
    if (!multiple) return onChange(o)
    const list = Array.isArray(value) ? value : []
    onChange(list.includes(o) ? list.filter((x) => x !== o) : [...list, o])
  }
  return (
    <fieldset
      id={`${name}-group`}
      tabIndex={-1}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      className="flex flex-col gap-2 outline-none"
    >
      <legend className="mb-2 text-[13px] font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="group cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={o}
              checked={selected(o)}
              onChange={() => toggle(o)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'chamfer-6 block p-px transition-colors duration-150 peer-focus-visible:bg-accent',
                selected(o) ? 'bg-accent' : error ? 'bg-neg/60' : 'bg-line-strong group-hover:bg-line-hover',
              )}
            >
              <span
                className={cn(
                  'chamfer-6 block px-3.5 py-2 text-[13px] transition-colors duration-150 active:scale-[0.98]',
                  selected(o) ? 'bg-tint text-ink' : 'bg-white text-ink-2 group-hover:text-ink',
                )}
              >
                {o}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-[12px] text-neg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-[12px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </fieldset>
  )
}
