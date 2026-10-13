import * as THREE from 'three'
import {
  BRAND_BLUE,
  COIN_RADIUS,
  createCoin3D,
  createCoinMaterial,
  type Coin3D,
  type CoinFinish,
  type CoinPreset,
} from './coin3d'
import { coinSvg } from './fallback'
import { CoinMotion } from './motion'
import { bindCoinDrag, createStage } from './stage'

/**
 * The Money Talks hero conveyor with 10X coins: glass coins drifting across
 * on fixed lanes. A full pass takes 28s, each coin turns once per pass and
 * only wraps after it has fully left the screen. Drag spins one coin in
 * place while it keeps drifting along its lane.
 */

export interface TenXCoinRowOptions {
  /** 'blue' is single-hue 10X glass; 'iridescent' is the Money Talks rainbow glass. */
  preset?: CoinPreset
  /** Glass colour for the 'blue' preset (any CSS hex). */
  tint?: string
  /** 'mixed' alternates engraved and cut-through coins. */
  finish?: CoinFinish | 'mixed'
  /** Number of coins on the loop. */
  count?: number
  /** Seconds for one coin to cross the screen (and make one full turn). */
  passSeconds?: number
  direction?: 'left' | 'right'
  /** Front coin's diameter as a share of the container height (capped at 72% of its width). */
  size?: number
  /** Minimum distance between neighbours, in coin diameters. */
  spacing?: number
  /** Gentle vertical float, sin(t). */
  bob?: boolean
  /** Drag a coin to spin it (mouse, pen, horizontal touch). */
  interactive?: boolean
  maxPixelRatio?: number
  label?: string
}

export interface TenXCoinRowHandle {
  /** null when WebGL is unavailable and the SVG fallback is showing. */
  readonly canvas: HTMLCanvasElement | null
  update(options: TenXCoinRowOptions): void
  destroy(): void
}

const DEFAULTS: Required<TenXCoinRowOptions> = {
  preset: 'blue',
  tint: BRAND_BLUE,
  finish: 'engraved',
  count: 6,
  passSeconds: 28,
  direction: 'left',
  size: 0.86,
  spacing: 1.2,
  bob: true,
  interactive: true,
  maxPixelRatio: 1.75,
  label: 'Six 10X glass coins drifting across the screen.',
}

const TAU = Math.PI * 2
const FOV = 24
const TAN = Math.tan((FOV * Math.PI) / 360)
const MAX_WIDTH = 0.72 // coin diameter never exceeds 72% of the container width
const BOB = COIN_RADIUS * 0.053 // 0.16 world units on the spec's 3.0-radius coin
const EDGE = COIN_RADIUS * 1.08 // radius plus room for float and lean before a coin counts as offscreen

/**
 * Fixed lanes, in coin radii. z ≤ 0: the front lane sits at `size`, the rest recede.
 * `turn` offsets the spin: a coin looks alike every half turn, so they're spread
 * across 0–π (steps of π/6) to keep neighbours from going edge-on together.
 * `bob` offsets the float.
 */
const LANES = [
  { y: 0.02, z: 0, lean: -12, turn: 0, bob: 0 },
  { y: -0.07, z: -1.5, lean: 10, turn: (3 * Math.PI) / 6, bob: 1.1 },
  { y: 0.05, z: -0.5, lean: -6, turn: (1 * Math.PI) / 6, bob: 2.3 },
  { y: -0.04, z: -2.1, lean: 14, turn: (4 * Math.PI) / 6, bob: 3.0 },
  { y: 0.06, z: -0.25, lean: -15, turn: (2 * Math.PI) / 6, bob: 4.2 },
  { y: -0.03, z: -1.1, lean: 6, turn: (5 * Math.PI) / 6, bob: 5.1 },
]

interface Layout {
  width: number
  height: number
  diameterPx: number
  pxPerWorld: number
  /** camera distance */
  distance: number
  /** loop length (world units) shared by all coins */
  loop: number
  /** distance to cross the screen at the front lane */
  pass: number
}

