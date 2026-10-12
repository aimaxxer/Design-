/**
 * The 10X mark, traced from the 1600px brand file and snapped to exact
 * 180° symmetry. Units: centre (0, 0), half-height 1, y up.
 *
 *   main stroke  "\"  from top-left to bottom-right
 *   short stroke "/"  top-right, its lower tip touching the main stroke
 *   short stroke "/"  bottom-left (the top-right one rotated 180°)
 */
export type Pt = readonly [number, number]

const K = 0.734 // horizontal run per unit of drop (the stroke slant)
const W = 0.516 // horizontal width of the main stroke
const XR = 0.992 // half-width of the mark
const YB = 0.345 // height of the short strokes' inner edge

/**
 * @param gap pushes the short strokes off the main stroke (same units).
 *   The brand file has them touching at a single corner; a hairline gap
 *   keeps the cut-outs from sharing a vertex when the mark is extruded.
 */
export function tenXMark(gap = 0): Pt[][] {
  const main: Pt[] = [
    [-XR, 1],
    [-XR + W, 1],
    [XR, -1],
    [XR - W, -1],
  ]

  // Main stroke's right edge at y = YB; the short stroke's lower-left tip sits on it.
  const tipX = -XR + W + (1 - YB) * K
  const topLeft = tipX + (1 - YB) * K
  const width = XR - topLeft
  const n = Math.hypot(1, K)
  const ox = (gap * 1) / n
  const oy = (gap * K) / n

  const short: Pt[] = [
    [tipX + ox, YB + oy],
    [tipX + width + ox, YB + oy],
    [XR + ox, 1 + oy],
    [topLeft + ox, 1 + oy],
  ]
  const shortMirrored: Pt[] = short.map(([x, y]) => [-x, -y] as const)

  return [main, short, shortMirrored]
}

/** SVG path data for the mark, centred on (cx, cy) with the given half-height. */
export function tenXMarkPath(cx: number, cy: number, half: number, gap = 0): string {
  return tenXMark(gap)
    .map(
      (poly) =>
        poly
          .map(([x, y], i) => `${i ? 'L' : 'M'}${(cx + x * half).toFixed(3)} ${(cy - y * half).toFixed(3)}`)
          .join('') + 'Z',
    )
    .join('')
}
