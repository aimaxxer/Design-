# Stat card renders

Source for `public/images/stat-rebate.webp` and `public/images/stat-multiplier.webp`: two Three.js
scenes rendered in headless Chromium, so they can be tweaked and rendered again.

```bash
cd scripts/stat-renders
npm install
npm run bundle
node render.cjs coins site 3200 coins.png
node render.cjs orbit site 3200 orbit.png 0.08,0.04,0.93,0.6
```

Arguments: scene (`coins` | `orbit`), palette (`site` | `champagne`), size in px, and an optional
frame box `left,top,right,bottom` (0-1) the objects are fitted into. Downscale the 3200px PNG to
1600px and save it as WebP (quality 88) into `public/images/`. The background renders at exactly
#EFF2F1, the stat cards' grey, so no colour correction is needed.
