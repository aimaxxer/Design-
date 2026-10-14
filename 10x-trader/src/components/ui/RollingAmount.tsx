import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { formatUsd } from '@/lib/projection'

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * A dollar amount that rolls to each new value: the old figure lifts away as the new one rises in
 * (downward when the value falls), while the box eases to the new width. A framed amount clips the
 * roll to its frame; a bare one simply cross-fades, so the line box never changes height.
 */
export function RollingAmount({ value, className }: { value: number; className?: string }) {
  const text = formatUsd(value)
  const previous = useRef(value)
  const direction = value >= previous.current ? 1 : -1
  useEffect(() => {
    previous.current = value
  }, [value])

  // The width follows a hidden copy of the text, so it also corrects itself when the web font arrives.
  const measure = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number>()
  useEffect(() => {
    const el = measure.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <span className={cn('relative inline-block whitespace-nowrap', className)}>
      <span ref={measure} aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
        {text}
      </span>
      <span className="relative inline-flex overflow-x-clip transition-[width] duration-500 ease-[var(--ease-out-strong)]" style={{ width }}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.span
            key={text}
            custom={direction}
            variants={{
              enter: (d: number) => ({ y: `${d * 0.5}em`, opacity: 0 }),
              center: { y: '0em', opacity: 1 },
              exit: (d: number) => ({ y: `${d * -0.5}em`, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: EASE }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
