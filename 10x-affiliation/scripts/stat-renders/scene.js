// Stat card renders for 10X Affiliation. ?scene=coins|orbit&palette=site|champagne&size=3200&box=l,t,r,b
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json'

const q = new URLSearchParams(location.search)
const SCENE = q.get('scene') || 'coins'
const PALETTE = q.get('palette') || 'site'
const SIZE = Number(q.get('size') || 1600)

const PALETTES = {
  site: {
    bg: '#eff2f1',
    chrome: '#e4ebee',
    glass: '#eaf8fd',
    glassDeep: '#2aa6d6',
    accent: '#066377',
    cool: '#4bbdf0',
    warm: '#f08a4b',
    shadow: '#16323f',
  },
  champagne: {
    bg: '#f2eee9',
    chrome: '#e6d8c6',
    glass: '#fbf5ee',
    glassDeep: '#b8946c',
    accent: '#7a604b',
    cool: '#d9c3a3',
    warm: '#f0b47a',
    shadow: '#3a2c20',
  },
}
const P = PALETTES[PALETTE]

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.setSize(SIZE, SIZE)
renderer.toneMapping = THREE.NeutralToneMapping
renderer.toneMappingExposure = 1.0
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(P.bg)

/* ------------------------------------------------------------------ lighting */
// A studio of soft boxes and strip lights, baked into an environment map: chrome and glass
// read entirely from what they reflect, so this is where the look comes from.
function studio() {
  const s = new THREE.Scene()
  s.background = new THREE.Color('#d9dee0').multiplyScalar(0.95)
  const panel = (w, h, color, intensity, pos) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    s.add(m)
  }
  const gradPanel = (w, h, intensity, pos) => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const g = c.getContext('2d')
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.55, '#9da4a8')
    grad.addColorStop(1, '#3a3f42')
    g.fillStyle = grad
    g.fillRect(0, 0, 4, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1, 1, 1).multiplyScalar(intensity), side: THREE.DoubleSide }),
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    s.add(m)
  }
  gradPanel(26, 14, 2.6, [0, 7, -9]) // high back wall: soft falloff on coin faces and block tops
  panel(10, 10, '#ffffff', 2.4, [0, 10, 0]) // overhead softbox
  panel(1.4, 14, '#ffffff', 9, [-7, 2, 3]) // left strip: the long white streaks
  panel(1.0, 14, '#ffffff', 7, [7, 3, 1]) // right strip
  panel(24, 1.6, '#000000', 1, [0, 0.4, -9]) // black horizon band: gives chrome its dark core line
  panel(1.2, 14, '#000000', 1, [-3.5, 1, 8]) // black flag behind camera, left
  panel(1.2, 14, '#000000', 1, [4.5, 1, 8]) // black flag behind camera, right
  panel(8, 3, P.cool, 4, [-6, 1.5, -5]) // tinted panel
  panel(2.2, 2.2, P.warm, 3.2, [7, -1.5, 3]) // warm kicker for the copper edge
  panel(9, 6, '#ffffff', 1.5, [3, 5, 12]) // front softbox behind the camera
  panel(30, 8, '#ffffff', 1.1, [0, -7, 0]) // bounce from the floor
  return s
}
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(studio(), 0.015).texture
scene.environmentIntensity = 1.0

