# 10X Trader

Landing page for 10xtrader.com, built on the Launchex framework (white inset card, notch nav,
chamfered geometry, navy type and one accent sampled from the 10X coin, #0068a2) with live three.js 10X coins.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # type-check + production build -> dist/
npx oxlint src   # lint the app source
```

## Sections (8 chapters, live-site anchors kept)

| # | id | Content | Coins |
|---|---|---|---|
| 01 | `top` | Hero: "Enter the markets / 10X smarter" | Six drifting coins (`TenXCoinRow`) in place of the framework's video |
| 02 | `features` | Benefits, framework nominations layout | One coin in place of the centre video; it turns when a benefit is picked |
| 03 | `model` | The 10X model, framework "about" layout + 3 stat cards | Stat-card images are stills of the coin (`public/images/coin-stat-*.webp`) |
| 04 | `process` | Process flow, 4 steps on a rising staircase | |
| 05 | `calculator` | Sentence calculator + growth chart | |
| 06 | `plans` | Standard, Prime, Prime X | One coin per plan, a shade deeper per tier |
| 07 | `compare` | 10X vs traditional brokers vs prop firms | |
| 08 | `faq` | 5 questions, then the closing CTA and legal footer | Closing coin |

All copy lives in `src/content.ts`, taken from www.10xtrader.com (October 2026).

## Notes

- **Calculator** (`src/lib/projection.ts`) reproduces the live site's formula exactly (checked against
  its output). It opens on a modest scenario ($5,000 at 2% a month since January 2025) with a
  "hypothetical illustration" note, instead of the live site's 5% since 2022.
- **Coins** come from `/Users/sam/Design /10x-coin` (copied into `src/coin/`). three.js loads in its own
  chunk; below-the-fold coins build their WebGL scene only when they are about to scroll into view.
  At most about six canvases exist, and each pauses offscreen.
- **Links**: "Open an account" goes to `https://app.10xtrader.com/sign-up/standard` (the live site
  uses that link for every plan), "Log in" to `https://app.10xtrader.com/`, legal links to the live
  `/legals/*` pages.
- **Not carried over**: the live site's social links (Twitter, YouTube, Instagram, Telegram) have no
  URLs, so they are left out until real ones exist; its chat widget is not part of this page.
- Copy edits from the live site: fixed "trade bigger while and scale faster" and two punctuation slips.

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
  providers/ScrollProvider.tsx  Lenis smooth scroll on the inner scroller, driven by GSAP's ticker; owns #hash links
  hooks/useChapter.ts    The 8 section ids the notch nav, page counter and mobile CTA track
  hooks/useReveal.ts     [data-reveal] elements rise in on scroll (GSAP ScrollTrigger.batch)
  lib/projection.ts      Calculator formula (matches the live 10xtrader.com calculator exactly)
  components/sections/   Hero, Benefits, Model, Process, Calculator, Plans, Comparison, Faq, Footer
  components/ui/         ChamferButton, ChamferFrame, Accordion, AnimatedNumber, Logo, LazyCoin
  components/overlays/   Notch nav, "01 - 08" counter, scroll hint, floating mobile CTA
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
