import { ChamferFrame } from '@/components/ui/ChamferFrame'

export type PickItem = { id: string; title: string; sub: string }

/**
 * The framework's nomination card, as a toggle: one of the cards flanking a section's coin.
 * Picking one turns the coin and shows its full text under it (Problem, Benefits).
 */
export function PickCard({ item, active, controls, onSelect }: { item: PickItem; active: boolean; controls: string; onSelect: () => void }) {
  return (
    <li data-reveal className="w-full max-w-[20em]">
      <button
        type="button"
        aria-pressed={active}
        aria-controls={controls}
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
