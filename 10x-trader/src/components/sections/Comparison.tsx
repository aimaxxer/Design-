import { Check, ChevronDown, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ChamferButton } from '@/components/ui/ChamferButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { LogoMark } from '@/components/ui/Logo'
import { comparison, cta, links } from '@/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

/** Hairlines in the framework's nomination stroke colour. */
const LINE = 'border-[rgba(0,104,162,0.25)]'

function Mark({ yes, highlight }: { yes: boolean; highlight: boolean }) {
  return (
    <>
      {yes ? (
        <Check aria-hidden strokeWidth={2} className={cn('mx-auto size-5', highlight ? 'text-accent' : 'text-navy-3')} />
      ) : (
        <X aria-hidden strokeWidth={1.5} className="mx-auto size-5 text-navy-3/70" />
      )}
      <span className="sr-only">{yes ? 'Yes' : 'No'}</span>
    </>
  )
}

export function Comparison() {
  const root = useRef<HTMLElement>(null)
  // Phones open on the three hardest rows; the rest unfold on request. Wider screens always show all.
  const [expanded, setExpanded] = useState(false)
  const last = comparison.rows.length - 1
  const fold = comparison.foldAfter
  useReveal(root)

  return (
    <section id="compare" ref={root} aria-labelledby="compare-title" className="relative bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>{comparison.label}</Eyebrow>
        <h2 id="compare-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight text-navy sm:text-[48px] lg:text-[54px]">
          {comparison.title}
        </h2>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-navy-2 sm:text-[18px]">{comparison.intro}</p>

        <div data-reveal className="chamfer-24 mt-12 bg-[rgba(0,104,162,0.25)] p-px">
          <div className="chamfer-24 overflow-hidden bg-white">
            <table className="w-full table-fixed border-collapse text-navy">
              <caption className="sr-only">{comparison.title}</caption>
              <colgroup>
                <col className="w-[40%] sm:w-[34%]" />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <td className={cn('border-b', LINE)} />
                  {comparison.columns.map((col, i) => (
                    <th
                      key={col}
                      scope="col"
                      className={cn(
                        'border-b border-l px-2 py-5 text-[11px] font-medium leading-tight sm:px-4 sm:text-[13px]',
                        LINE,
                        i === 0 ? 'bg-frost text-navy' : 'text-navy-3',
                      )}
                    >
                      {i === 0 ? (
                        <span className="flex flex-col items-center gap-1.5">
                          <LogoMark className="h-4 w-auto sm:h-5" />
                          <span className="sr-only">{col}</span>
                          <span aria-hidden className="hidden text-[11px] uppercase tracking-[0.14em] sm:block">
                            trader
                          </span>
                        </span>
                      ) : (
                        col
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, r) => {
                  const folded = !expanded && r >= fold
                  // The last row on show draws no bottom rule: the frame's edge is already there.
                  const rule = cn(r < last && 'border-b', !expanded && r === fold - 1 && 'max-sm:border-b-0')
                  return (
                    <tr key={row.label} className={cn(folded && 'max-sm:hidden')}>
                      <th
                        scope="row"
                        className={cn('px-4 py-5 text-left text-[13px] font-medium leading-snug sm:px-7 sm:text-[15px]', rule, LINE)}
                      >
                        {row.label}
                      </th>
                      {row.values.map((yes, i) => (
                        <td
                          key={i}
                          className={cn('border-l px-2 py-5 text-center', rule, LINE, i === 0 && 'bg-frost')}
                        >
                          <Mark yes={yes} highlight={i === 0} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!expanded && comparison.rows.length > fold && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-navy transition-colors duration-200 hover:text-accent sm:hidden"
          >
            {comparison.showAll}
            <ChevronDown aria-hidden strokeWidth={1.75} className="size-3.5" />
          </button>
        )}

        <div className="mt-12 flex justify-start lg:justify-end">
          <ChamferButton href={links.signUp} size="md">
            {cta.primary}
          </ChamferButton>
        </div>
      </div>
    </section>
  )
}