function layoutRow(w: number, h: number, o: Required<TenXCoinRowOptions>): Layout {
  const diameterPx = Math.min(o.size * h, MAX_WIDTH * w)
  const pxPerWorld = diameterPx / (2 * COIN_RADIUS)
  const distance = h / pxPerWorld / 2 / TAN
  const halfWidthAt = (z: number) => (distance - z) * TAN * (w / h)
  let widest = 0
  for (let i = 0; i < o.count; i++) {
    const lane = LANES[i % LANES.length]
    widest = Math.max(widest, 2 * (halfWidthAt(lane.z * COIN_RADIUS) + EDGE))
  }
  return {
    width: w,
    height: h,
    diameterPx,
    pxPerWorld,
    distance,
    loop: Math.max(widest, o.count * 2 * COIN_RADIUS * o.spacing),
    pass: 2 * (halfWidthAt(0) + EDGE),
  }
}

/** Where coin i sits after `travel` passes. */
function placeCoin(i: number, travel: number, l: Layout, o: Required<TenXCoinRowOptions>) {
  const lane = LANES[i % LANES.length]
  const s = travel * l.pass + (i * l.loop) / o.count
  const u = ((s % l.loop) + l.loop) % l.loop
  const sgn = o.direction === 'left' ? 1 : -1
  return {
    lane,
    x: sgn * (l.loop / 2 - u),
    y: lane.y * COIN_RADIUS,
    z: lane.z * COIN_RADIUS,
    spin: -sgn * travel * TAU + lane.turn,
  }
}

interface RowCoin {
  root: THREE.Group // position + tumble
  spinG: THREE.Group
  hit: THREE.Object3D
  motion: CoinMotion
}