/* ----------------------------------------------------------------- materials */
const chrome = new THREE.MeshPhysicalMaterial({
  color: P.chrome,
  metalness: 1,
  roughness: 0.06,
  iridescence: PALETTE === 'site' ? 0.3 : 0.0,
  iridescenceIOR: 1.6,
  iridescenceThicknessRange: [180, 420],
})
const glass = new THREE.MeshPhysicalMaterial({
  color: P.glass,
  metalness: 0,
  roughness: 0.02,
  transmission: 1,
  thickness: 0.9,
  ior: 1.52,
  dispersion: 0.6,
  attenuationColor: new THREE.Color(P.glassDeep),
  attenuationDistance: 2.6,
  specularIntensity: 1,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
})
const satinFace = chrome.clone()
satinFace.roughness = 0.2
const accent = new THREE.MeshPhysicalMaterial({
  color: P.accent,
  metalness: 0.2,
  roughness: 0.22,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
})
/* -------------------------------------------------------------- soft shadows */
function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(0.45, 'rgba(0,0,0,0.45)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const shadowTex = shadowTexture()
const sun = new THREE.DirectionalLight('#ffffff', 1.1)
sun.position.set(-2.5, 12, 4)
sun.castShadow = true
sun.shadow.mapSize.set(4096, 4096)
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 })
sun.shadow.radius = 22
sun.shadow.blurSamples = 25
sun.shadow.bias = -0.0004
scene.add(sun)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ color: P.shadow, opacity: 0.2 }))
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

function shadow(x, z, sx, sz, opacity = 0.22) {
  opacity *= 0.55
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTex, color: P.shadow, transparent: true, opacity, depthWrite: false, toneMapped: false }),
  )
  m.rotation.x = -Math.PI / 2
  m.position.set(x, 0.002, z)
  m.scale.set(sx, sz, 1)
  scene.add(m)
  if (sx > 1.5) shadow(x - 0.15, z - 0.1, sx * 0.55, sz * 0.55, opacity * 1.1)
}

// Deterministic jitter so every render of a scene is identical.
let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

/* --------------------------------------------------------------------- coins */
function coinGeometry() {
  // Lathe profile: flat face, a raised rim, rounded edge.
  const p = [
    [0, 0.066],
    [0.8, 0.066],
    [0.84, 0.09],
    [0.955, 0.09],
    [0.99, 0.075],
    [1.0, 0.05],
    [1.0, -0.05],
    [0.99, -0.075],
    [0.955, -0.09],
    [0.84, -0.09],
    [0.8, -0.066],
    [0, -0.066],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(p.reverse(), 160)
}

function coinsScene() {
  const coin = coinGeometry()
  const stacks = [
    { x: -2.5, z: 0.9, n: 3 },
    { x: 0, z: 0, n: 6 },
    { x: 2.5, z: -0.9, n: 10 },
  ]
  for (const s of stacks) {
    for (let i = 0; i < s.n; i++) {
      const m = new THREE.Mesh(coin, chrome)
      if (i === s.n - 1) {
        const face = new THREE.Mesh(new THREE.CircleGeometry(0.8, 96), satinFace)
        face.rotation.x = -Math.PI / 2
        face.position.y = 0.0665
        m.add(face)
      }
      m.position.set(s.x + (rand() - 0.5) * 0.08, 0.09 + i * 0.182, s.z + (rand() - 0.5) * 0.08)
      m.rotation.y = rand() * Math.PI
      scene.add(m)
    }
    shadow(s.x + 0.25, s.z + 0.2, 3.1, 2.4, 0.2)
  }

  // The hero coin stands on its edge in front of the stacks, a "$" struck into both faces.
  const hero = new THREE.Group()
  const face = new THREE.Mesh(coin, glass)
  face.rotation.x = Math.PI / 2
  hero.add(face)
  const font = new FontLoader().parse(fontJson)
  const glyph = new TextGeometry('$', { font, size: 0.95, depth: 0.07, curveSegments: 24, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3 })
  glyph.center()
  const front = new THREE.Mesh(glyph, accent)
  front.position.z = 0.068 + 0.05
  hero.add(front)
  const back = new THREE.Mesh(glyph, accent)
  back.position.z = -0.068 - 0.05
  back.rotation.y = Math.PI
  hero.add(back)
  hero.scale.setScalar(1.15)
  hero.position.set(-1.05, 1.15, 2.2)
  hero.rotation.set(-0.08, -0.5, 0.12)
  scene.add(hero)
  shadow(-0.9, 2.35, 2.4, 1.0, 0.24)

  // A rising line over the stacks, ending in an arrowhead.
  const pts = [
    [-3.9, 1.0, 1.45],
    [-2.5, 1.85, 0.9],
    [-1.25, 1.45, 0.45],
    [0, 2.55, 0],
    [1.25, 2.2, -0.45],
    [2.85, 3.75, -1.0],
  ].map((v) => new THREE.Vector3(...v))
  const path = new THREE.CurvePath()
  for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]))
  const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 400, 0.09, 24, false), accent)
  scene.add(tube)
  for (const p of pts.slice(0, -1)) {
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), accent)
    joint.position.copy(p)
    scene.add(joint)
  }
  const dir = pts.at(-1).clone().sub(pts.at(-2)).normalize()
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.55, 48), accent)
  head.position.copy(pts.at(-1)).addScaledVector(dir, 0.2)
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  scene.add(head)

  return { target: new THREE.Vector3(0, 1.55, 0.2), camPos: new THREE.Vector3(5.2, 5.6, 11.5), fov: 30, shiftX: -0.16, shiftY: 0.15 }
}

