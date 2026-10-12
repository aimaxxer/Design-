import * as THREE from 'three'
import { BRAND_BLUE, COIN_RADIUS, createCoin3D, type Coin3D } from './coin3d'
import { CoinMotion } from './motion'
import { bindCoinDrag, createStage } from './stage'

/**
 * Three 10X coins for the 10X Trader panel: the coin, studio and stage from the 10x-trader
 * project, unchanged; only the placement and the idle motion live here. The idle motion is a
 * gentle rock in place: the three coins sway left-right and tip forward-back together in a 3.2s
 * loop (a little out of step), so the studio light sweeps across their faces, and they float a
 * touch. Each coin can be dragged to spin; it then eases back to face front and rocks on.
 *
 * The first frame is framed exactly like public/images/coins-trader.webp (the poster underneath),
 * so the canvas can cross-fade in over it without a jump.
 */

const TAU = Math.PI * 2
const FOV = 24
/** Where the coins sit in the square poster: left, top, right, bottom (0-1). */
const BOX = [0.13, 0.24, 0.87, 0.76] as const
/** Rock loop length (s) and its amplitudes (radians): sway about the vertical, tip about the horizontal, roll. */
const ROCK_PERIOD = 3.2
const SWAY = 0.24 // ~14 deg
const TIP = 0.14 // ~8 deg
const ROLL = 0.06 // ~3.5 deg
/** The rock grows in over the first second, so the first frame is exactly the poster. */
const EASE_IN = 0.8

type Vec3 = [number, number, number]
/** Position, size and pose of each coin (the poster's layout), and its offset in the rock loop (radians). */
const COINS: { pos: Vec3; scale: number; rot: Vec3; phase: number }[] = [
  { pos: [-2.25, -0.75, 0.2], scale: 0.86, rot: [0.1, 0.78, -0.22], phase: 0 },
  { pos: [-0.15, 0.7, -0.6], scale: 0.96, rot: [0.1, -0.3, 0.06], phase: 0.45 },
  { pos: [2.05, -0.15, 0.4], scale: 1.08, rot: [0.1, -0.42, 0.16], phase: 0.9 },
]

export interface CoinTrioHandle {
  destroy(): void
}

