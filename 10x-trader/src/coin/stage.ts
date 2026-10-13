import * as THREE from 'three'
import { createStudioEnvironment, type CoinPreset } from './coin3d'

/**
 * Shared plumbing for the coin components: renderer, studio environment,
 * camera, a render loop that sleeps when nothing moves, pauses offscreen or
 * in a hidden tab, and respects prefers-reduced-motion.
 */

export interface StageHooks {
  /** Advance the scene. `animate` is false under prefers-reduced-motion. */
  step(dt: number, clock: number, animate: boolean): void
  /** Keep requesting frames while this returns true. */
  busy(animate: boolean): boolean
  /** Container size in CSS px; position the camera here. */
  resize(width: number, height: number): void
  /** First time the container scrolls into view. */
  firstVisible?(clock: number, animate: boolean): void
}

export interface Stage {
  readonly canvas: HTMLCanvasElement
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly clock: number
  animate(): boolean
  kick(): void
  resize(): void
  setEnvironment(preset: CoinPreset, tint: string): void
  setPixelRatioCap(cap: number): void
  setLabel(label: string): void
  raycast(e: PointerEvent, objects: THREE.Object3D[]): THREE.Intersection | undefined
  destroy(): void
}

export interface StageOptions {
  fov: number
  preset: CoinPreset
  tint: string
  maxPixelRatio: number
  label: string
}

/** Returns null when WebGL is unavailable, so the caller can show its SVG fallback. */
export function createStage(container: HTMLElement, opts: StageOptions, hooks: StageHooks): Stage | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)

  const canvas = renderer.domElement
  canvas.setAttribute('role', 'img')
  canvas.setAttribute('aria-label', opts.label)
  Object.assign(canvas.style, {
    display: 'block',
    width: '100%',
    height: '100%',
    touchAction: 'pan-y', // vertical swipes still scroll the page
    userSelect: 'none',
    webkitTapHighlightColor: 'transparent',
  })
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  let env = createStudioEnvironment(renderer, opts)
  scene.environment = env.texture

  const camera = new THREE.PerspectiveCamera(opts.fov, 1, 0.1, 200)
  let pixelRatioCap = opts.maxPixelRatio

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)')
  const animate = () => !reduceMQ.matches

  let clock = 0
  let raf = 0
  let last = 0
  let visible = false
  let seen = false

  function frame(now: number) {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    clock += dt
    hooks.step(dt, clock, animate())
    renderer.render(scene, camera)
    if (visible && !document.hidden && hooks.busy(animate())) raf = requestAnimationFrame(frame)
  }

  function kick() {
    if (raf || !visible || document.hidden) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    hooks.resize(w, h)
    camera.updateProjectionMatrix()
    kick()
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      if (visible && !seen) {
        seen = true
        hooks.firstVisible?.(clock, animate())
      }
      kick()
    },
    { rootMargin: '80px' },
  )
  io.observe(container)
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  document.addEventListener('visibilitychange', kick)
  reduceMQ.addEventListener('change', kick)

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()

  return {
    canvas,
    scene,
    camera,
    get clock() {
      return clock
    },
    animate,
    kick,
    resize,
    setEnvironment(preset, tint) {
      env.dispose()
      env = createStudioEnvironment(renderer, { preset, tint })
      scene.environment = env.texture
      kick()
    },
    setPixelRatioCap(cap) {
      pixelRatioCap = cap
      resize()
    },
    setLabel(label) {
      canvas.setAttribute('aria-label', label)
    },
    raycast(e, objects) {
      const r = canvas.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      return raycaster.intersectObjects(objects, false)[0]
    },
    destroy() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', kick)
      reduceMQ.removeEventListener('change', kick)
      env.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}

export interface DragTarget<T> {
  enabled(): boolean
  /** The coin under the pointer, or null. */
  pick(e: PointerEvent): T | null
  grab(target: T): void
  /** dx/dy in CSS px, dt in seconds. */
  drag(target: T, dx: number, dy: number, dt: number): void
  /** `flick` is true when the pointer was still moving at release. */
  release(target: T, flick: boolean): void
}

/** Pointer handling for coins on a stage: grab cursor on hover, capture while dragging. */
export function bindCoinDrag<T>(stage: Stage, t: DragTarget<T>): () => void {
  const canvas = stage.canvas
  let active: T | null = null
  let pointerId = -1
  let lastX = 0
  let lastY = 0
  let lastMoveAt = 0

  function down(e: PointerEvent) {
    if (!t.enabled() || active !== null || (e.pointerType === 'mouse' && e.button !== 0)) return
    const target = t.pick(e)
    if (target === null) return
    active = target
    pointerId = e.pointerId
    lastX = e.clientX
    lastY = e.clientY
    lastMoveAt = performance.now()
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      // synthetic or already-released pointer: dragging still works without capture
    }
    canvas.style.cursor = 'grabbing'
    t.grab(target)
    stage.kick()
  }

  function move(e: PointerEvent) {
    if (active === null) {
      if (t.enabled() && e.pointerType === 'mouse') canvas.style.cursor = t.pick(e) !== null ? 'grab' : ''
      return
    }
    if (e.pointerId !== pointerId) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    if (!dx && !dy) return
    lastX = e.clientX
    lastY = e.clientY
    const now = performance.now()
    const dt = Math.max((now - lastMoveAt) / 1000, 1 / 240)
    lastMoveAt = now
    t.drag(active, dx, dy, dt)
    stage.kick()
  }

  function up(e: PointerEvent) {
    if (active === null || e.pointerId !== pointerId) return
    const target = active
    active = null
    t.release(target, performance.now() - lastMoveAt <= 90)
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    canvas.style.cursor = e.type === 'pointerup' && e.pointerType === 'mouse' && t.pick(e) !== null ? 'grab' : ''
    stage.kick()
  }

  function leave() {
    if (active === null) canvas.style.cursor = ''
  }

  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  canvas.addEventListener('pointerleave', leave)
  return () => {
    canvas.removeEventListener('pointerdown', down)
    canvas.removeEventListener('pointermove', move)
    canvas.removeEventListener('pointerup', up)
    canvas.removeEventListener('pointercancel', up)
    canvas.removeEventListener('pointerleave', leave)
  }
}
