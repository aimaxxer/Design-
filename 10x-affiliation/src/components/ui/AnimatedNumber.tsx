import { useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'

/**
 * A number that springs to each new value without re-rendering React on every frame:
 * the spring writes straight into the text node. Reduced motion jumps to the value.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number
  format: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const spring = useSpring(value, { stiffness: 140, damping: 26, mass: 0.6 })

  useEffect(() => {
    if (reduce) spring.jump(value)
    else spring.set(value)
  }, [value, reduce, spring])

  useEffect(() => spring.on('change', (v) => ref.current && (ref.current.textContent = format(v))), [spring, format])

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  )
}