/* ---------------------------------------------------------------------- mark */
function logoGeometry() {
  const d =
    'M95 282L205 212H294V658H200V302L95 366Z M557 206C669.2 206 738 293.8 738 437C738 580.2 669.2 668 557 668C444.8 668 376 580.2 376 437C376 293.8 444.8 206 557 206Z M557 284C607.4 284 641 345.2 641 437C641 528.8 607.4 590 557 590C506.6 590 473 528.8 473 437C473 345.2 506.6 284 557 284Z M773 204H889L1215 650H1101Z M1101 204H1215L1107 350H996Z M878 507H995L889 650H773Z'
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="95 204 1120 464"><path fill-rule="evenodd" d="${d}"/></svg>`)
  const shapes = svg.paths.flatMap((p) => SVGLoader.createShapes(p))
  const g = new THREE.ExtrudeGeometry(shapes, { depth: 90, bevelEnabled: true, bevelThickness: 14, bevelSize: 10, bevelSegments: 4, curveSegments: 32 })
  g.center()
  g.scale(1 / 560, 1 / 560, 1 / 560) // ~2 units wide
  g.rotateX(Math.PI) // SVG's y points down; a rotation (not a mirror) keeps the faces facing out
  return g
}


/* --------------------------------------------------------------------- orbit */
function orbitScene() {
  const coin = coinGeometry()
  const centre = new THREE.Vector3(0, 2.0, 0)

  // The deposit: one large glass coin, the 10X mark struck into its face in chrome.
  const hero = new THREE.Group()
  const face = new THREE.Mesh(coin, glass)
  face.rotation.x = Math.PI / 2
  hero.add(face)
  const mark = logoGeometry()
  const front = new THREE.Mesh(mark, accent)
  front.scale.set(0.62, 0.62, 0.45)
  front.position.z = 0.068 + 0.05
  hero.add(front)
  hero.scale.setScalar(1.45)
  hero.position.copy(centre)
  hero.rotation.set(-0.05, -0.38, 0.06)
  scene.add(hero)

  // What it earns: smaller chrome coins riding a thin tilted orbit.
  const orbit = new THREE.Group()
  orbit.position.copy(centre)
  orbit.rotation.set(Math.PI / 2 + 0.42, 0.0, -0.26)
  scene.add(orbit)
  const R = 2.7
  const riders = [
    { a: 0.2, s: 0.6, tilt: [0.75, 0.5, 0.2] },
    { a: 2.45, s: 0.48, tilt: [-0.55, 0.85, -0.3] },
    { a: 4.3, s: 0.56, tilt: [0.95, -0.6, 0.35] },
  ]
  // The orbit is drawn as arcs with a gap at each coin, so the coins read as threaded onto it.
  const gap = 0.2
  const sorted = [...riders].sort((p, q) => p.a - q.a)
  sorted.forEach((r, i) => {
    const next = sorted[(i + 1) % sorted.length]
    const start = r.a + gap
    const end = next.a - gap + (i === sorted.length - 1 ? Math.PI * 2 : 0)
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.022, 16, 160, end - start), chrome)
    arc.rotation.z = start
    orbit.add(arc)
  })
  for (const r of riders) {
    const c = new THREE.Group()
    const body = new THREE.Mesh(coin, chrome)
    body.rotation.x = Math.PI / 2
    c.add(body)
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.8, 96), satinFace)
    disc.position.z = 0.067
    c.add(disc)
    c.scale.setScalar(r.s)
    const local = new THREE.Vector3(Math.cos(r.a) * R, Math.sin(r.a) * R, 0)
    c.position.copy(orbit.localToWorld(local.clone()))
    c.lookAt(c.position.clone().add(new THREE.Vector3(0.45, 0.25, 1)))
    c.rotateX(r.tilt[0])
    c.rotateY(r.tilt[1])
    c.rotateZ(r.tilt[2])
    scene.add(c)
  }
  for (let i = 0; i < 9; i++) {
    const a = 0.9 + i * 0.62
    if (riders.some((r) => Math.abs(((a - r.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.3)) continue
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), chrome)
    bead.position.set(Math.cos(a) * R, Math.sin(a) * R, 0)
    orbit.add(bead)
  }

  floor.visible = false
  shadow(0.1, 0.4, 3.6, 1.9, 0.26)
  return { target: centre.clone(), camPos: new THREE.Vector3(5.6, 5.2, 11.5), fov: 30 }
}

/* -------------------------------------------------------------------- render */
const view = SCENE === 'orbit' ? orbitScene() : coinsScene()
scene.traverse((o) => {
  if (o.isMesh && o !== floor && o.material.map !== shadowTex && !o.userData.noShadow) o.castShadow = true
})
const camera = new THREE.PerspectiveCamera(view.fov, 1, 0.1, 100)
camera.position.copy(view.camPos)
camera.lookAt(view.target)

// Frame the objects (not their shadows): FRAME_W of the width, centred at (FRAME_X, FRAME_Y),
// so the render sits in the top of the card, clear of the caption.
const BOX = (q.get('box') || '0.1,0.04,0.97,0.6').split(',').map(Number) // left, top, right, bottom
const FRAME_X = (BOX[0] + BOX[2]) / 2
const FRAME_Y = (BOX[1] + BOX[3]) / 2
function projectedBounds() {
  scene.updateMatrixWorld(true)
  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix()
  const min = new THREE.Vector2(Infinity, Infinity)
  const max = new THREE.Vector2(-Infinity, -Infinity)
  const v = new THREE.Vector3()
  scene.traverse((o) => {
    if (!o.isMesh || o === floor || o.material.map === shadowTex) return
    const pos = o.geometry.attributes.position
    for (let i = 0; i < pos.count; i += 7) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).project(camera)
      min.min(v)
      max.max(v)
    }
  })
  return { min, max }
}
let b = projectedBounds()
camera.zoom = Math.min(((BOX[2] - BOX[0]) * 2) / (b.max.x - b.min.x), ((BOX[3] - BOX[1]) * 2) / (b.max.y - b.min.y))
b = projectedBounds()
const cx = ((b.min.x + b.max.x) / 2 + 1) / 2
const cy = (1 - (b.min.y + b.max.y) / 2) / 2
camera.setViewOffset(SIZE, SIZE, (cx - FRAME_X) * SIZE, (cy - FRAME_Y) * SIZE, SIZE, SIZE)
console.log('frame', JSON.stringify({ w: (b.max.x - b.min.x) / 2, h: (b.max.y - b.min.y) / 2 }))

renderer.compile(scene, camera)
renderer.render(scene, camera)
renderer.render(scene, camera) // second pass: transmission sees the fully rendered scene
window.__png = renderer.domElement.toDataURL('image/png')
