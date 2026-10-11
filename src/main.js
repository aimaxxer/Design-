import {
  ACESFilmicToneMapping, BackSide, CanvasTexture, Color, DirectionalLight, DoubleSide, Euler,
  ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PerspectiveCamera,
  Plane, PlaneGeometry, PMREMGenerator, Quaternion, Scene, Shape, SphereGeometry, SRGBColorSpace,
  TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const $ = (s) => document.querySelector(s);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const mod = (a, n) => ((a % n) + n) % n;
function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const root = document.documentElement;
const mqMobile = matchMedia('(max-width: 900px)');
const mqShort = matchMedia('(max-width: 900px) and (max-height: 500px)');
const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mqReduce.matches;
mqReduce.addEventListener('change', (e) => { reduced = e.matches; });

const Y_AXIS = new Vector3(0, 1, 0);
const ID = new Quaternion();
const _q1 = new Quaternion();
const _q2 = new Quaternion();
const _q3 = new Quaternion();
const _v1 = new Vector3();
const _v2 = new Vector3();
const _e = new Euler();
const quat = (x, y, z) => new Quaternion().setFromEuler(new Euler(x, y, z));
const spinY = (out, a) => out.setFromAxisAngle(Y_AXIS, a);
const newPose = () => ({ x: 0, y: 0, d: 1, q: new Quaternion(), vis: false, k: 0 });
const copyPose = (src, out) => { out.x = src.x; out.y = src.y; out.d = src.d; out.q.copy(src.q); return out; };

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PX = 0.01;                 // world units per CSS pixel on the z = 0 plane
const PASS_SECONDS = 28;         // one full conveyor loop
const SLOW_TURN = 48;            // seconds per idle turn
const INTRO_TURN = 1.6;          // seconds for the first story turn
const HERO_D = 601;              // coin diameter in design pixels
const BOB = 16 / HERO_D;         // 0.16 world units at 100 px / unit
const KINDS = ['square', 'diamond', 'square', 'diamond', 'square', 'diamond'];
const LANES = [-0.034, 0.03, -0.016, 0.038, -0.028, 0.018];
const TILTS = [[0.1, -0.12], [-0.06, 0.09], [0.08, -0.05], [-0.1, 0.11], [0.05, -0.09], [-0.07, 0.06]];
const SCRATCH_GOAL = 0.72;
const GW = 96;
const GH = 32;

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const el = {
  gl: $('#gl'),
  shadow: $('#coinShadow'),
  hero: $('#hero'),
  band: $('#coinBand'),
  story: $('#story'),
  pin: $('#pin'),
  text: $('#storyText'),
  slots: [$('#slot0'), $('#slot1')],
  budget: $('#budget'),
  budgetCoin: $('#budgetCoin'),
  news: $('#join'),
  scratch: $('#scratch'),
  cover: $('#cover'),
  dock: $('#dock'),
  dockCoin: $('#dock .fb'),
  panel: $('#joinPanel'),
  joinBtn: $('#joinBtn'),
  status: $('#joinStatus'),
  preloader: $('#preloader'),
  menuBtn: $('#menuBtn'),
  menu: $('#menu'),
  fbHero: Array.from(document.querySelectorAll('#coinBand .fb-coin')),
};

/* ------------------------------------------------------------------ */
/* Measurements (cached; recomputed on resize / reflow)                */
/* ------------------------------------------------------------------ */

const M = {
  s: 1, vw: 1, vh: 1, cw: 1, ch: 1, mobile: false, short: false,
  heroTop: 0, heroH: 1, heroD: HERO_D, spacing: 640,
  band: { x: 0, top: 0, w: 1, h: 1 },
  storyTop: 0, storyH: 1, pinH: 1, slots: [{ x: 0, dy: 0 }, { x: 0, dy: 0 }], slotD: 84,
  budgetTop: 0, bslot: { x: 0, y: 0 },
  newsTop: 0, dock: { x: 0, y: 0 }, dockD: 185,
  card: { x: 0, y: 0, w: 1, h: 1 }, brush: 18, maxScroll: 0,
};

function measure() {
  const mobile = mqMobile.matches;
  const short = mqShort.matches;
  const vw = root.clientWidth;
  const vh = window.innerHeight;
  M.mobile = mobile; M.short = short; M.vw = vw; M.vh = vh;

  const heroH = el.hero.offsetHeight;
  let s = 1;
  if (!mobile) {
    s = Math.min(vw / 1920, vh / 1080);
    root.style.setProperty('--stage-scale', String(s));
    root.style.setProperty('--stage-w', `${vw / s}px`);
    root.style.setProperty('--stage-h', `${heroH / s}px`);
  } else {
    root.style.setProperty('--stage-scale', '1');
  }
  let mobileD = 280;
  if (mobile) {
    const bandH = el.band.offsetHeight;
    mobileD = Math.min(vw * 0.72, 300, bandH * 0.9);
    if (short) mobileD = Math.min(mobileD, el.band.offsetWidth * 0.86);
    root.style.setProperty('--m-coin', `${mobileD}px`);
    root.style.setProperty('--m-coin-slot', `${Math.round(mobileD + 64)}px`);
  }
  M.s = s;

  const sy = window.scrollY;
  const r = (node) => node.getBoundingClientRect();

  const hero = r(el.hero);
  M.heroTop = hero.top + sy; M.heroH = hero.height;
  const band = r(el.band);
  M.band = { x: band.left, top: band.top + sy, w: band.width, h: band.height };
  M.heroD = mobile ? mobileD : HERO_D * s;
  M.spacing = Math.max(M.heroD * 1.06, (M.band.w + M.heroD * 1.1) / 6);

  const story = r(el.story);
  M.storyTop = story.top + sy; M.storyH = story.height;
  const pin = r(el.pin);
  M.pinH = pin.height;
  M.slots = el.slots.map((slot) => {
    const b = r(slot);
    return { x: b.left + b.width / 2, dy: b.top + b.height / 2 - pin.top, w: b.width, h: b.height };
  });
  M.slotD = mobile ? M.slots[0].h * 0.98 : 84 * s;

  const budget = r(el.budget);
  M.budgetTop = budget.top + sy;
  const bc = r(el.budgetCoin);
  M.bslot = { x: bc.left + bc.width / 2, y: bc.top + bc.height / 2 + sy };

  const news = r(el.news);
  M.newsTop = news.top + sy;
  const dock = r(el.dock);
  M.dock = { x: dock.left + dock.width / 2, y: dock.top + dock.height / 2 + sy };
  M.dockD = mobile ? dock.width : dock.width * (185 / 200);
  const card = r(el.scratch);
  M.card = { x: card.left, y: card.top + sy, w: card.width, h: card.height };
  M.brush = mobile ? 12 : 18 * s;

  M.maxScroll = Math.max(0, root.scrollHeight - vh);
  M.cw = el.gl.clientWidth || vw;
  M.ch = el.gl.clientHeight || vh;

  if (renderer) {
    renderer.setSize(M.cw, M.ch, false);
    camera.aspect = M.cw / M.ch;
    camera.position.set(0, 0, (M.ch * PX) / 2 / Math.tan((camera.fov * Math.PI) / 360));
    camera.updateProjectionMatrix();
  } else {
    layoutFallbackHero();
  }
  if (coverReady) resizeCover();
}

/* Scroll ranges for the travelling coin's phases. */
function bounds() {
  const vh = M.vh;
  const r1 = Math.max(1, M.storyTop);
  const r2 = Math.max(r1 + 1, M.storyTop + M.storyH - M.pinH);
  const r3 = Math.max(r2 + 1, M.mobile ? M.bslot.y - vh / 2 : M.budgetTop);
  const r5 = Math.max(r3 + 2, Math.min(M.newsTop, M.maxScroll) - 1);
  let r4 = M.mobile ? M.bslot.y - vh * 0.22 : M.newsTop - vh * 0.6;
  r4 = clamp(r4, r3, Math.max(r3, r5 - Math.max(60, vh * 0.25)));
  return [r1, r2, r3, r4, r5];
}

function pinScreenTop(sy) {
  const a = M.storyTop;
  const b = M.storyTop + M.storyH - M.pinH;
  if (sy < a) return a - sy;
  if (sy > b) return b - sy;
  return 0;
}

/* ------------------------------------------------------------------ */
/* Story reveal                                                        */
/* ------------------------------------------------------------------ */

const tokens = [];
const slotReached = [false, false];
const storySpin = [0, 0];

function splitStory() {
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
          tokens.push({ el: span, slot: -1, c: -1 });
        }
        child.replaceWith(frag);
      } else if (child.classList && child.classList.contains('slot')) {
        tokens.push({ el: child, slot: Number(child.id.replace('slot', '')), c: -1 });
      }
    }
  };
  walk(el.text);
}