/** Returns null when WebGL is unavailable, so the caller keeps its poster. */
export function mountCoinTrio(container: HTMLElement, opts: { label: string; onReady?: () => void }): CoinTrioHandle | null {
  // float (bob, drag tumble) → rock (the idle sway) → pose (the poster's rotation) → spin (drag)
  const rigs = COINS.map((c, i) => {
    const float = new THREE.Group()
    const rock = new THREE.Group()
    const pose = new THREE.Group()
    const spinG = new THREE.Group()
    float.position.set(...c.pos)
    float.scale.setScalar(c.scale)
    pose.rotation.set(...c.rot)
    float.add(rock)
    rock.add(pose)
    pose.add(spinG)
    const coin: Coin3D = createCoin3D({ finish: 'engraved', preset: 'blue', tint: BRAND_BLUE, seed: i })
    spinG.add(coin.group)
    return { c, float, rock, spinG, coin, motion: new CoinMotion() }
  })

  // Frame the starting pose the way the poster was rendered: fit the coins into BOX of a square view.
  const framing = (() => {
    const scene = new THREE.Scene()
    rigs.forEach((r) => scene.add(r.float))
    const cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
    cam.position.set(0, 0.2, 12.5)
    cam.lookAt(0, 0, 0)
    const bounds = () => {
      scene.updateMatrixWorld(true)
      cam.updateMatrixWorld(true)
      cam.updateProjectionMatrix()
      const min = new THREE.Vector2(Infinity, Infinity)
      const max = new THREE.Vector2(-Infinity, -Infinity)
      const v = new THREE.Vector3()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh || !m.visible) return
        const pos = m.geometry.attributes.position
        for (let i = 0; i < pos.count; i += 5) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).project(cam)
          min.set(Math.min(min.x, v.x), Math.min(min.y, v.y))
          max.set(Math.max(max.x, v.x), Math.max(max.y, v.y))
        }
      })
      return { min, max }
    }
    let b = bounds()
    cam.zoom = Math.min(((BOX[2] - BOX[0]) * 2) / (b.max.x - b.min.x), ((BOX[3] - BOX[1]) * 2) / (b.max.y - b.min.y))
    b = bounds()
    const cx = ((b.min.x + b.max.x) / 2 + 1) / 2
    const cy = (1 - (b.min.y + b.max.y) / 2) / 2
    rigs.forEach((r) => scene.remove(r.float))
    return { zoom: cam.zoom, dx: cx - (BOX[0] + BOX[2]) / 2, dy: cy - (BOX[1] + BOX[3]) / 2 }
  })()

  let radiusPx = 1
  const bob = COIN_RADIUS * 0.052

  const stage = createStage(
    container,
    { fov: FOV, preset: 'blue', tint: BRAND_BLUE, maxPixelRatio: 1.75, label: opts.label },
    {
      step(dt, clock, animate) {
        const ease = animate ? 1 - Math.exp(-clock / EASE_IN) : 0
        for (const r of rigs) {
          // After a drag, ease back to face front (the nearest whole turn) while any flick dies down.
          if (!r.motion.dragging) r.motion.spin += (Math.round(r.motion.spin / TAU) * TAU - r.motion.spin) * (1 - Math.exp(-dt * 2.5))
          const extra = r.motion.step(dt, clock, animate)
          r.spinG.rotation.y = r.motion.spin + extra
          r.float.quaternion.copy(r.motion.tumble)
          // Sway and tip a quarter-loop apart, so each coin's face traces a small ellipse and the light sweeps across it.
          const a = (clock * TAU) / ROCK_PERIOD + r.c.phase
          r.rock.rotation.set(Math.cos(a) * TIP * ease, Math.sin(a) * SWAY * ease, Math.sin(a + 1) * ROLL * ease)
          r.float.position.y = r.c.pos[1] + Math.sin(a + 0.6) * bob * r.c.scale * ease
        }
      },
      busy: (animate) => animate || rigs.some((r) => !r.motion.settled),
      resize(w, h) {
        // A square view as tall as the box, cropped to its width: the same crop object-cover gives the poster.
        const cam = stage!.camera
        cam.position.set(0, 0.2, 12.5)
        cam.lookAt(0, 0, 0)
        cam.aspect = 1
        cam.zoom = framing.zoom
        cam.setViewOffset(h, h, framing.dx * h + (h - w) / 2, framing.dy * h, w, h)
        radiusPx = (COIN_RADIUS * h * framing.zoom) / (2 * 12.5 * Math.tan((FOV * Math.PI) / 360))
      },
    },
  )
  if (!stage) {
    rigs.forEach((r) => r.coin.dispose())
    return null
  }

  rigs.forEach((r) => stage.scene.add(r.float))
  const hits = rigs.map((r) => r.coin.hit)
  const unbind = bindCoinDrag(stage, {
    enabled: () => true,
    pick: (e) => {
      const hit = stage.raycast(e, hits)
      return hit ? (rigs.find((r) => r.coin.hit === hit.object) ?? null) : null
    },
    grab: (r) => r.motion.grab(),
    drag: (r, dx, dy, dt) => r.motion.drag((dx * 0.9) / (radiusPx * r.c.scale), (dy * 0.9) / (radiusPx * r.c.scale), dt),
    release: (r, flick) => r.motion.release(stage.clock, flick && stage.animate()),
  })
  stage.resize()
  // Two frames: the stage has drawn its first frame before the caller fades it in.
  requestAnimationFrame(() => requestAnimationFrame(() => opts.onReady?.()))

  return {
    destroy() {
      unbind()
      rigs.forEach((r) => r.coin.dispose())
      stage.destroy()
    },
  }
}
