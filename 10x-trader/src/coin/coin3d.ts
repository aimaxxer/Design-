import * as THREE from 'three'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'
import { tenXMark } from './logo'

/**
 * The glass coin itself: geometry, material and the procedural studio
 * environment it reflects. No renderer or DOM here, so the mesh can be
 * dropped into any existing three.js scene.
 *
 * Geometry follows the Money Talks spec: a unit disc extruded 0.16 deep
 * with a 0.065 bevel (visual radius 1.065), thin torus rims on both faces,
 * and the 10X mark as the cut-out.
 */

export type CoinFinish = 'engraved' | 'cutout'
export type CoinPreset = 'blue' | 'iridescent'

/** 10X sky blue (the highlight blue on 10X Affiliation). Override with the `tint` option. */
export const BRAND_BLUE = '#4bbdf0'

export const COIN_RADIUS = 1.065 // visual radius including the bevel
const DEPTH = 0.16
const BEVEL = 0.065
const FACE_Z = DEPTH / 2 + BEVEL // the flat faces sit at ±0.145
const MARK_HALF = 0.5 // half-height of the 10X mark on a unit coin
const MARK_GAP = 0.03 // hairline between the strokes (mark units)
const FLOOR_Z = 0.035 // engraved finish: floor of the recess

interface PresetSpec {
  metalness: number
  iridescence: number
  dispersion: number
  envMapIntensity: number
  /** 'spectral' = rainbow oil-slick band, 'tint' = the band in shades of the tint only */
  band: 'spectral' | 'tint'
}

/**
 * blue       = single-hue 10X glass: no thin-film rainbow, no dispersion,
 *              and the studio's colour band in shades of the tint.
 * iridescent = the Money Talks material, value for value.
 */
export const COIN_PRESETS: Record<CoinPreset, PresetSpec> = {
  blue: {
    metalness: 0.9,
    iridescence: 0,
    dispersion: 0,
    envMapIntensity: 1.8,
    band: 'tint',
  },
  iridescent: {
    metalness: 0.94,
    iridescence: 1,
    dispersion: 0.85,
    envMapIntensity: 1.7,
    band: 'spectral',
  },
}

/** Base colour and attenuation for a preset; the blue preset follows the tint. */
function presetColors(preset: CoinPreset, tint: string) {
  if (preset === 'iridescent') return { color: new THREE.Color('#edf3ff'), attenuation: new THREE.Color('#b1b9ed') }
  const t = new THREE.Color(tint)
  // Lifted toward white so studio highlights glint pale sky instead of capping at the tint.
  return { color: t.clone().lerp(new THREE.Color(1, 1, 1), 0.25), attenuation: t.clone().multiplyScalar(0.55) }
}

function coinBodyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false)

  for (const poly of tenXMark(MARK_GAP)) {
    const hole = new THREE.Path()
    poly.forEach(([x, y], i) => {
      if (i === 0) hole.moveTo(x * MARK_HALF, y * MARK_HALF)
      else hole.lineTo(x * MARK_HALF, y * MARK_HALF)
    })
    hole.closePath()
    shape.holes.push(hole)
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 10,
    curveSegments: 72,
  })
  geo.translate(0, 0, -DEPTH / 2)
  // ExtrudeGeometry is flat-shaded; smooth the bevels but keep the mark's corners crisp.
  return toCreasedNormals(geo, 0.5)
}

export function createCoinMaterial(preset: CoinPreset, seed = 0, tint = BRAND_BLUE): THREE.MeshPhysicalMaterial {
  const p = COIN_PRESETS[preset]
  const { color, attenuation } = presetColors(preset, tint)
  // Each coin's film thickness drifts a little so neighbours never shimmer in sync.
  const j = (Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1
  const drift = Math.abs(j) * 2 - 1
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: p.metalness,
    roughness: 0.035,
    transmission: 0.2,
    thickness: 0.38,
    ior: 1.75,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    iridescence: p.iridescence,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [120 + drift * 18, 430 - drift * 26],
    dispersion: p.dispersion,
    envMapIntensity: p.envMapIntensity,
    attenuationColor: attenuation,
    attenuationDistance: 0.9,
  })
}

export interface Coin3D {
  /** Add this to your scene. Faces +z, spins naturally around y. */
  group: THREE.Group
  /** Invisible solid disc for hit-testing (covers the cut-out too). */
  hit: THREE.Mesh
  material: THREE.MeshPhysicalMaterial
  dispose(): void
}

export function createCoin3D(
  opts: { finish?: CoinFinish; preset?: CoinPreset; seed?: number; tint?: string } = {},
): Coin3D {
  const { finish = 'engraved', preset = 'blue', seed = 0, tint = BRAND_BLUE } = opts
  const material = createCoinMaterial(preset, seed, tint)
  const geometries: THREE.BufferGeometry[] = []
  const group = new THREE.Group()
  group.name = '10x-coin'

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material = material) => {
    geometries.push(geo)
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)
    return mesh
  }

  add(coinBodyGeometry())

  const rim = new THREE.TorusGeometry(0.955, 0.013, 12, 192)
  add(rim).position.z = FACE_Z
  add(rim.clone()).position.z = -FACE_Z

  if (finish === 'engraved') {
    // A floor inside the body: hidden by the solid everywhere except through the mark.
    const floor = new THREE.CylinderGeometry(0.86, 0.86, FLOOR_Z * 2, 96, 1)
    floor.rotateX(Math.PI / 2)
    add(floor)
  }

  const hitGeo = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, FACE_Z * 2, 48, 1)
  hitGeo.rotateX(Math.PI / 2)
  const hitMat = new THREE.MeshBasicMaterial()
  const hit = add(hitGeo, hitMat)
  hit.name = 'hit'
  hit.visible = false

  return {
    group,
    hit,
    material,
    dispose() {
      geometries.forEach((g) => g.dispose())
      material.dispose()
      hitMat.dispose()
    },
  }
}