function updateReveal(p) {
  const n = tokens.length;
  const soft = 3.5;
  const front = p * (n + soft);
  for (let i = 0; i < n; i++) {
    const t = tokens[i];
    const v = clamp((front - i) / soft, 0, 1);
    if (t.slot >= 0) { slotReached[t.slot] = v >= 0.5; continue; }
    const c = Math.round(48 + 199 * v);
    if (c !== t.c) { t.c = c; t.el.style.color = `rgb(${c},${c},${c})`; }
  }
}

const storyAngle = (t) => (t < INTRO_TURN ? TAU * smooth(t / INTRO_TURN) : TAU + (TAU * (t - INTRO_TURN)) / SLOW_TURN);

/* ------------------------------------------------------------------ */
/* Trackball: drag rotates in screen space, keeps its own inertia      */
/* ------------------------------------------------------------------ */

class Trackball {
  constructor() {
    this.q = new Quaternion();
    this.w = new Vector3();
    this.drag = false;
    this.lastMove = 0;
  }
  rotate(axis, angle, pre) {
    _q1.setFromAxisAngle(axis, angle);
    _q2.copy(pre).invert().multiply(_q1).multiply(pre);
    this.q.premultiply(_q2).normalize();
  }
  move(dx, dy, radius, dtMs, pre, now) {
    const len = Math.hypot(dx, dy);
    if (len < 0.01) return;
    _v1.set(dy, dx, 0).divideScalar(len);
    const ang = len / Math.max(radius, 18);
    this.rotate(_v1, ang, pre);
    const dt = clamp(dtMs / 1000, 1 / 240, 0.1);
    _v2.copy(_v1).multiplyScalar(Math.min(ang / dt, 16));
    this.w.lerp(_v2, 0.6);
    this.lastMove = now;
  }
  release(now) {
    this.drag = false;
    if (reduced || now - this.lastMove > 90) this.w.set(0, 0, 0);
  }
  update(dt, pre, settle) {
    if (this.drag) return;
    const sp = this.w.length();
    if (sp > 0.002) {
      _v1.copy(this.w).divideScalar(sp);
      this.rotate(_v1, sp * dt, pre);
      this.w.multiplyScalar(Math.exp(-2.6 * dt));
    } else {
      this.w.set(0, 0, 0);
    }
    if (settle && sp < 0.6) this.q.slerp(ID, 1 - Math.exp(-settle * dt));
  }
}

/* ------------------------------------------------------------------ */
/* Coin data                                                           */
/* ------------------------------------------------------------------ */

let U = 0;          // conveyor progress, 1 = one full pass
let time = 0;
const heroCoins = KINDS.map((kind, i) => ({
  i, kind,
  tb: new Trackball(),
  qTilt: quat(TILTS[i][0], 0, TILTS[i][1]),
  qSpin: new Quaternion(),
  pose: newPose(),
  hiddenK: null,
  group: null,
  mat: null,
}));

const qStoryBase = [quat(-0.08, 0, 0.12), quat(0.07, 0, -0.1)];
const qBudgetBase = quat(-0.1, 0, 0.07);
const qNewsBase = quat(0.12, 0, -0.14);
const tbBudget = new Trackball();
const hover = { x: 0, y: 0, tx: 0, ty: 0 };
const qHover = new Quaternion();
let budgetAngle = 0;
let newsAngle = 0;

const T = { idx: -1, wrapK: 0, phase: 'hero', e: 0, pose: newPose() };
const A = newPose();
const S = newPose();
const B = newPose();
const N = newPose();
const SP = newPose();

