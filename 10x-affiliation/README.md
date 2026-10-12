# 10X Affiliation

Partner-acquisition landing page for IBs, affiliates, PAMM managers and trading communities.
Content comes from the "10X Affiliation Funnel" design canvas (landing, qualifier, booking). The layout
follows the Launchex Awards template: an inset rounded shell, a notch nav, chamfered clip-paths,
TT Firs Neue + Inter, and a navy/teal palette.

React + Vite + Tailwind v4 + TypeScript + lucide-react, with GSAP ScrollTrigger, Lenis and Motion.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (the Design folder's launch config uses port 5176)
npm run build
```

## Page

| # | Section | File |
|---|---------|------|
| 01 | Hero: glass video loop, "Scale 10X smarter" | `src/components/sections/Hero.tsx` |
| 02 | Problems: six walls around the glass loop, pick one to see the fix | `Problems.tsx` |
| 03 | Results: +40% / 2-3x / 1 hour cards, partner kit bento, proof | `Results.tsx` |
| 04 | Earnings calculator (the canvas formula) + broker logos | `Calculator.tsx` |
| 05 | 10X Trader, with a scroll-scrubbed "how it works" | `Trader.tsx` |
| 06 | 3 steps, 6-question qualifier, booking, FAQ, final CTA, footer | `Apply.tsx`, `Qualifier.tsx` |

Every visible string lives in `src/content.ts`.

## Before launch

Placeholders show an amber dashed outline on the dev server only. Fill them in `src/content.ts`:

- `proof`: partner names, quotes and results. The three stills are placeholders from the canvas; add
  `video: '/videos/<file>.mp4'` per card to play real testimonials inline.
- `trader.disclosure` and `footer.risk`: product terms and the compliance risk warning.
- `links`: WhatsApp (the button stays hidden until set), Telegram partner channel, Terms, Privacy and
  Risk disclosure URLs.
- `.env.local` (see `.env.example`): `VITE_QUALIFIER_ENDPOINT` (where answers are POSTed) and
  `VITE_CALENDLY_URL` (the booking embed). Until set, submissions are simulated and logged to the console.
- Partner brokers: the copy no longer says "four" because only three logos exist (PU Prime,
  MarketsVox, STG Trader). Add the fourth to `brokers` if there is one.

## Qualifier payload

`{ reference, submittedAt, track: 'partner' | 'growth', role, clients, volume, blockers[], broker,
name, email, handle, region, estimate, source }`, where `estimate` is the visitor's last calculator
result and `source` holds `?ref=` / `utm_*` attribution. Partner track = not "just starting out" and
either 26+ funded clients or 500+ lots a month (the canvas rule). `region` was added so the booking
can route to the right partner manager.

## Media

- `public/videos/hero.mp4`, `hero-sm.mp4` (phones, centre crop), `glass.mp4`, and the
  `public/images/glass-*.webp` stat images: the abstract glass renders supplied with the Launchex
  template prompt, re-encoded for the web. Swap in 10X-owned Higgsfield loops when credits allow:
  same file names, start frame = end frame, and refresh the posters in `public/videos/posters/`.
- Broker logos and partner photos were exported from the funnel canvas.
- TT Firs Neue loads from onlinewebfonts as the template specifies; it needs a licence before launch.
