import * as THREE from 'three'
import { BRAND_BLUE, COIN_RADIUS, createCoin3D, type CoinFinish, type CoinPreset } from './coin3d'
import { coinSvg } from './fallback'
import { CoinMotion } from './motion'
import { bindCoinDrag, createStage } from './stage'

export interface TenXCoinOptions {
  /** 'blue' is single-hue 10X glass; 'iridescent' is the Money Talks rainbow glass. */
  preset?: CoinPreset
  /** Glass colour for the 'blue' preset (any CSS hex). */
  tint?: string
  /** 'engraved' recesses the mark; 'cutout' cuts it clean through. */
  finish?: CoinFinish
  /** Seconds per idle turn. 0 = no idle spin. */
  spinPeriod?: number
  /** One full smoothstep turn (1.6s) the first time the coin scrolls into view. */
  introSpin?: boolean
  /** Gentle vertical float (sin(t), 5% of the radius). */
  bob?: boolean
  /** Lean of the spin axis in degrees, CSS sense (negative leans left). */
  tilt?: number
  /** Coin diameter as a fraction of the container's shorter side. */
  fill?: number
  /** Drag (mouse, pen, horizontal touch) to rotate. */
  interactive?: boolean
  /** Varies the iridescent film slightly between instances. */
  seed?: number
  maxPixelRatio?: number
  label?: string
}

export interface TenXCoinHandle {
  /** null when WebGL is unavailable and the SVG fallback is showing. */
  readonly canvas: HTMLCanvasElement | null
  update(options: TenXCoinOptions): void
  /** Extra turns on top of the idle spin, eased with smoothstep. */
  spin(turns?: number, seconds?: number): void
  destroy(): void
}

const DEFAULTS: Required<TenXCoinOptions> = {
  preset: 'blue',
  tint: BRAND_BLUE,
  finish: 'engraved',
  spinPeriod: 14,
  introSpin: true,
  bob: true,
  tilt: -12,
  fill: 0.78,
  interactive: true,
  seed: 0,
  maxPixelRatio: 1.75,
  label: 'The 10X glass coin, slowly rotating on its axis.',
}

const TAU = Math.PI * 2
const BOB = COIN_RADIUS * 0.052
const FOV = 24

export function mountTenXCoin(container: HTMLElement, options: TenXCoinOptions = {}): TenXCoinHandle {
  let o: Required<TenXCoinOptions> = { ...DEFAULTS, ...options }
  const motion = new CoinMotion()
  let radiusPx = 1

  // root: float + tumble → tilt: leaned spin axis → spin: idle turn
  const root = new THREE.Group()
  const tiltG = new THREE.Group()
  const spinG = new THREE.Group()
  root.add(tiltG)
  tiltG.add(spinG)
  const applyTilt = () => tiltG.rotation.set(0.1, 0, (-o.tilt * Math.PI) / 180)
  applyTilt()

  const stage = createStage(
    container,
    { fov: FOV, ...o },
    {
      step(dt, clock, animate) {
        if (animate && o.spinPeriod > 0) motion.spin += (dt * TAU) / o.spinPeriod
        const extra = motion.step(dt, clock, animate)
        root.quaternion.copy(motion.tumble)
        root.position.y = o.bob && animate ? Math.sin(clock) * BOB : 0
        spinG.rotation.y = motion.spin + extra
      },
      busy: (animate) => motion.dragging || (animate && (o.spinPeriod > 0 || o.bob || !motion.settled)),
      resize(w, h) {
        const minDim = Math.min(w, h)
        radiusPx = (o.fill * minDim) / 2
        const worldPerPx = (COIN_RADIUS * 2) / (o.fill * minDim)
        stage!.camera.position.set(0, 0, (h * worldPerPx) / 2 / Math.tan((FOV * Math.PI) / 360))
      },
      firstVisible(clock, animate) {
        if (o.introSpin && animate) motion.turn(1, 1.6, clock, true)
      },
    },
  )
  if (!stage) return mountFallback(container, o)

  stage.scene.add(root)
  let coin = createCoin3D(o)
  spinG.add(coin.group)

  const unbind = bindCoinDrag(stage, {
    enabled: () => o.interactive,
    pick: (e) => (stage.raycast(e, [coin.hit]) ? coin : null),
    grab: () => motion.grab(),
    drag: (_, dx, dy, dt) => motion.drag((dx * 0.9) / radiusPx, (dy * 0.9) / radiusPx, dt),
    release: (_, flick) => motion.release(stage.clock, flick && stage.animate()),
  })
  stage.resize()

  return {
    canvas: stage.canvas,
    update(next) {
      const prev = o
      o = { ...o, ...next }
      if (o.preset !== prev.preset || o.tint !== prev.tint) stage.setEnvironment(o.preset, o.tint)
      if (o.finish !== prev.finish || o.preset !== prev.preset || o.seed !== prev.seed || o.tint !== prev.tint) {
        spinG.remove(coin.group)
        coin.dispose()
        coin = createCoin3D(o)
        spinG.add(coin.group)
      }
      if (o.tilt !== prev.tilt) applyTilt()
      if (o.label !== prev.label) stage.setLabel(o.label)
      if (o.maxPixelRatio !== prev.maxPixelRatio) stage.setPixelRatioCap(o.maxPixelRatio)
      else if (o.fill !== prev.fill) stage.resize()
      if (!o.interactive) stage.canvas.style.cursor = ''
      stage.kick()
    },
    spin(turns = 1, seconds = 1.6) {
      motion.turn(turns, seconds, stage.clock, stage.animate())
      stage.kick()
    },
    destroy() {
      unbind()
      coin.dispose()
      stage.destroy()
    },
  }
}

function mountFallback(container: HTMLElement, initial: Required<TenXCoinOptions>): TenXCoinHandle {
  let o = initial
  const el = document.createElement('div')
  el.setAttribute('role', 'img')
  el.setAttribute('aria-label', o.label)
  el.style.cssText = 'width:100%;height:100%;display:grid;place-items:center'
  const render = () => (el.innerHTML = coinSvg(o.preset, o.fill, o.tint))
  render()
  container.appendChild(el)
  return {
    canvas: null,
    update(next) {
      o = { ...o, ...next }
      el.setAttribute('aria-label', o.label)
      render()
    },
    spin() {},
    destroy() {
      el.remove()
    },
  }
}