function heroPose(i, sy, out, k) {
  const D = M.heroD;
  const L = M.spacing * 6;
  const raw = M.band.w / 2 + (i - 1) * M.spacing - U * L + 0.55 * D;
  out.k = Math.floor(raw / L);
  out.x = M.band.x + raw - (k == null ? out.k : k) * L - 0.55 * D;
  out.y = M.band.top - sy + M.band.h / 2 + LANES[i] * D + (reduced ? 0 : Math.sin(time + i * 1.7) * BOB * D);
  out.d = D;
  const c = heroCoins[i];
  spinY(c.qSpin, TAU * U + i * 1.05);
  out.q.copy(c.qSpin).multiply(c.tb.q).multiply(c.qTilt);
  return out;
}

function storyAnchor(k, sy, out) {
  const slot = M.slots[k];
  out.x = slot.x;
  out.y = pinScreenTop(sy) + slot.dy;
  out.d = M.slotD;
  spinY(out.q, reduced ? 0 : storyAngle(storySpin[k])).multiply(qStoryBase[k]);
  return out;
}

const preBudget = new Quaternion();
function budgetAnchor(sy, out) {
  out.x = M.bslot.x;
  out.y = M.bslot.y - sy;
  out.d = M.heroD;
  qHover.setFromEuler(_e.set(hover.y * 0.32, hover.x * 0.45, 0));
  preBudget.copy(qHover).multiply(spinY(_q3, budgetAngle));
  out.q.copy(preBudget).multiply(tbBudget.q).multiply(qBudgetBase);
  return out;
}

function newsAnchor(sy, out) {
  out.x = M.dock.x;
  out.y = M.dock.y - sy;
  out.d = M.dockD;
  spinY(out.q, newsAngle).multiply(qNewsBase);
  return out;
}

function mixPose(a, b, e, arcX, turn, out) {
  out.x = lerp(a.x, b.x, e) + Math.sin(Math.PI * e) * arcX;
  out.y = lerp(a.y, b.y, e);
  out.d = Math.exp(lerp(Math.log(a.d), Math.log(b.d), e));
  out.q.slerpQuaternions(a.q, b.q, e);
  if (turn && !reduced) out.q.multiply(spinY(_q3, TAU * e));
  return out;
}

const onScreen = (p) => p.x + p.d * 0.52 > 0 && p.x - p.d * 0.52 < M.cw && p.y + p.d * 0.52 > 0 && p.y - p.d * 0.52 < M.ch;

/* ------------------------------------------------------------------ */
/* WebGL                                                               */
/* ------------------------------------------------------------------ */

let renderer = null;
let scene = null;
let camera = null;
const heroPlanes = [new Plane(new Vector3(1, 0, 0), 1e5), new Plane(new Vector3(-1, 0, 0), 1e5)];
const freePlanes = [new Plane(new Vector3(1, 0, 0), 1e5), new Plane(new Vector3(-1, 0, 0), 1e5)];
const storyCoins = {};
let lastDrawn = true;

const SQ = 0.44;   // square mark: half-size of the centre square
const DM = 0.62;   // diamond mark: half-diagonal of the centre diamond
const GAP = 0.008;
const EXTRUDE = {
  depth: 0.16, bevelEnabled: true, bevelThickness: 0.065, bevelSize: 0.065, bevelOffset: -0.065,
  bevelSegments: 7, curveSegments: 64, steps: 1,
};
const RIM_Z = 0.142;
const RIM_R = 0.962;

function squareMark() {
  const yc = Math.sqrt(1 - SQ * SQ);
  const a0 = Math.atan2(yc, SQ);
  const a1 = Math.PI + Math.atan2(SQ, yc);
  const shapes = [];
  const arcs = [];
  for (const sg of [1, -1]) {
    const gx = -GAP * sg;
    const gy = GAP * sg;
    const P = (x, y) => [sg * x + gx, sg * y + gy];
    const off = sg < 0 ? Math.PI : 0;
    const s = new Shape();
    s.moveTo(...P(SQ, SQ));
    s.lineTo(...P(SQ, yc));
    s.absarc(gx, gy, 1, a0 + off, a1 + off, false);
    s.lineTo(...P(-SQ, -SQ));
    s.lineTo(...P(-SQ, SQ));
    s.closePath();
    shapes.push(s);
    arcs.push([a0 + off, a1 - a0, gx, gy]);
  }
  return { shapes, arcs };
}

function diamondMark() {
  const x0 = (DM - Math.sqrt(2 - DM * DM)) / 2;
  const y0 = DM - x0;
  const t0 = Math.atan2(y0, x0);
  const t1 = Math.atan2(-y0, x0) + TAU;
  const left = new Shape();
  left.moveTo(-GAP, DM);
  left.lineTo(x0 - GAP, y0);
  left.absarc(-GAP, 0, 1, t0, t1, false);
  left.lineTo(-GAP, -DM);
  left.lineTo(-DM - GAP, 0);
  left.closePath();
  const right = new Shape();
  right.moveTo(GAP, DM);
  right.lineTo(-x0 + GAP, y0);
  right.absarc(GAP, 0, 1, Math.PI - t0, Math.PI - t1, true);
  right.lineTo(GAP, -DM);
  right.lineTo(DM + GAP, 0);
  right.closePath();
  return { shapes: [left, right], arcs: [[t0, t1 - t0, -GAP, 0], [Math.PI - t1, t1 - t0, GAP, 0]] };
}

function coinGeometry({ shapes, arcs }) {
  let body = new ExtrudeGeometry(shapes, EXTRUDE);
  body.translate(0, 0, -EXTRUDE.depth / 2);
  body.deleteAttribute('uv');
  body = toCreasedNormals(body, Math.PI / 5);
  const parts = [body];
  for (const [start, len, cx, cy] of arcs) {
    for (const z of [-RIM_Z, RIM_Z]) {
      const rim = new TorusGeometry(RIM_R, 0.0105, 8, Math.max(24, Math.round(len * 42)), len);
      rim.rotateZ(start);
      rim.translate(cx, cy, z);
      rim.deleteAttribute('uv');
      parts.push(rim.toNonIndexed());
    }
  }
  const merged = mergeGeometries(parts, false);
  merged.computeBoundingSphere();
  return merged;
}

