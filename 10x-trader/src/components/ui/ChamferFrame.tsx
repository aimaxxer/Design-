import { cn } from '@/lib/cn'

/**
 * The template's nomination-card border: a chamfered polygon drawn as a hairline SVG that
 * stretches to any box (preserveAspectRatio="none" + non-scaling stroke keeps it 1px).
 */
export function ChamferFrame({ active = false, className, fill }: { active?: boolean; className?: string; fill?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-0 h-full w-full overflow-visible', className)}
    >
      <polygon
        points="14,0 100,0 100,86 86,100 0,100 0,14"
        fill={fill ?? (active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0)')}
        stroke={active ? 'rgba(0, 104, 162, 0.9)' : 'rgba(0, 104, 162, 0.25)'}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        className="transition-[stroke,fill] duration-300"
      />
    </svg>
  )
}
