# 10X Trader

Landing page for 10xtrader.com, built on the Launchex framework (white inset card, notch nav,
chamfered geometry, navy type and one accent sampled from the 10X coin, #0068a2) with live three.js 10X coins.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # type-check + production build -> dist/
npx oxlint src   # lint the app source
```

## Sections

The page follows `docs/10X_TRADER_SITE_SOURCE_OF_TRUTH.md`: when anything conflicts with it, that
document wins. All copy lives in `src/content.ts`.

| # | id | Content | Coins |
|---|---|---|---|
| 0 | `top` | Hero: "Deposit $1,000. / Trade with $10,000.", trust chips, qualifier line | Six drifting coins (`TenXCoinRow`) |
| 1 | `problem` | Problem in the signature coin layout (as Benefits): five steps + the bridge line as cards around the coin, then "Built against you / Built for you" | One coin; it turns when a step is picked |
| 2 | `model` | The aligned model: three paragraphs + 3 stat cards | Stat-card images are coin stills (`public/images/coin-stat-*.webp`) |
| 3 | `compare` | 10X vs standard broker vs prop firm, 8 rows (3 above the fold on phones) | |
| 4 | `calculator` | Sentence calculator + growth chart, $1,000 default | |
| 5 | `process` | Live the same day: 4 steps on a rising staircase | |
| 6 | `ladder` | Where it goes: three rungs | |
| 7 | `features` | What you get: six benefits around one coin | One coin; it turns when a benefit is picked |
| 8 | `plans` | Standard, Prime, Prime X | One coin per plan |
| 9 | `proof` | Traders, numbers, community. **Hidden** while `content.proof` has `[placeholder]` values | |
| 10 | `faq` | 11 questions + WhatsApp / Discord line | |
| 11 | footer | Closing CTA, chips, WhatsApp button, tagline, legal | Closing coin |

## Notes

- **Second section**: Problem uses the same coin-and-cards layout as Benefits (`components/ui/PickCard.tsx`),
  so the second section matches the other 10X pages. This replaces the brief's vertical list + sticky panel (section 5.1).
- **One action**: every primary button reads `cta.primary` ("Start Trading 10X") and links to `links.signUp`.
- **Proof guard** (`src/lib/placeholders.ts`): while any Proof figure or testimonial still contains `[`,
  the section renders nothing and drops out of the nav counter. Fill `content.proof` to switch it on.
- **Open items** (source of truth, section 8): `links.whatsapp` and `links.discord` are `#` until the
  real links exist; plan names and conditions are to be confirmed; Proof figures are to be supplied.
- **Calculator** (`src/lib/projection.ts`) keeps the live site's formula. The deposit field takes
  $100 to $100,000 (out-of-range entries settle to the nearest end on blur).
- **Header at narrower widths**: the notch nav shows from 1280px; below that the floating CTA takes
  over. The logo tagline and "Log in" show wherever they fit beside the nav.
- **Coins**: three.js loads in its own chunk; below-the-fold coins build their WebGL scene only when
  they are about to scroll into view. At most about six canvases exist, and each pauses offscreen.

## Handover: continuing the build

**Live:** https://10x-trader.vercel.app (Vercel project `10x-trader` on Sam's account). This
package deliberately leaves out the `.vercel` link, so `vercel deploy` from your copy creates or
links a project under your own account and cannot overwrite the live site by accident. Ask Sam to
add you to the project if you should deploy to the same one.

**Requirements:** Node 20+ (built with Node 26, npm 11). Run `npm install`, then `npm run dev`.

### Where things live

```
src/
  content.ts             ALL visible copy, numbers and links. Edit copy here only.
  index.css              Design tokens (@theme), chamfer-* clip-path utilities, .text-gradient, calculator field styles
  App.tsx                Inset shell (white frame + rounded card that scrolls internally), section order, overlays
  lib/placeholders.ts    Proof guard: hides the Proof section while its copy has [placeholders]
  providers/ScrollProvider.tsx  Lenis smooth scroll on the inner scroller, driven by GSAP's ticker; owns #hash links
  hooks/useChapter.ts    The section ids the notch nav, page counter and mobile CTA track
  hooks/useReveal.ts     [data-reveal] elements rise in on scroll (GSAP ScrollTrigger.batch)
  lib/projection.ts      Calculator formula (matches the live 10xtrader.com calculator exactly)
  components/sections/   Hero, Problem, Model, Comparison, Calculator, Process, Ladder, Benefits, Plans, Proof, Faq, Footer
  components/ui/         ChamferButton, ChamferFrame, Chip, Eyebrow, Accordion, AnimatedNumber, Logo, LazyCoin
  components/overlays/   Notch nav, chapter counter, scroll hint, floating mobile CTA
  components/bits/       React Bits components (SplitText, ShinyText, CountUp)
  coin/                  The 3D 10X coin (three.js): see below
public/images/coin-stat-*.webp   Stills of the coin used as the stat-card images
```

### The 10X coins (`src/coin/`)

- `TenXCoin` (one coin) and `TenXCoinRow` (six drifting coins, the hero) are React wrappers around
  framework-free mounts (`mount.ts`, `row.ts`). Geometry, glass material and the procedural studio
  lighting are in `coin3d.ts`; the 10X mark is traced in `logo.ts`.
- Useful props: `tint` (glass colour, default `#4bbdf0`), `finish` (`'engraved' | 'cutout'`, the row
  also takes `'mixed'`), `spinPeriod`, `fill`/`size`, `interactive`. The single coin's handle has
  `spin(turns, seconds)` (the Benefits section uses it when a card is picked).
- three.js is lazy-loaded in its own chunk. Below-the-fold coins only build their WebGL scene when
  they come near the viewport (`LazyCoin`), and every canvas pauses offscreen, in hidden tabs and
  under prefers-reduced-motion. Without WebGL each coin falls back to a flat SVG.
- Each coin is its own WebGL context (about six on the page). Browsers allow roughly 16, so for many
  more coins put them in one scene with `createCoin3D()` instead.

### Gotchas

- **The page never scrolls the document.** It scrolls the `.no-scrollbar` div inside the rounded
  card. `App.tsx` sets `ScrollTrigger.defaults({ scroller })` before sections mount, so create every
  ScrollTrigger inside a mounted section (`useGSAP`). Don't use `window.scrollY` or window scroll
  listeners; use ScrollTrigger, IntersectionObserver, or `useScrollContext().scrollTo()`.
- Every GSAP effect is wrapped in `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, so
  reduced-motion visitors get the static page. Keep that pattern.
- **Accent colour:** `--color-accent: #0068a2` is the coin's rendered body colour (sampled from the
  renders), `--color-deep: #014d7e` its shadow, `--color-sky: #4bbdf0` its highlight. Navy `#154359`
  is the text colour. Use the tokens (`bg-accent`, `text-accent`, ...), not raw hex.
- Shapes are chamfered (clip-path), never rounded cards. Borders are a 1px clipped layer behind a
  clipped face (`bg-line p-px` > `bg-white`), because clip-path cuts off real CSS borders.
- TT Firs Neue ships one weight from the CDN; `.font-firs` disables synthetic bold on purpose.
- Copy rule: no em or en dashes in visible text.
- If the coin tint changes, re-render the three `coin-stat-*.webp` stills to match (1024x1024, coin
  top-right on `#f0f0f0`, same glass settings as `coin3d.ts`).
