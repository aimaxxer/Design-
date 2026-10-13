import { useEffect, useRef, type CSSProperties } from 'react'
import { mountTenXCoinRow, type TenXCoinRowHandle, type TenXCoinRowOptions } from './row'

export interface TenXCoinRowProps extends TenXCoinRowOptions {
  className?: string
  style?: CSSProperties
  onReady?: (row: TenXCoinRowHandle) => void
}

/**
 * <TenXCoinRow className="h-[440px] w-full" />
 * Six 10X coins drifting right to left. Give the wrapper a height; the coins
 * size themselves to it (front coin = 86% of the height, capped at 72% of the width).
 */
export function TenXCoinRow({ className, style, onReady, ...options }: TenXCoinRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const handle = useRef<TenXCoinRowHandle | null>(null)
  const latest = useRef(options)
  latest.current = options

  useEffect(() => {
    const row = mountTenXCoinRow(ref.current!, latest.current)
    handle.current = row
    onReady?.(row)
    return () => {
      row.destroy()
      handle.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { preset, tint, finish, count, passSeconds, direction, size, spacing, bob, interactive, maxPixelRatio, label } =
    options
  useEffect(() => {
    handle.current?.update(latest.current)
  }, [preset, tint, finish, count, passSeconds, direction, size, spacing, bob, interactive, maxPixelRatio, label])

  return <div ref={ref} className={className} style={{ position: 'relative', ...style }} />
}
