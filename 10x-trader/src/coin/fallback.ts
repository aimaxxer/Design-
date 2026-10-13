import { BRAND_BLUE, type CoinPreset } from './coin3d'
import { tenXMarkPath } from './logo'

/**
 * Flat SVG glass coin with the 10X cut-out. Used when WebGL is unavailable,
 * and handy as a preloader or favicon-sized stand-in.
 * Iridescent stops are the Money Talks preloader coin's; blue is built from the tint.
 */
const IRIDESCENT = {
  face: ['#152c37', '#80d2f0', '#e7e8ff', '#7954b9', '#10202e', '#c4eeff'],
  rim: ['#d9f8ff', '#5c6ec0', '#faf6ff', '#b175dd', '#8fdbec'],
}

/** Mix a hex colour toward black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16)
  const target = amount < 0 ? 0 : 255
  const a = Math.abs(amount)
  const ch = (v: number) => Math.round(v + (target - v) * a).toString(16).padStart(2, '0')
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`
}

function stopsFor(preset: CoinPreset, tint: string) {
  if (preset === 'iridescent') return IRIDESCENT
  return {
    face: [shade(tint, -0.8), tint, shade(tint, 0.82), shade(tint, -0.3), shade(tint, -0.86), shade(tint, 0.5)],
    rim: [shade(tint, 0.85), shade(tint, -0.35), shade(tint, 0.94), tint, shade(tint, 0.45)],
  }
}

let uid = 0

/** @param fill coin diameter as a fraction of the 100×100 viewBox */
export function coinSvg(preset: CoinPreset = 'blue', fill = 0.92, tint = BRAND_BLUE): string {
  const id = `tenx-coin-${++uid}`
  const { face, rim } = stopsFor(preset, tint)
  const r = 50 * fill
  const stops = (list: string[]) =>
    list.map((c, i) => `<stop offset="${(i / (list.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('')
  const disc = `M${50 - r} 50a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
  const mark = tenXMarkPath(50, 50, r * 0.5, 0.03)

  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}-f" x1="0.12" y1="0.05" x2="0.88" y2="0.95">${stops(face)}</linearGradient>
    <linearGradient id="${id}-r" x1="0" y1="0" x2="1" y2="1">${stops(rim)}</linearGradient>
  </defs>
  <path d="${disc}${mark}" fill="url(#${id}-f)" fill-rule="evenodd"/>
  <path d="${disc}" fill="none" stroke="url(#${id}-r)" stroke-width="${(r * 0.045).toFixed(2)}"/>
  <path d="${mark}" fill="none" stroke="url(#${id}-r)" stroke-width="${(r * 0.02).toFixed(2)}" stroke-linejoin="round" opacity="0.8"/>
</svg>`
}