function gradientTexture(stops) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const lin = g.createLinearGradient(0, 0, 0, 256);
  stops.forEach((col, i) => lin.addColorStop(i / (stops.length - 1), col));
  g.fillStyle = lin;
  g.fillRect(0, 0, 4, 256);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function oilTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const rnd = mulberry32(seed);
  const lin = g.createLinearGradient(0, 0, 512, 64);
  const hues = ['#071420', '#0c6d92', '#3ad7e8', '#e3f7ff', '#8f6cff', '#ff63d4', '#ffc56e', '#63ffb5', '#2a3c9a', '#081322'];
  hues.forEach((col, i) => lin.addColorStop(i / (hues.length - 1), col));
  g.fillStyle = lin;
  g.fillRect(0, 0, 512, 256);
  g.globalCompositeOperation = 'screen';
  const blobs = ['#29c8ff', '#b06bff', '#ff5fc8', '#ffd36b', '#4dffc0', '#7a8cff'];
  for (let i = 0; i < 14; i++) {
    const x = rnd() * 512;
    const y = rnd() * 256;
    const r = 40 + rnd() * 120;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, blobs[i % blobs.length] + 'cc');
    rg.addColorStop(1, blobs[i % blobs.length] + '00');
    g.fillStyle = rg;
    g.fillRect(0, 0, 512, 256);
  }
  g.globalCompositeOperation = 'multiply';
  for (let x = 0; x < 512; x += 2) {
    const v = 0.72 + 0.28 * Math.sin(x * 0.045 + Math.sin(x * 0.011) * 3);
    const k = Math.round(255 * v);
    g.fillStyle = `rgb(${k},${k},${k})`;
    g.fillRect(x, 0, 2, 256);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function buildEnvironment() {
  const env = new Scene();
  const disposables = [];
  const add = (mesh) => { env.add(mesh); disposables.push(mesh); return mesh; };

  const sky = gradientTexture(['#2b2f3b', '#15171e', '#09090c', '#040405', '#0d0e12']);
  add(new Mesh(new SphereGeometry(60, 48, 24), new MeshBasicMaterial({ map: sky, side: BackSide })));

  const panel = (w, h, x, y, z, intensity, tint = 0xffffff) => {
    const m = add(new Mesh(new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(tint).multiplyScalar(intensity), side: DoubleSide })));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    return m;
  };
  // Soft white studio panels.
  panel(36, 7, 0, 25, 9, 3.0);
  panel(6, 30, -27, 5, 13, 2.3);
  panel(5, 22, 28, -2, 11, 1.5, 0xeef3ff);
  panel(13, 3.4, 9, 10, 30, 4.6);
  panel(3.2, 14, -12, 2, 31, 2.2);
  panel(34, 2.4, 0, -17, 21, 1.1);
  // Spectral oil-slick gradients behind and below the camera.
  const oilA = add(new Mesh(new PlaneGeometry(70, 30), new MeshBasicMaterial({ map: oilTexture(7), side: DoubleSide })));
  oilA.material.color.setScalar(1.25);
  oilA.position.set(0, -5, 35);
  oilA.lookAt(0, 0, 0);
  const oilB = add(new Mesh(new PlaneGeometry(40, 18), new MeshBasicMaterial({ map: oilTexture(19), side: DoubleSide })));
  oilB.material.color.setScalar(0.9);
  oilB.position.set(-24, -20, 4);
  oilB.lookAt(0, 0, 0);

  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  for (const m of disposables) {
    m.geometry.dispose();
    if (m.material.map) m.material.map.dispose();
    m.material.dispose();
  }
  return target.texture;
}

function glassMaterial(i) {
  return new MeshPhysicalMaterial({
    color: 0xedf3ff,
    metalness: 0.94,
    roughness: 0.035,
    transmission: 0.2,
    thickness: 0.38,
    ior: 1.75,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [120 + ((i * 23) % 60), 430 - ((i * 17) % 50)],
    dispersion: 0.85,
    envMapIntensity: 1.7,
    attenuationColor: 0xb1b9ed,
    attenuationDistance: 0.9,
    clippingPlanes: heroPlanes,
  });
}

