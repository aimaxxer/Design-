import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { TenXCoinProps } from '@/coin/TenXCoin'
import { cn } from '@/lib/cn'

const TenXCoin = lazy(() => import('@/coin/TenXCoin').then((m) => ({ default: m.TenXCoin })))

/**
 * A glass coin that only builds its WebGL scene once it is about to scroll into view,
 * then fades in. Keeps the page to one live canvas at load (the hero row).
 */
export function LazyCoin({ className, style, onReady, ...props }: TenXCoinProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      {near && (
        <Suspense fallback={null}>
          <TenXCoin
            {...props}
            // TenXCoin sets an inline position, so the fill-the-box rule goes in style too.
            style={{ position: 'absolute', inset: 0, ...style }}
            className={cn(
              'transition-[opacity,transform] duration-700 ease-[var(--ease-out-strong)]',
              shown ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0',
            )}
            onReady={(coin) => {
              requestAnimationFrame(() => setShown(true))
              onReady?.(coin)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
