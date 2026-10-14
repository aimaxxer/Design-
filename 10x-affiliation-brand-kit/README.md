# 10X Affiliation brand kit

Everything needed to make motion and social for 10X Affiliation on your own machine. Open `index.html` in a browser for the brand book; every file it mentions is in this folder.

## Start here

1. Install the five Inter fonts in `fonts/` (Light, Regular, Medium, SemiBold, Bold). Use Inter, not Inter Display: the posts were fitted to Inter.
2. After Effects: File › Scripts › Run Script File… › `motion/10x-brand-comps.jsx`. It builds 4:5, square, story and landscape comps at 30 fps with the navy ground, sample type, the coin and safe-zone guide layers.
3. Paste curves, count-ups, the coin float and the shine sweep from `motion/after-effects-expressions.md`.

## Folder map

| Folder | What is in it |
| --- | --- |
| `index.html` | The brand book: essentials, logo, colour, type, coin, imagery, layout, motion, files. |
| `coin/stills/` | Seven coin poses, 2048 px transparent PNG (hero, lean right, front, near front, three-quarter, cut-out, edge). |
| `coin/turn/` | The 6-second seamless turn: 180 transparent PNGs at 1080 px. Import as a PNG sequence at 30 fps. |
| `coin/video/` | The same turn as alpha WebM (VP9), and as MP4 on navy, on frost and as a 1080 × 1920 story. |
| `coin-studio/` | Open `index.html` in Chrome to render any coin pose, size (up to 2048), length, frame rate, tint or finish as a PNG sequence. Works offline. |
| `logo/` | Lockups and the mark as SVG (text outlined), `pdf/` for After Effects, `png/` at 2600 px, and the app icon. |
| `fonts/` | Inter 4, five weights, with the OFL licence. |
| `tokens/` | `tokens.json` (colours, grounds, gradients, type scale, layout), `tokens.css`, `10x-affiliation.ase` swatches, `colors.txt`. |
| `motion/` | `motion.json` (curves, After Effects velocity values, durations in frames, signature moves), the AE expressions and the comp setup script. |
| `imagery/` | Glass sculptures, macro textures, aurora gradients, story grounds, hero stills and the site's glass video loops. |
| `templates/safe-zones/` | Transparent guide overlays for 1080 × 1350, 1080 × 1080, 1080 × 1920 and 1920 × 1080. |
| `examples/` | Approved posts from the batches, for reference. |
| `book/` | Small previews used by the brand book page. |

## Motion in one table

| Token | Value | Use |
| --- | --- | --- |
| ease-out-strong | cubic-bezier(0.23, 1, 0.32, 1) | Entrances, hovers, state changes |
| ease-reveal | cubic-bezier(0.16, 1, 0.3, 1) | Reveals and settles (GSAP expo.out on the site) |
| ease-in-out-strong | cubic-bezier(0.77, 0, 0.175, 1) | Moves while on screen, camera |
| reveal | 1.1 s, rise 24 px, 80 ms stagger | Blocks in reading order |
| hero | 1.3 s, characters 40 ms apart | Headline line 1 |
| count | spring, lands about 2.1 s | Numbers |
| coin turn | 6 s linear, float 5.2% of radius | Loops |

After Effects keyframe velocity for ease-out-strong: first keyframe outgoing influence 23%, speed 4.35 × (change ÷ duration); last keyframe incoming influence 68%, speed 0. All curves are in `motion/motion.json`.

## Rules that matter most

- Write **IB’s**, never IBS. Type headlines in capitals with All Caps off so the s stays lowercase.
- No em or en dashes. Ranges take a hyphen: 2-3x.
- One hero per frame: the coin, a number or the headline.
- Nothing bounces, shakes or flashes. Linear easing only for loops.
- Frames about 10X Trader mechanics carry the risk line: “Leveraged trading carries a high level of risk. 10X Trader is not available in the US.”

## Licences

Inter is under the SIL Open Font License (`fonts/OFL.txt`). The coin studio bundles three.js (MIT, `coin-studio/THREE-LICENSE.txt`) with the coin code from the 10X Trader site.
