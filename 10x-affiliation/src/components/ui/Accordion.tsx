import { Plus } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Item = { id: string; q: string; a: ReactNode }

/** Single-open, collapsible list. Panels animate grid-rows 0fr -> 1fr, so no height is measured. */
export function Accordion({ items, defaultOpen = null }: { items: Item[]; defaultOpen?: string | null }) {
  const [open, setOpen] = useState<string | null>(defaultOpen)
  const uid = useId()

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const isOpen = open === item.id
        const buttonId = `${uid}-${item.id}-trigger`
        const panelId = `${uid}-${item.id}-panel`
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((cur) => (cur === item.id ? null : item.id))}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-medium text-ink sm:text-[17px]"
              >
                {item.q}
                <span
                  aria-hidden
                  className={cn(
                    'chamfer-6 grid size-8 shrink-0 place-items-center p-px transition-colors duration-200',
                    isOpen ? 'bg-accent' : 'bg-line-strong group-hover:bg-ink-3',
                  )}
                >
                  <span className={cn('chamfer-6 grid h-full w-full place-items-center', isOpen ? 'bg-accent text-white' : 'bg-white')}>
                    <Plus
                      strokeWidth={1.75}
                      className={cn('size-3.5 transition-transform duration-300 ease-[var(--ease-out-strong)]', isOpen && 'rotate-45')}
                    />
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-strong)]',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[64ch] pb-6 pr-12 text-[15px] leading-relaxed text-ink-2">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