function initGL() {
  renderer = new WebGLRenderer({
    canvas: el.gl, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.localClippingEnabled = true;
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = 0.6;

  scene = new Scene();
  camera = new PerspectiveCamera(24, 1, 0.5, 400);
  scene.environment = buildEnvironment();

  const key = new DirectionalLight(0xffffff, 1.1);
  key.position.set(-4, 6, 9);
  scene.add(key);
  const rim = new DirectionalLight(0xd7defe, 0.7);
  rim.position.set(7, -3, 4);
  scene.add(rim);

  const geo = { square: coinGeometry(squareMark()), diamond: coinGeometry(diamondMark()) };

  for (const c of heroCoins) {
    c.mat = glassMaterial(c.i);
    c.group = new Group();
    c.group.add(new Mesh(geo[c.kind], c.mat));
    scene.add(c.group);
  }
  for (const kind of ['square', 'diamond']) {
    const mat = glassMaterial(kind === 'square' ? 7 : 8);
    mat.clippingPlanes = freePlanes;
    const group = new Group();
    group.add(new Mesh(geo[kind], mat));
    group.visible = false;
    scene.add(group);
    storyCoins[kind] = group;
  }
}

/* Short landscape: hero coins stay inside the left coin column. */
function updateHeroClip() {
  if (M.short) {
    heroPlanes[0].constant = -(M.band.x - M.cw / 2) * PX;
    heroPlanes[1].constant = (M.band.x + M.band.w - M.cw / 2) * PX;
  } else {
    heroPlanes[0].constant = 1e5;
    heroPlanes[1].constant = 1e5;
  }
}

function placeGroup(group, pose) {
  group.visible = pose.vis;
  if (!pose.vis) return;
  group.position.set((pose.x - M.cw / 2) * PX, (M.ch / 2 - pose.y) * PX, 0);
  group.scale.setScalar((pose.d * PX) / 2);
  group.quaternion.copy(pose.q);
}

/* ------------------------------------------------------------------ */
/* Hero conveyor + travelling coin                                     */
/* ------------------------------------------------------------------ */

function heroFrame(dt, sy) {
  const heroVisible = M.heroTop + M.heroH - sy > 0;
  if (heroVisible && !reduced) U += dt / PASS_SECONDS;
  for (const c of heroCoins) {
    c.tb.update(dt, c.qSpin, reduced ? 0 : 0.45);
    heroPose(c.i, sy, c.pose, null);
    c.pose.vis = onScreen(c.pose);
    if (c.hiddenK != null) {
      if (c.pose.k !== c.hiddenK) c.hiddenK = null;
      else c.pose.vis = false;
    }
  }
}

function pickTraveller() {
  let best = 0;
  let bestDist = Infinity;
  for (const c of heroCoins) {
    if (c.hiddenK != null) continue;
    const d = Math.hypot(c.pose.x - M.cw / 2, (c.pose.y - M.ch / 2) * 0.25);
    if (d < bestDist) { bestDist = d; best = c.i; }
  }
  const c = heroCoins[best];
  T.idx = best;
  T.wrapK = c.pose.k;
  if (c.mat) c.mat.clippingPlanes = freePlanes;
}

function releaseTraveller(sy) {
  const c = heroCoins[T.idx];
  if (c.mat) c.mat.clippingPlanes = heroPlanes;
  heroPose(c.i, sy, c.pose, null);
  if (c.pose.k !== T.wrapK && onScreen(c.pose)) c.hiddenK = c.pose.k;
  T.idx = -1;
  T.phase = 'hero';
  root.dataset.coinPhase = 'hero';
}

function travellerAtNews() {
  return T.phase === 'newsletter' || (T.phase === 'budget-to-newsletter' && T.e > 0.8);
}

function travellerAtBudget() {
  return T.phase === 'budget' || (T.phase === 'story-to-budget' && T.e > 0.85) || (T.phase === 'budget-to-newsletter' && T.e < 0.15);
}

function travellerFrame(dt, sy) {
  if (T.idx < 0) {
    if (sy <= 1) { T.phase = 'hero'; return; }
    pickTraveller();
  } else if (sy <= 1 && !SC.active) {
    releaseTraveller(sy);
    return;
  }

  const [r1, r2, r3, r4, r5] = bounds();
  if (T.phase === 'budget' && !reduced && onScreen(B)) budgetAngle += (TAU * dt) / SLOW_TURN;
  if (T.phase === 'newsletter' && !reduced && !SC.active) newsAngle += (TAU * dt) / SLOW_TURN;
  hover.x += (hover.tx - hover.x) * (1 - Math.exp(-dt * 6));
  hover.y += (hover.ty - hover.y) * (1 - Math.exp(-dt * 6));
  tbBudget.update(dt, preBudget, 0);

  const c = heroCoins[T.idx];
  heroPose(T.idx, sy, A, T.wrapK);
  storyAnchor(0, sy, S);
  budgetAnchor(sy, B);
  newsAnchor(sy, N);

  const P = T.pose;
  let phase;
  let e = 0;
  if (sy < r1) {
    phase = 'hero-to-story';
    e = smooth(clamp(sy / r1, 0, 1));
    mixPose(A, S, e, M.cw * 0.05, true, P);
  } else if (sy < r2) {
    phase = 'story';
    copyPose(S, P);
  } else if (sy < r3) {
    phase = 'story-to-budget';
    e = smooth((sy - r2) / (r3 - r2));
    mixPose(S, B, e, -M.cw * 0.05, true, P);
  } else if (sy < r4) {
    phase = 'budget';
    copyPose(B, P);
  } else if (sy < r5) {
    phase = 'budget-to-newsletter';
    e = smooth((sy - r4) / (r5 - r4));
    mixPose(B, N, e, M.cw * 0.04, true, P);
  } else {
    phase = 'newsletter';
    copyPose(N, P);
  }

  if (SC.active) {
    P.x = SC.cx;
    P.y = SC.cy;
    P.d = M.dockD;
    _q1.setFromEuler(_e.set(SC.tiltX, SC.tiltY, -SC.tiltY * 0.3));
    P.q.copy(_q1).multiply(N.q);
  }
  if (phase !== T.phase) root.dataset.coinPhase = phase;
  T.phase = phase;
  T.e = e;
  P.vis = onScreen(P);
  c.pose.vis = false;
}

function storyCoinFrame(sy) {
  const travelKind = T.idx >= 0 ? heroCoins[T.idx].kind : 'square';
  const kind = travelKind === 'square' ? 'diamond' : 'square';
  storyAnchor(1, sy, SP);
  SP.vis = onScreen(SP);
  for (const k of ['square', 'diamond']) storyCoins[k].visible = false;
  placeGroup(storyCoins[kind], SP);
}

let shadowOn = false;
function shadowFrame() {
  const P = T.pose;
  let o = 0;
  if (T.idx >= 0 && P.vis) {
    if (T.phase === 'newsletter' || SC.active) o = 1;
    else if (T.phase === 'budget-to-newsletter') o = clamp((T.e - 0.6) / 0.4, 0, 1);
  }
  const st = el.shadow.style;
  if (o <= 0) {
    if (shadowOn) { st.opacity = '0'; shadowOn = false; }
    return;
  }
  shadowOn = true;
  const d = P.d * 0.92;
  st.width = `${d}px`;
  st.height = `${d}px`;
  st.transform = `translate3d(${P.x - d / 2}px, ${P.y - d / 2 + P.d * 0.081}px, 0)`;
  st.opacity = String(o);
}
function renderFrame() {
  for (const c of heroCoins) {
    if (c.i === T.idx) placeGroup(c.group, T.pose);
    else placeGroup(c.group, c.pose);
  }
  let any = false;
  scene.traverse((o) => { if (o.isGroup && o.visible && o.parent === scene) any = true; });
  if (any || lastDrawn) renderer.render(scene, camera);
  lastDrawn = any;
}

/* ------------------------------------------------------------------ */
/* Fallback (no WebGL): static SVG coins in the same layout            */
/* ------------------------------------------------------------------ */

function layoutFallbackHero() {
  if (renderer) return;
  // The SVGs live inside the zoomed stage, so work in stage units.
  const k = M.mobile ? 1 : M.s;
  el.fbHero.forEach((svg, i) => {
    const D = M.heroD / k;
    const sp = M.spacing / k;
    const bw = M.band.w / k;
    const L = sp * 6;
    const raw = bw / 2 + (i - 1) * sp + 0.55 * D;
    const x = mod(raw, L) - 0.55 * D;
    const y = M.band.h / k / 2 + LANES[i] * D;
    svg.style.width = `${D}px`;
    svg.style.height = `${D}px`;
    svg.style.transform = `translate(${x - D / 2}px, ${y - D / 2}px) rotate(${TILTS[i][1] * 57}deg)`;
    if (M.short) svg.style.visibility = x + D / 2 > 0 && x - D / 2 < bw ? 'visible' : 'hidden';
    else svg.style.visibility = '';
  });
}

/* ------------------------------------------------------------------ */
/* Pointer: hero coins                                                 */
/* ------------------------------------------------------------------ */

let heroDrag = null;
function hitHero(x, y) {
  let hit = -1;
  let best = Infinity;
  for (const c of heroCoins) {
    if (c.i === T.idx || !c.pose.vis) continue;
    const d = Math.hypot(x - c.pose.x, y - c.pose.y);
    if (d <= c.pose.d / 2 && d < best) { best = d; hit = c.i; }
  }
  return hit;
}

function initHeroPointer() {
  const band = el.band;
  band.addEventListener('pointerdown', (e) => {
    if (!renderer || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const i = hitHero(e.clientX, e.clientY);
    if (i < 0) return;
    heroDrag = { i, id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    const tb = heroCoins[i].tb;
    tb.drag = true;
    tb.w.set(0, 0, 0);
    try { band.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    band.style.cursor = 'grabbing';
    if (e.pointerType === 'mouse') e.preventDefault();
  });
  band.addEventListener('pointermove', (e) => {
    if (heroDrag && e.pointerId === heroDrag.id) {
      const c = heroCoins[heroDrag.i];
      c.tb.move(e.clientX - heroDrag.x, e.clientY - heroDrag.y, c.pose.d / 2, e.timeStamp - heroDrag.t, c.qSpin, e.timeStamp);
      heroDrag.x = e.clientX;
      heroDrag.y = e.clientY;
      heroDrag.t = e.timeStamp;
    } else if (e.pointerType === 'mouse' && renderer) {
      band.style.cursor = hitHero(e.clientX, e.clientY) >= 0 ? 'grab' : '';
    }
  });
  const end = (e) => {
    if (!heroDrag || e.pointerId !== heroDrag.id) return;
    heroCoins[heroDrag.i].tb.release(e.timeStamp);
    heroDrag = null;
    band.style.cursor = e.pointerType === 'mouse' && hitHero(e.clientX, e.clientY) >= 0 ? 'grab' : '';
  };
  band.addEventListener('pointerup', end);
  band.addEventListener('pointercancel', end);
  band.addEventListener('lostpointercapture', end);
  band.addEventListener('pointerleave', (e) => { if (!heroDrag && e.pointerType === 'mouse') band.style.cursor = ''; });
}

/* ------------------------------------------------------------------ */
/* Pointer: budget coin                                                */
/* ------------------------------------------------------------------ */

let budgetDrag = null;
function initBudgetPointer() {
  const slot = el.budgetCoin;
  slot.addEventListener('pointermove', (e) => {
    if (budgetDrag && e.pointerId === budgetDrag.id) {
      tbBudget.move(e.clientX - budgetDrag.x, e.clientY - budgetDrag.y, M.heroD / 2, e.timeStamp - budgetDrag.t, preBudget, e.timeStamp);
      budgetDrag.x = e.clientX;
      budgetDrag.y = e.clientY;
      budgetDrag.t = e.timeStamp;
      return;
    }
    if (e.pointerType !== 'mouse') return;
    const r = slot.getBoundingClientRect();
    hover.tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    hover.ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
  });
  slot.addEventListener('pointerleave', () => { hover.tx = 0; hover.ty = 0; });
  slot.addEventListener('pointerdown', (e) => {
    if (!renderer || !travellerAtBudget() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    budgetDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    tbBudget.drag = true;
    tbBudget.w.set(0, 0, 0);
    try { slot.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    slot.classList.add('is-dragging');
    if (e.pointerType === 'mouse') e.preventDefault();
  });
  const end = (e) => {
    if (!budgetDrag || e.pointerId !== budgetDrag.id) return;
    tbBudget.release(e.timeStamp);
    budgetDrag = null;
    slot.classList.remove('is-dragging');
  };
  slot.addEventListener('pointerup', end);
  slot.addEventListener('pointercancel', end);
  slot.addEventListener('lostpointercapture', end);
}

/* ------------------------------------------------------------------ */
/* Scratch card                                                        */
/* ------------------------------------------------------------------ */

const SC = {
  ctx: null, dpr: 1, w: 0, h: 0,
  segs: [], grid: new Uint8Array(GW * GH), cleared: 0, revealed: false,
  active: false, dragging: false, armed: false, pid: null,
  px: 0, py: 0, cx: 0, cy: 0, last: null,
  tiltX: 0, tiltY: 0, owner: null,
};
let coverReady = false;

function paintCoverBase() {
  const { ctx, w, h } = SC;
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#a6a6a2');
  g.addColorStop(0.38, '#c6c6c2');
  g.addColorStop(0.52, '#b2b2ae');
  g.addColorStop(0.7, '#c0c0bc');
  g.addColorStop(1, '#8d8d89');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Brushed-metal grain, seeded so a repaint looks identical.
  const rnd = mulberry32(42);
  for (let y = 0; y < h; y += 1.5) {
    ctx.globalAlpha = 0.05 + rnd() * 0.07;
    ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#5d5d59';
    ctx.fillRect(0, y, w, 0.75);
  }
  ctx.globalAlpha = 1;
  const big = M.mobile ? 10 : 11 * M.s * 1.25;
  ctx.fillStyle = '#5f5f5b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.max(10, big)}px Manrope, Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.max(1.6, big * 0.2)}px`;
  ctx.fillText('SCRATCH WITH THE COIN TO GET YOUR INVITE', w / 2, h / 2 - big * 0.9);
  ctx.globalAlpha = 0.75;
  ctx.font = `500 ${Math.max(9, big * 0.9)}px Manrope, Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.max(1, big * 0.12)}px`;
  ctx.fillText(M.mobile ? 'or tap the coin and press Enter' : 'or focus the coin and press Enter', w / 2, h / 2 + big * 1.1);
  ctx.globalAlpha = 1;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function drawSeg(seg) {
  const { ctx, w, h } = SC;
  const r = seg.r * w;
  const ax = seg.a[0] * w;
  const ay = seg.a[1] * h;
  const bx = seg.b[0] * w;
  const by = seg.b[1] * h;
  const rnd = mulberry32(seg.seed);
  const len = Math.hypot(bx - ax, by - ay) || 1;
  const nx = -(by - ay) / len;
  const ny = (bx - ax) / len;
  const j = () => (rnd() - 0.5) * r * 0.35;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.9 + rnd() * 0.1;
  ctx.lineWidth = r * (1.2 + rnd() * 0.45);
  ctx.beginPath();
  ctx.moveTo(ax + j(), ay + j());
  ctx.lineTo(bx + j() + 0.01, by + j());
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const o = (rnd() - 0.5) * 2.1 * r;
    ctx.globalAlpha = 0.35 + rnd() * 0.55;
    ctx.lineWidth = 0.7 + rnd() * 1.9;
    ctx.beginPath();
    ctx.moveTo(ax + nx * o, ay + ny * o);
    ctx.lineTo(bx + nx * o + 0.01, by + ny * o);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function markSeg(seg) {
  const w = SC.w;
  const h = SC.h;
  const r = seg.r * w * 0.92;
  const ax = seg.a[0] * w;
  const ay = seg.a[1] * h;
  const bx = seg.b[0] * w;
  const by = seg.b[1] * h;
  const cw = w / GW;
  const chh = h / GH;
  const x0 = clamp(Math.floor((Math.min(ax, bx) - r) / cw), 0, GW - 1);
  const x1 = clamp(Math.floor((Math.max(ax, bx) + r) / cw), 0, GW - 1);
  const y0 = clamp(Math.floor((Math.min(ay, by) - r) / chh), 0, GH - 1);
  const y1 = clamp(Math.floor((Math.max(ay, by) + r) / chh), 0, GH - 1);
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      const i = gy * GW + gx;
      if (SC.grid[i]) continue;
      const px = (gx + 0.5) * cw;
      const py = (gy + 0.5) * chh;
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
      if (Math.hypot(px - (ax + dx * t), py - (ay + dy * t)) <= r) {
        SC.grid[i] = 1;
        SC.cleared++;
      }
    }
  }
}

function resizeCover() {
  const r = el.scratch.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (Math.abs(w - SC.w) < 0.5 && Math.abs(h - SC.h) < 0.5 && dpr === SC.dpr && SC.ctx) return;
  SC.w = w; SC.h = h; SC.dpr = dpr;
  el.cover.width = Math.round(w * dpr);
  el.cover.height = Math.round(h * dpr);
  SC.ctx = el.cover.getContext('2d');
  SC.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintCoverBase();
  for (const seg of SC.segs) drawSeg(seg);
}

function addSeg(u0, v0, u1, v1) {
  const seg = { a: [u0, v0], b: [u1, v1], r: M.brush / SC.w, seed: (Math.random() * 2 ** 31) | 0 };
  SC.segs.push(seg);
  drawSeg(seg);
  markSeg(seg);
}

function brushAt(x, y, sy) {
  const cx = M.card.x;
  const cy = M.card.y - sy;
  const r = M.brush;
  if (x < cx - r || x > cx + M.card.w + r || y < cy - r || y > cy + M.card.h + r) { SC.last = null; return; }
  const u = (x - cx) / M.card.w;
  const v = (y - cy) / M.card.h;
  if (!SC.last) {
    addSeg(u, v, u, v);
    SC.last = [u, v];
    return;
  }
  if (Math.hypot((u - SC.last[0]) * M.card.w, (v - SC.last[1]) * M.card.h) < 1.5) return;
  addSeg(SC.last[0], SC.last[1], u, v);
  SC.last = [u, v];
}

function reveal() {
  if (SC.revealed) return;
  SC.revealed = true;
  SC.dragging = false;
  SC.last = null;
  el.scratch.classList.add('is-revealed');
  el.panel.inert = false;
  el.panel.removeAttribute('inert');
  el.dock.classList.remove('is-dragging');
  el.dock.setAttribute('aria-label', 'Glass coin');
  el.dock.tabIndex = -1;
  el.status.textContent = 'Invite unlocked. The group opens in a new tab.';
  setTimeout(() => { el.cover.hidden = true; }, reduced ? 0 : 440);
  el.joinBtn.focus({ preventScroll: true });
}

function dockScreen(sy) {
  return [M.dock.x, M.dock.y - sy];
}

function startScratch(e, owner) {
  if (SC.revealed || SC.dragging) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (renderer && !travellerAtNews()) return;
  const wasActive = SC.active;
  if (!wasActive) [SC.cx, SC.cy] = dockScreen(window.scrollY);
  SC.dragging = true;
  SC.active = true;
  SC.pid = e.pointerId;
  SC.owner = owner;
  SC.px = e.clientX;
  SC.py = e.clientY;
  SC.armed = owner === el.dock;
  SC.last = null;
  try { owner.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  el.dock.classList.add('is-dragging');
  e.preventDefault();
}

function moveScratch(e) {
  if (!SC.dragging || e.pointerId !== SC.pid) return;
  SC.px = e.clientX;
  SC.py = e.clientY;
}

function endScratch(e) {
  if (!SC.dragging || e.pointerId !== SC.pid) return;
  SC.dragging = false;
  SC.last = null;
  el.dock.classList.remove('is-dragging');
  if (SC.cleared / (GW * GH) >= SCRATCH_GOAL) reveal();
}

function scratchFrame(dt, sy) {
  if (!SC.active) return;
  const [dx, dy] = dockScreen(sy);
  const tx = SC.dragging ? SC.px : dx;
  const ty = SC.dragging ? SC.py : dy;
  const k = reduced ? 1 : 1 - Math.exp(-dt * (SC.dragging ? 15 : 9));
  const ox = SC.cx;
  const oy = SC.cy;
  SC.cx += (tx - SC.cx) * k;
  SC.cy += (ty - SC.cy) * k;
  if (reduced) {
    SC.tiltX = 0;
    SC.tiltY = 0;
  } else {
    const vx = (SC.cx - ox) / Math.max(dt, 1 / 240);
    const vy = (SC.cy - oy) / Math.max(dt, 1 / 240);
    const kt = 1 - Math.exp(-dt * 10);
    SC.tiltX += (clamp(vy * 0.0011, -0.5, 0.5) - SC.tiltX) * kt;
    SC.tiltY += (clamp(vx * 0.0011, -0.6, 0.6) - SC.tiltY) * kt;
  }
  if (SC.dragging && !SC.revealed) {
    if (!SC.armed && Math.hypot(SC.px - SC.cx, SC.py - SC.cy) < 28) SC.armed = true;
    if (SC.armed) brushAt(SC.cx, SC.cy, sy);
  }
  if (!renderer && el.dockCoin) {
    const k = M.mobile ? 1 : M.s;
    el.dockCoin.style.transform = `translate(calc(-50% + ${(SC.cx - dx) / k}px), calc(-50% + ${(SC.cy - dy) / k}px)) rotate(${SC.tiltY * 30}deg)`;
  }
  if (!SC.dragging && Math.hypot(tx - SC.cx, ty - SC.cy) < 0.5 && Math.abs(SC.tiltX) + Math.abs(SC.tiltY) < 0.01) {
    SC.active = false;
    if (!renderer && el.dockCoin) el.dockCoin.style.transform = '';
  }
}

function initScratch() {
  el.dock.addEventListener('pointerdown', (e) => startScratch(e, el.dock));
  el.cover.addEventListener('pointerdown', (e) => startScratch(e, el.cover));
  for (const node of [el.dock, el.cover]) {
    node.addEventListener('pointermove', moveScratch);
    node.addEventListener('pointerup', endScratch);
    node.addEventListener('pointercancel', endScratch);
    node.addEventListener('lostpointercapture', endScratch);
  }
  el.dock.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      reveal();
    }
  });
  el.dock.addEventListener('click', (e) => e.preventDefault());
  el.dock.addEventListener('dragstart', (e) => e.preventDefault());
  coverReady = true;
  resizeCover();
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

function initMenu() {
  const btn = el.menuBtn;
  const menu = el.menu;
  const set = (open, focusButton) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (!open && focusButton) btn.focus();
  };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('button')) set(false); });
  document.addEventListener('pointerdown', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) set(false, true);
  });
  mqMobile.addEventListener('change', (e) => { if (!e.matches) set(false); });
}

