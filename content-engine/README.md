# 10X content engine

Write copy in a JSON file, check it against the brand rules, and render finished 1080 × 1350 posts and carousels in the website style. Every batch so far (Batches 1-4) is stored here as data and re-renders pixel for pixel.

```
content-engine/
├─ sot.json            Source of truth: claims, banned words, CTAs, hooks, pillars, formats, layouts, art keys
├─ check.mjs           Copy checker: runs every rule in sot.json against a batch file
├─ render.mjs          Renderer: batch file → JPGs + caption.txt + manifest.json
├─ data/               batch-1.json … batch-4.json, the published batches with their captions
├─ examples/           batch-5-example.json and its renders, a template for new batches
├─ prompts/            new-batch-brief.md, the prompt that drafts a new batch with AI
├─ automation/         github-actions.yml, an optional workflow that renders on every push
└─ engine/             slide.html + kitlayouts.js (posts and carousels), kit.html (Batch 4 pieces), art/
```

## Set up once

Needs Node 18 or later.

```bash
cd content-engine
npm install
npx playwright install chromium
```

## Make a new batch

1. Copy `examples/batch-5-example.json` to `data/batch-5.json`, or draft it with AI using `prompts/new-batch-brief.md`.
2. Check it: `node check.mjs data/batch-5.json`. Errors must be fixed; warnings are worth a look.
3. Render it: `node render.mjs data/batch-5.json`. Add `--strict` to refuse to render a batch with errors, `--only ib-18` to render one item, `--out <dir>` to choose the folder (default `out/`).

Output, ready to post or hand to a scheduler:

```
out/batch-5/
├─ manifest.json                   every item with its files, pillar and caption
├─ ib-18-some-topic/
│  ├─ ib-18-some-topic-01.jpg … -05.jpg
│  └─ caption.txt
└─ post-15-some-topic/
   ├─ post-15-some-topic-01.jpg
   └─ caption.txt
```

Re-render the published batches with `node render.mjs data/batch-1.json data/batch-2.json data/batch-3.json data/batch-4.json`.

## Batch file format

```json
{
  "batch": "batch-5",
  "title": "Batch 5 - Carousels and posts",
  "size": "1080x1350",
  "items": [
    {
      "id": "ib-18-some-topic",
      "type": "carousel",
      "pillar": "retention",
      "tone": "sky",
      "caption": "Hook line.\n\nProof.\n\nLink in bio.\n\n#forexaffiliate #introducingbroker #IBrebates #10XAffiliation",
      "slides": [
        { "l": "manifesto", "tone": "navy", "pill": "For IB’s & affiliates", "t": "Dark part|muted part.", "body": "Short body with one *bold* phrase." },
        { "eyebrow": "Why it matters", "t": "One idea|per slide.", "blocks": [{ "k": "stats", "rows": [["+40%", "more per lot on average"], ["1 hour", "to your offer"]] }] },
        { "l": "cta", "t": "Book your|strategy call.", "cta": "Book my strategy call", "checks": ["2-minute application", "No fees"] }
      ]
    },
    { "id": "post-15-some-topic", "type": "post", "pillar": "no-fees", "tag": "Straight answers", "caption": "…", "slide": { "l": "chat", "q": "Question?", "a": "*Answer.* More answer." } }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `type` | `carousel` (has `slides`), `post` (has one `slide`) or `kit` (a Batch 4 piece from `engine/kit.html`, picked by `piece`) |
| `tone` | Ground for the whole carousel: `frost`, `white`, `sky`, `navy`, `deep` or `glass`. A slide can override it. |
| `l` | Layout family. Leave it out for the default content slide. The full list, with what each one is for and which fields it reads, is under `layouts` in `sot.json`. |
| `t` | Headline. The part after `\|` is set in the muted colour. |
| `body` | Body copy. `*text*` is bold. |
| `blocks` | Data blocks for content and index slides: `levers`, `stats`, `checks`, `numbered`, `compare`, `funnel`, `calc`, `dashboard`, `rebate`, `trader`, `buying`, `without`. |
| `img` / `art` | Art keys from `sot.json > art`. `glass` and `hero` rotate through the sets for you. |
| `caption` | The caption written to `caption.txt` and `manifest.json`. |

The renderer fixes IB’s automatically (IBs and IB's become IB’s, and the s stays lowercase in uppercase headlines). Captions are not changed, so the checker flags them instead.

## What the checker enforces

From `sot.json`, so change the rules there:

- **Errors:** banned words in the design or the caption, IBS anywhere, IBs or IB's in a caption, 10X Trader mechanics (credit, leverage, buying power, 1:9) without the risk line, emoji or hashtags inside the design, unknown layouts, tones, blocks or art keys, and a missing caption on a feed item.
- **Warnings:** headlines over 10 words, body over 30 words, en or em dashes, exclamation marks, carousels outside 4-6 slides or not ending on a `cta` slide, captions not ending in #10XAffiliation or with more than 6 hashtags, and a 10X Trader mention without the risk line.

The published batches still contain "free" in 12 places (mostly "free strategy call"), which the brand book bans, so `node check.mjs data/*.json` reports those until a decision is made. See Open questions in the Source of Truth document.

## Automate

- **Draft:** use `prompts/new-batch-brief.md` with `sot.json` to have AI draft `data/batch-N.json`. The checker is the gate: nothing renders with `--strict` until it passes.
- **Render on push:** copy `automation/github-actions.yml` to `.github/workflows/` and every change to `content-engine/data/` renders in GitHub Actions, with the JPGs, captions and manifests attached to the run.
- **Schedule:** `manifest.json` lists every item with its image paths and caption, which is enough to drive Buffer, Later, Make or Zapier.

## Stories, reels and other sizes

- Stories (1080 × 1920) are in Batch 4 (`kit.html`, pieces `st-cta`, `st-poll` and `st-stat`). Copy one in `engine/kit.html` to make a new story.
- Reels are in `../videos/` (HyperFrames). The brand kit with logo, coin, fonts and motion presets is in `../10x-affiliation-brand-kit/`.
