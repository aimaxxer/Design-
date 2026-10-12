# CLAUDE.md: 10X Affiliation landing page

Context for Claude Code when working in this repo. Read README.md for the launch checklist.

## What this is

The partner-acquisition site for **10X Affiliation**, the partner program of 10X Trader. It is aimed at
IBs (introducing brokers), affiliates, PAMM / copy-trade managers and trading communities. The pitch:
on average 40% more rebate per lot, the 10X Trader product (clients get 10x their deposit as buying
power), and a dedicated partner manager. The funnel: landing page, then a 6-question qualifier, then
booking a 30-minute strategy call.

The layout follows a "Launchex Awards" template brief: a white inset shell with a rounded card that
scrolls internally, a notch nav hanging from the top, chamfered clip-path corners everywhere, TT Firs
Neue for display type and Inter for body, navy #154359 text and one teal #066377 action colour.

Tone: premium and institutional but accessible to retail traders. Claims stay realistic, with no
hype numbers beyond the ones already in `src/content.ts`.

## Commands

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build -> dist/
npm run lint     # oxlint
npx tsc -b       # type-check only
```

## Stack

React 19, Vite, Tailwind CSS v4 (CSS-first config in `src/index.css` `@theme`, no tailwind.config),
TypeScript, lucide-react icons, GSAP + ScrollTrigger (+ @gsap/react), Lenis smooth scroll, Motion
(`motion/react`). React Bits components (SplitText, ShinyText, CountUp) were installed into
`src/components/bits/`. They are MIT + Commons Clause: use and modify freely in this app, but don't
redistribute them as components.

## Structure

```
src/
  content.ts               ALL visible copy, numbers, links and placeholders. Edit copy here only.
  index.css                Design tokens (@theme), chamfer-* utilities, .text-gradient, range slider
  App.tsx                  Inset shell + inner scroller + section order + overlays
  providers/ScrollProvider Lenis on the inner scroller, driven by GSAP's ticker; owns #hash links
  hooks/useChapter.ts      SECTION_IDS: the 6 chapters the nav, page counter and mobile CTA track
  lib/estimate.ts          Calculator formula (shared with the qualifier payload)
  components/
    overlays/Overlays.tsx  Notch nav, "01 - 06" counter, scroll hint, floating mobile CTA
    sections/              Hero, Problems, Results, Calculator, Trader, Apply, Qualifier
    ui/                    ChamferButton, ChamferFrame, Field inputs, Accordion, LoopVideo, Ph, Logo
    bits/                  React Bits components
  coin/                    Live 3D 10X coins (three.js) for the 10X Trader panel. coin3d/logo/stage/motion
                           are copied unchanged from the 10x-trader project; trio.ts is the panel's scene
public/videos, public/images   Self-hosted media (see README "Media")
```

## Gotchas

- **The page never scrolls the document.** It scrolls the `.no-scrollbar` div inside the rounded
  card. `App.tsx` calls `ScrollTrigger.defaults({ scroller })` before sections mount, so every
  ScrollTrigger must be created inside a mounted section (they are, via `useGSAP`). Don't use
  `window.scrollY` or window scroll listeners. Use ScrollTrigger, IntersectionObserver with
  `root: scroller`, or `useScrollContext().scrollTo()`.
- In-page links (`href="#apply"`) are intercepted by ScrollProvider for Lenis smooth scrolling.
  Add `data-move-focus` to move keyboard focus to the target too.
- Every GSAP effect is wrapped in `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.
  Keep that pattern so reduced-motion users get the static page.
- TT Firs Neue ships one weight from the CDN. `.font-firs` disables synthetic bold; `font-semibold`
  on Firs headings is intentional (the template asks for it) and has no visual effect.
- The coins (`src/coin/`) must stay identical to the 10x-trader project's coin: change placement and
  motion in `trio.ts` only. three.js is lazy-loaded by `CoinTrio`; keep it out of the main bundle.
- `Ph` renders placeholder values from `content.ts` with an amber dashed outline on the dev server
  only. Production shows the plain text, so fill placeholders before launch.

## Conventions

- Copy: no em dashes or en dashes anywhere visible; use periods, commas or colons. Ranges use a
  hyphen ("2-3x", "500-2,000 lots").
- One label per intent: the primary CTA is always `cta.primary` ("Book my strategy call"), and
  `cta.short` on small buttons.
- Shapes: chamfered corners (`chamfer-6/8/10/16/24`), never rounded cards. Borders are a 1px
  clipped layer behind a clipped face (`bg-line p-px` > `bg-white`), because clip-path cuts off
  real CSS borders.
- Colours come from the `@theme` tokens (`navy`, `navy-2`, `navy-3`, `teal`, `sky`, `mist`,
  `frost`, `line`, `line-strong`). Text tokens pass WCAG AA on both section grounds.
- Section grounds alternate `mist` (#F0F0F0) and `frost` (#F0F5F7). Each section ends with a
  bottom fade into the next section's colour.
- Motion: one scroll-scrubbed signature moment (the 10X Trader "how it works" panels). Everything
  else is a one-time reveal on enter.

## Integrations (env vars, see .env.example)

- `VITE_QUALIFIER_ENDPOINT`: the qualifier POSTs JSON here (CRM webhook, Zapier, Make, n8n). Empty =
  simulated, and the payload is logged to the console.
- `VITE_CALENDLY_URL`: the booking embed. Name, email and region are prefilled. Empty = a
  placeholder panel.

## Deploying

`vercel.json` is set up for Vite (`npm run build`, output `dist`). Run `vercel` from this folder to
link it to your own Vercel project, then `vercel deploy --prod`.
