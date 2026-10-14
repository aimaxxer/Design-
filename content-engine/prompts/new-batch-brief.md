# AI brief: draft a new batch

Paste everything below the line into Claude (or any capable model), together with the contents of `sot.json` and one existing batch file as a style reference (`examples/batch-5-example.json` is a good one). Fill in the three bracketed lines first. Save the answer as `data/batch-N.json`, then run `node check.mjs data/batch-N.json` before rendering.

---

You write social content for **10X Affiliation**, the partner program for forex IB’s and affiliates. Draft a new batch as a JSON file for the 10X content engine.

**This batch:** [e.g. 2 carousels and 3 single posts]
**Pillars to cover:** [e.g. retention, speed, no-fees]
**Anything to feature:** [e.g. a new broker, an event, or leave empty]

## Rules (non-negotiable)

1. Use only the claims in `sot.json > claims`, in their own words or a tighter rewrite. Never invent numbers, testimonials, client names or results.
2. Never use a word or phrase from `sot.json > banned`, in the design or the caption. That includes "free".
3. Write IB’s with a curly apostrophe and a lowercase s. Never IBS or IBs.
4. Any slide or caption that explains how 10X Trader works (credit, leverage, buying power, 1:9) must carry the risk line from `sot.json > risk_line`, in the caption at minimum.
5. Headlines: 10 words or fewer, written as `dark part|muted part`. Body: 30 words or fewer. Bold one phrase with `*asterisks*`.
6. No em or en dashes (use hyphens for ranges: 2-3x). No exclamation marks. No emoji or hashtags inside the design.
7. Carousels have 4-6 slides. Slide 1 is the hook. The last slide uses layout `cta` with `"cta": "Book my strategy call"`.
8. Pick layouts from `sot.json > layouts` and only use the fields listed for each. Pick `img`/`art` keys from `sot.json > art`. Pick tones from `sot.json > tones`.
9. Give every carousel its own tone. Never use the same cover layout on two items in a row.
10. Captions follow `sot.json > caption_formula`: hook line, proof, a question or "Link in bio", the risk line if needed, then 4-5 hashtags from `sot.json > hashtags` ending with #10XAffiliation.

## Do not repeat

These topics are already published. Find new angles:

- Carousels: money on the table, your deal doesn't grow, referrals are assets, 10X Trader explained, walls you hit, what your flow is worth, not just your rate, straight answers, outgrown your deal, stay or switch, the first hour, just starting out, when clients stop trading, best referrals keep growing, stop chasing payouts, myths about switching, five questions before you sign.
- Posts: flow worth more, infrastructure, every lot, one partner, inside a deal, one dashboard, +40%, retention, same deposits, make them pay, no fees, one hour, what's the catch, +40% on a scale.

## Output

Return only valid JSON in this shape, with no commentary:

```json
{
  "batch": "batch-N",
  "title": "Batch N - ...",
  "size": "1080x1350",
  "items": [
    { "id": "ib-NN-short-slug", "type": "carousel", "pillar": "...", "tone": "...", "caption": "...", "slides": [ { "l": "...", "t": "...|..." } ] },
    { "id": "post-NN-short-slug", "type": "post", "pillar": "...", "tag": "...", "caption": "...", "slide": { "l": "...", "t": "..." } }
  ]
}
```

Number new carousels from ib-18 and new posts from post-15 upward.
