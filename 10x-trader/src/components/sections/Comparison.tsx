import { Check, X } from 'lucide-react'
import { useRef } from 'react'
import { LogoMark } from '@/components/ui/Logo'
import { comparison } from '@/content'
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
  useReveal(root)

  return (
    <section id="compare" ref={root} aria-labelledby="compare-title" className="relative bg-frost px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 id="compare-title" className="font-firs text-[36px] font-semibold uppercase leading-[0.95] tracking-tight text-navy sm:text-[48px] lg:text-[54px]">
          {comparison.title}
        </h2>

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
                {comparison.rows.map((row, r) => (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className={cn(
                        'px-4 py-5 text-left text-[13px] font-medium leading-snug sm:px-7 sm:text-[15px]',
                        r < comparison.rows.length - 1 && 'border-b',
                        LINE,
                      )}
                    >
                      {row.label}
                    </th>
                    {row.values.map((yes, i) => (
                      <td
                        key={i}
                        className={cn('border-l px-2 py-5 text-center', r < comparison.rows.length - 1 && 'border-b', LINE, i === 0 && 'bg-frost')}
                      >
                        <Mark yes={yes} highlight={i === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
