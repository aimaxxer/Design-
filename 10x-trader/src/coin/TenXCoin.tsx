import { useEffect, useRef, type CSSProperties } from 'react'
import { mountTenXCoin, type TenXCoinHandle, type TenXCoinOptions } from './mount'

export interface TenXCoinProps extends TenXCoinOptions {
  className?: string
  style?: CSSProperties
  /** Receives the imperative handle, e.g. to call spin() from a scroll trigger. */
  onReady?: (coin: TenXCoinHandle) => void
}

/**
 * <TenXCoin className="h-[520px]" preset="blue" finish="engraved" />
 * The coin fills its box, so give the wrapper a height.
 */
export function TenXCoin({ className, style, onReady, ...options }: TenXCoinProps) {
  const ref = useRef<HTMLDivElement>(null)
  const handle = useRef<TenXCoinHandle | null>(null)
  const latest = useRef(options)
  latest.current = options

  useEffect(() => {
    const coin = mountTenXCoin(ref.current!, latest.current)
    handle.current = coin
    onReady?.(coin)
    return () => {
      coin.destroy()
      handle.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { preset, tint, finish, spinPeriod, introSpin, bob, tilt, fill, interactive, seed, maxPixelRatio, label } = options
  useEffect(() => {
    handle.current?.update(latest.current)
  }, [preset, tint, finish, spinPeriod, introSpin, bob, tilt, fill, interactive, seed, maxPixelRatio, label])

  return <div ref={ref} className={className} style={{ position: 'relative', ...style }} />
}