/* ------------------------------------------------------------------ */
/* Procedural studio: soft white panels + an oil-slick dome band,      */
/* either spectral (Money Talks) or in shades of one tint (10X blue).  */
/* No HDR file, no photo texture.                                       */
/* ------------------------------------------------------------------ */

const domeVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const domeFrag = /* glsl */ `
uniform float uTinted;
uniform vec3 uBaseLo;
uniform vec3 uBaseHi;
uniform vec3 uDeep;
uniform vec3 uTint;
uniform vec3 uLight;
varying vec3 vDir;
vec3 spectrum(float h) { return 0.5 + 0.5 * cos(6.28318 * (h + vec3(0.0, 0.33, 0.67))); }
vec3 tintRamp(float h) {
  float w = 0.5 + 0.5 * cos(6.28318 * h);
  return mix(mix(uDeep, uTint, smoothstep(0.0, 0.6, w)), uLight, smoothstep(0.6, 1.0, w));
}
void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 base = mix(uBaseLo, uBaseHi, smoothstep(-0.9, 0.9, y));
  // oil slick: hue swirls around the horizon (integer wrap keeps the seam invisible)
  float around = atan(d.z, d.x) / 6.28318;
  float h = around * 2.0 + y * 0.9 + 0.12 * sin(d.x * 6.0 + d.y * 4.0) + 0.08 * sin(d.z * 9.0);
  float band = smoothstep(-0.75, -0.1, y) * (1.0 - smoothstep(0.2, 0.8, y));
  vec3 ramp = uTinted > 0.5 ? tintRamp(h) : spectrum(h);
  vec3 col = base + ramp * band * 0.45;
  gl_FragColor = vec4(col, 1.0);
}`

const panelVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const panelFrag = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uSize;
uniform float uSoft;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  vec2 q = abs(p) - (uSize * 0.5 - uSoft * 2.0);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float a = 1.0 - smoothstep(-uSoft * 0.2, uSoft * 2.0, d);
  gl_FragColor = vec4(uColor * a, 1.0);
}`

interface PanelSpec {
  at: [number, number, number]
  size: [number, number]
  soft: number
  intensity: number
}

const PANELS: PanelSpec[] = [
  { at: [-3, 3.6, 9], size: [12, 8], soft: 1.8, intensity: 2.1 }, // key, behind the viewer (fills the face)
  { at: [5.5, -3.5, 8], size: [6, 4], soft: 1.2, intensity: 0.55 }, // low fill opposite the key
  { at: [0, 10, 0.5], size: [16, 2.6], soft: 0.6, intensity: 3.4 }, // overhead strip (top bevel)
  { at: [-10, 0.5, 2], size: [2.2, 12], soft: 0.6, intensity: 2.6 }, // left strip
  { at: [10, 1, -2], size: [2, 12], soft: 0.6, intensity: 2.1 }, // right strip
  { at: [0, 2.5, -10], size: [10, 5], soft: 1.4, intensity: 1.3 }, // back wall, seen mid-turn
]

export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  opts: { preset?: CoinPreset; tint?: string } = {},
): THREE.WebGLRenderTarget {
  const { preset = 'blue', tint = BRAND_BLUE } = opts
  const t = new THREE.Color(tint)
  const tinted = COIN_PRESETS[preset].band === 'tint'
  const scene = new THREE.Scene()
  const disposables: { dispose(): void }[] = []

  const domeGeo = new THREE.SphereGeometry(30, 64, 32)
  const domeMat = new THREE.ShaderMaterial({
    vertexShader: domeVert,
    fragmentShader: domeFrag,
    uniforms: {
      uTinted: { value: tinted ? 1 : 0 },
      // walls: neutral studio grey, or navy built from the tint so dark angles stay on-brand
      uBaseLo: { value: tinted ? t.clone().multiplyScalar(0.04) : new THREE.Color().setRGB(0.02, 0.022, 0.03) },
      uBaseHi: { value: tinted ? t.clone().multiplyScalar(0.34) : new THREE.Color().setRGB(0.2, 0.21, 0.24) },
      uDeep: { value: t.clone().multiplyScalar(0.18) },
      uTint: { value: t },
      uLight: { value: t.clone().lerp(new THREE.Color(1, 1, 1), 0.55) },
    },
    side: THREE.BackSide,
    depthWrite: false,
  })
  scene.add(new THREE.Mesh(domeGeo, domeMat))
  disposables.push(domeGeo, domeMat)

  for (const p of PANELS) {
    const geo = new THREE.PlaneGeometry(p.size[0], p.size[1])
    const mat = new THREE.ShaderMaterial({
      vertexShader: panelVert,
      fragmentShader: panelFrag,
      uniforms: {
        uColor: { value: new THREE.Color(1, 1, 1).multiplyScalar(p.intensity) },
        uSize: { value: new THREE.Vector2(p.size[0], p.size[1]) },
        uSoft: { value: p.soft },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...p.at)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
    disposables.push(geo, mat)
  }

  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.02, 0.1, 100, { size: 512 })
  pmrem.dispose()
  disposables.forEach((d) => d.dispose())
  return target
}
