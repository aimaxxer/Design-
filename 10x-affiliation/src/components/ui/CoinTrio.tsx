import { useEffect, useRef, useState } from 'react'
import { useScrollContext } from '@/providers/ScrollProvider'
import { cn } from '@/lib/cn'

/**
 * The 10X Trader coins. The poster (a still of the same scene) shows first; three.js only loads
 * when the panel nears the viewport, then the live coins cross-fade in over it from the same pose.
 * Without WebGL the poster simply stays.
 */
export function CoinTrio({ poster, label, className }: { poster: string; label: string; className?: string }) {
  const { scroller } = useScrollContext()
  const wrap = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      root: scroller,
      rootMargin: '600px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [scroller])

  useEffect(() => {
    if (!near || !host.current) return
    let handle: { destroy(): void } | null = null
    let cancelled = false
    import('@/coin/trio').then(({ mountCoinTrio }) => {
      if (cancelled || !host.current) return
      handle = mountCoinTrio(host.current, { label, onReady: () => !cancelled && setLive(true) })
    })
    return () => {
      cancelled = true
      handle?.destroy()
    }
  }, [near, label])

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <img
        src={poster}
        alt={live ? '' : label}
        loading="lazy"
        decoding="async"
        className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', live && 'opacity-0')}
      />
      <div
        ref={host}
        className={cn('absolute inset-0 transition-opacity duration-500', live ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
