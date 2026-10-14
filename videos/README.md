# 10X Affiliation reels

Five 15-second, 1080 × 1920, 30 fps reels built with [HyperFrames](https://github.com/heygen-com/hyperframes) from the brand book in `../10x-affiliation-brand-kit`. Each folder is a self-contained HyperFrames project; the rendered MP4 is in its `renders/` folder.

| Reel | Message | Hero moment |
| --- | --- | --- |
| `10x-reel-01-money-on-the-table` | Same clients, same accounts: on average 40% more per lot. | +40% count-up with old deal vs new deal bars |
| `10x-reel-02-buying-power` | 10X Trader: 1:9 credit, 10x buying power; 2-3x more rebates per client. | The coin spins in, the credit block multiplies 1X to 10X |
| `10x-reel-03-structure` | Not because of skill. Because of structure. | A wall of pain points splits along the 10X diagonal |
| `10x-reel-04-within-1-hour` | Your offer within 1 hour of the call. | A 60-minute dial, three steps, three phone notifications |
| `10x-reel-05-infrastructure` | The partner infrastructure behind top IB’s. | 3D camera flight past five cards, then a coin logo sting |

## Edit or re-render

```bash
cd 10x-reel-01-money-on-the-table
npx hyperframes preview      # Studio: click anything to edit, scrub the timeline
npx hyperframes check        # lint, layout, motion and contrast
npx hyperframes render . -q delivery -o renders/10x-reel-01-money-on-the-table.mp4
```

The first render on a new machine downloads Chrome Headless Shell (`npx hyperframes browser ensure`).

## What is shared

- `DESIGN.md`: the brand truth every reel follows (copied into each project).
- `_tools/brand.js`: brand curves as GSAP CustomEases (`brandOut`, `brandReveal`, `brandInOut`, `softOut`), text splitting, and the three transitions: the diagonal band wipe on the 45° line of the 10X mark, the chamfered block wipe, and the zoom-through.
- `_tools/synth.py`: the soundtracks. Each reel has a 120 BPM bed with sound effects placed on the same 0.5s grid as the cuts, synthesised with numpy and scipy, normalised to -14 LUFS. Run `python3 _tools/synth.py v1 out.wav` (v1 to v5) to rebuild one.
- GSAP 3.14 (with CustomEase) is bundled in each project's `assets/` so renders need no network.

## Brand rules the reels keep

- IB’s with a lowercase s, typed in capitals rather than transformed, so it survives uppercase headlines.
- Only Source of Truth claims; 10X Trader mechanics carry the risk line.
- Brand curves only; nothing bounces, shakes, glitches or whip-pans. The pace is faster than the brand book’s site timings by request.
