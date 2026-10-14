# 10X Affiliation: design truth for the reels

Source: `10x-affiliation-brand-kit/` (brand book `index.html`, `tokens/tokens.json`, `motion/motion.json`).

## Brand
- Partner program of 10X Trader. Institutional and calm in tone; on social it is allowed to be sharp. Speak to the partner as "you".
- Always **IB’s** (curly apostrophe, lowercase s), never IBS, also inside uppercase headlines. Headlines are typed in capitals; never `text-transform: uppercase` on a line that contains IB’s.
- Only Source of Truth claims: +40% average rebate increase, 2-3x more rebates per 10X Trader client, offer within 1 hour of the call, no fees (the broker pays us), 1:9 credit and 10x buying power, no minimum deposit, MT5, no daily drawdown limit, no time limit, no profit split, profits withdrawable any time, live the same day, not available in the US.
- Never: bonus, free, guaranteed, risk-free, profit promises. No em or en dashes. Ranges take a hyphen: 2-3x.
- Any frame explaining 10X Trader mechanics carries: "Leveraged trading carries a high level of risk. 10X Trader is not available in the US."
- Call to action: Book my strategy call. Footer: Link in bio.

## Colour
- navy #154359 · navy-2 #3f6274 · navy-3 #557080 · deep #185b7b · teal #066377 · sky #4bbdf0
- frost #f0f5f7 · mist #eef1ee · white #ffffff · line #d7e2e7 · line-strong #b7cbd3
- on navy: ink-2 #c6d7df · ink-3 #8fb0bd · card #1b4b62 · accent sky; on deep: accent #bfeafc
- Grounds: navy radial (110% 70% at 85% 0%, #1f5f7d → #154359 48% → #0e3245), deep linear (160°, #0a7189 → #066377 40% → #0b4a5f), frost, mist.
- Figure gradient (numbers and bars only): linear 100°, #4bbdf0 → #2a8fc0 45% → #185b7b.

## Type
- Inter only (Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700), shipped in `assets/fonts`.
- Headline: Bold 700, capitals, tracking -0.022em to -0.03em. Big numbers: Light 300, tracking -0.055em, figure gradient.
- Labels: Medium 500, capitals, tracking 0.26-0.3em.

## Shape
- Corners are chamfered (top-left and bottom-right cut at 45°), never rounded, except the phone mock and the arch.
- The 45° cut and the X of the 10X mark are the brand's geometry: wipes and splits run on that diagonal.

## Motion (reels run faster than the site, same vocabulary)
- Curves: brand-out cubic-bezier(0.23, 1, 0.32, 1) · reveal cubic-bezier(0.16, 1, 0.3, 1) · in-out cubic-bezier(0.77, 0, 0.175, 1) · soft-out cubic-bezier(0.25, 0.46, 0.45, 0.94). Exits accelerate (power3.in).
- Pace for these reels: entrances 0.35-0.7s, characters 25ms apart, cuts on a 0.5s beat (120 BPM). Key lines hold at least 1s after they land; the end card holds 2.5s or more.
- Nothing bounces, shakes, glitches or whip-pans. No back/elastic eases. Linear only for loops (coin turn, bands).
- The 10X coin is the only 3D form of the mark: it turns, floats and catches light.

## Format
- 1080 × 1920, 30 fps, 15s max. Keep text out of the top 250px and bottom 340px, and out of the right 160px between y 700 and 1500 (Reels buttons). Side margin 80px.