/* ------------------------------------------------------------------ */
/* Loop                                                                */
/* ------------------------------------------------------------------ */

let lastNow = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = lastNow ? clamp((now - lastNow) / 1000, 0, 0.05) : 0;
  lastNow = now;
  time += reduced ? 0 : dt;
  const sy = window.scrollY;

  const pinStart = M.storyTop;
  const pinEnd = M.storyTop + M.storyH - M.pinH;
  updateReveal(clamp((sy - pinStart) / Math.max(1, (pinEnd - pinStart) * 0.88), 0, 1));
  const pinTop = pinScreenTop(sy);
  for (let k = 0; k < 2; k++) {
    const y = pinTop + M.slots[k].dy;
    const visible = y > -M.slotD && y < M.ch + M.slotD;
    if (slotReached[k] && visible && !reduced) storySpin[k] += dt;
  }

  if (renderer) {
    updateHeroClip();
    heroFrame(dt, sy);
    scratchFrame(dt, sy);
    travellerFrame(dt, sy);
    storyCoinFrame(sy);
    shadowFrame();
    renderFrame();
  } else {
    scratchFrame(dt, sy);
  }
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  await Promise.race([
    Promise.all([
      document.fonts.load('400 80px "Instrument Serif"'),
      document.fonts.load('400 16px Manrope'),
      document.fonts.load('600 16px Manrope'),
    ]).then(() => document.fonts.ready),
    wait(6000),
  ]);
}

