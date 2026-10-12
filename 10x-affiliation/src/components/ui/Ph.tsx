import type { Value } from '@/content'

const SHOW_MARKERS = import.meta.env.DEV

/**
 * Renders a content value. Placeholders get an amber dashed outline on the dev server
 * so unfinished programme terms can't slip into a launch unnoticed. Production renders plain text.
 */
export function Ph({ value }: { value: Value }) {
  if (typeof value === 'string') return <>{value}</>
  if (!SHOW_MARKERS) return <>{value.value}</>
  return (
    <span
      title="Placeholder: replace in src/content.ts before launch"
      className="rounded-[2px] border border-dashed border-warn/70 px-0.5 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
    >
      {value.value}
    </span>
  )
}