export function mountTenXCoinRow(container: HTMLElement, options: TenXCoinRowOptions = {}): TenXCoinRowHandle {
  let o: Required<TenXCoinRowOptions> = { ...DEFAULTS, ...options }
  let layout: Layout | null = null
  let travel = 0 // passes travelled so far
  let coins: RowCoin[] = []
  let built: { bases: Coin3D[]; materials: THREE.Material[] } = { bases: [], materials: [] }

  const stage = createStage(
    container,
    { fov: FOV, ...o },
    {
      step(dt, clock, animate) {
        if (!layout) return
        if (animate) travel += dt / o.passSeconds
        coins.forEach((c, i) => {
          const p = placeCoin(i, travel, layout!, o)
          const extra = c.motion.step(dt, clock, animate)
          const bob = o.bob && animate ? Math.sin(clock + p.lane.bob) * BOB : 0
          c.root.position.set(p.x, p.y + bob, p.z)
          c.root.quaternion.copy(c.motion.tumble)
          c.spinG.rotation.y = p.spin + c.motion.spin + extra
        })
      },
      busy: (animate) => animate || coins.some((c) => c.motion.dragging),
      resize(w, h) {
        layout = layoutRow(w, h, o)
        stage!.camera.position.set(0, 0, layout.distance)
      },
    },
  )
  if (!stage) return mountRowFallback(container, o)

  const group = new THREE.Group()
  stage.scene.add(group)

  function disposeCoins() {
    coins.forEach((c) => group.remove(c.root))
    built.bases.forEach((b) => b.dispose())
    built.materials.forEach((m) => m.dispose())
    coins = []
    built = { bases: [], materials: [] }
  }

  // One geometry set per finish, cloned; each coin gets its own material so the
  // iridescent film can drift per coin (same shader program, so it stays cheap).
  function buildCoins() {
    const prevMotions = coins.map((c) => c.motion)
    disposeCoins()
    const bases = new Map<CoinFinish, Coin3D>()
    for (let i = 0; i < o.count; i++) {
      const finish: CoinFinish = o.finish === 'mixed' ? (i % 2 ? 'cutout' : 'engraved') : o.finish
      let base = bases.get(finish)
      if (!base) {
        base = createCoin3D({ finish, preset: o.preset, tint: o.tint })
        bases.set(finish, base)
      }
      const material = createCoinMaterial(o.preset, i + 1, o.tint)
      built.materials.push(material)
      const coinGroup = base.group.clone()
      coinGroup.traverse((m) => {
        if (m instanceof THREE.Mesh && m.name !== 'hit') m.material = material
      })

      const lane = LANES[i % LANES.length]
      const root = new THREE.Group()
      const tiltG = new THREE.Group()
      const spinG = new THREE.Group()
      tiltG.rotation.set(0.1, 0, (-lane.lean * Math.PI) / 180)
      root.add(tiltG)
      tiltG.add(spinG)
      spinG.add(coinGroup)
      group.add(root)
      coins.push({ root, spinG, hit: coinGroup.getObjectByName('hit')!, motion: prevMotions[i] ?? new CoinMotion() })
    }
    built.bases = [...bases.values()]
  }
  buildCoins()

  const radiusPx = () => (layout ? layout.diameterPx / 2 : 1)
  const unbind = bindCoinDrag<RowCoin>(stage, {
    enabled: () => o.interactive,
    pick(e) {
      const hit = stage.raycast(
        e,
        coins.map((c) => c.hit),
      )
      return hit ? (coins.find((c) => c.hit === hit.object) ?? null) : null
    },
    grab: (c) => c.motion.grab(),
    drag: (c, dx, dy, dt) => c.motion.drag((dx * 0.9) / radiusPx(), (dy * 0.9) / radiusPx(), dt),
    release: (c, flick) => c.motion.release(stage.clock, flick && stage.animate()),
  })
  stage.resize()

  return {
    canvas: stage.canvas,
    update(next) {
      const prev = o
      o = { ...o, ...next }
      if (o.preset !== prev.preset || o.tint !== prev.tint) stage.setEnvironment(o.preset, o.tint)
      if (o.preset !== prev.preset || o.tint !== prev.tint || o.finish !== prev.finish || o.count !== prev.count)
        buildCoins()
      if (o.label !== prev.label) stage.setLabel(o.label)
      if (o.maxPixelRatio !== prev.maxPixelRatio) stage.setPixelRatioCap(o.maxPixelRatio)
      else if (o.size !== prev.size || o.spacing !== prev.spacing || o.count !== prev.count) stage.resize()
      if (!o.interactive) stage.canvas.style.cursor = ''
      stage.kick()
    },
    destroy() {
      unbind()
      disposeCoins()
      stage.destroy()
    },
  }
}

/** No WebGL: the same coins as flat SVG discs, frozen at their starting positions. */
function mountRowFallback(container: HTMLElement, initial: Required<TenXCoinRowOptions>): TenXCoinRowHandle {
  let o = initial
  const el = document.createElement('div')
  el.setAttribute('role', 'img')
  el.setAttribute('aria-label', o.label)
  el.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden'

  function render() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    const l = layoutRow(w, h, o)
    let html = ''
    // back to front so nearer coins overlap farther ones
    const order = [...Array(o.count).keys()].sort(
      (a, b) => LANES[a % LANES.length].z - LANES[b % LANES.length].z,
    )
    for (const i of order) {
      const p = placeCoin(i, 0, l, o)
      const scale = l.distance / (l.distance - p.z)
      const size = l.diameterPx * scale
      const cx = w / 2 + p.x * l.pxPerWorld * scale
      const cy = h / 2 - p.y * l.pxPerWorld * scale
      html += `<div style="position:absolute;left:${cx - size / 2}px;top:${cy - size / 2}px;width:${size}px;height:${size}px;transform:rotate(${p.lane.lean}deg)">${coinSvg(o.preset, 1, o.tint)}</div>`
    }
    el.innerHTML = html
  }

  container.appendChild(el)
  const ro = new ResizeObserver(render)
  ro.observe(container)
  render()

  return {
    canvas: null,
    update(next) {
      o = { ...o, ...next }
      el.setAttribute('aria-label', o.label)
      render()
    },
    destroy() {
      ro.disconnect()
      el.remove()
    },
  }
}