function applyJoinUrl() {
  const url = window.BLACKBOX_JOIN_URL;
  if (!url) return;
  document.querySelectorAll('[data-join]').forEach((a) => { a.href = url; });
}

let resizeQueued = false;
function queueMeasure() {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    measure();
  });
}

async function boot() {
  applyJoinUrl();
  splitStory();
  initMenu();
  measure();
  try {
    initGL();
  } catch (err) {
    console.warn('WebGL unavailable, showing static coins.', err);
    renderer = null;
    root.classList.add('no-gl');
  }
  initHeroPointer();
  initBudgetPointer();
  initScratch();

  await fontsReady();
  measure();
  SC.w = 0;
  resizeCover();

  if (renderer) {
    for (const c of heroCoins) c.group.visible = true;
    for (const k in storyCoins) storyCoins[k].visible = true;
    try {
      if (renderer.compileAsync) await Promise.race([renderer.compileAsync(scene, camera), wait(8000)]);
      else renderer.compile(scene, camera);
    } catch (_) { /* compile lazily on first render */ }
  }

  requestAnimationFrame(frame);
  window.addEventListener('resize', queueMeasure);
  if ('ResizeObserver' in window) new ResizeObserver(queueMeasure).observe(document.body);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', queueMeasure);

  await nextFrame();
  await nextFrame();

  window.__bbBoot.done = true;
  root.setAttribute('data-loading', 'false');
  measure();
  el.preloader.classList.add('is-leaving');
  setTimeout(() => el.preloader.remove(), reduced ? 0 : 440);
}

boot().catch((err) => {
  console.error(err);
  if (window.__bbBoot) window.__bbBoot.fail();
});
