# 10X Trader website: source of truth

This document is the single reference for the 10X Trader marketing site (the Vite/React project in `10x-trader/`). When anything here conflicts with existing code, copy or components, **this document wins**. Rebuild the page so that it satisfies every goal in section 2 and passes every check in section 9.

Deliver: the updated `src/content.ts` (final copy is in section 6; a ready file is supplied alongside this document), the reordered `src/App.tsx`, and three new section components (`Problem`, `Ladder`, `Proof`). Do not change the visual system (frost/navy palette, chamfer frames, coin row, GSAP reveals). This is a content and structure rebuild, not a redesign.

---

## 1. What 10X Trader is (product facts)

Use only these facts. Do not invent numbers, rules or features.

- 10X Trader is **a real broker account with 10X trading credit on top**. It is not a funded account and not a prop firm. Positioning: "the bridge between prop and broker trading, the best of both".
- **Credit ratio 1:9 (10x)** for everyone. Deposit $1,000, trade with $10,000. **No minimum deposit** from 10X. Slider range on the site: $100 to $100,000, default $1,000.
- **Four partner brokers**: PU Prime, MarketsVox, STG, Premier Markets. Same 1:9 credit at all four. Platform: **MetaTrader 5**. Markets: forex, indices, metals, commodities, crypto CFDs (as offered by the broker).
- **Scaling**: profits are re-credited automatically; the credit follows the balance up. On losses the credit scales down with the balance so the ratio stays 1:9. **Never mention a credit cap** (no "$2M", no "up to").
- **Cost to the trader: nothing extra.** The broker pays 10X a volume rebate. No subscription, no profit split, no fee for the credit. Profits withdrawable any time through the broker.
- **Account live the same day.** Anyone who passes the broker's KYC is approved. Deposit methods depend on the broker. **Not available to US residents.**
- **No prop-firm rules**: no daily drawdown limit, no time limit, no minimum trading days, no consistency or lot-size rules, no profit split, no payout cycles, no being limited, blacklisted or denied payouts, no firm going bankrupt with your money.
- **Where the money sits**: at the regulated partner broker, in the trader's name. 10X never holds client funds. If 10X disappeared, deposits and profits are unaffected; the credit would simply stop being re-issued.
- **Losses**: like any live account, losses come out of the deposit. You can lose your deposit; you cannot lose more than it. State this only in the FAQ, the calculator note and the footer disclaimer, not as a selling point.
- **The aligned model** (branded term, use it): props profit when you fail (failed evaluations are their revenue); brokers earn on volume or on your losses and do not care if you win; 10X earns on volume only, so a blown account earns 10X nothing. 10X works with partner brokers toward A-booking 10X traders. Phrase that as an honest objective, never a promise.
- **Live today in the dashboard**: Marketplace (copy verified strategies, list your own), PAMM (invest or manage), analytics and AI tools. One login for dashboard, brokers, Marketplace, copy trading and PAMM.
- **Path beyond trading**: verified track record on the Marketplace → copiers and PAMM allocators → a path toward institutional allocation. Allocation is never promised; criteria and partners are to be confirmed. The institutional career path is a mention, not the pitch.
- **Plans** (Standard / Prime / Prime X) are broker account types with different spread/commission conditions. The credit is identical on all. Treat the plan feature lines as TODO-confirm.
- **Legal entity**: WeGroup Ventures FZCO, Dubai, acting as introducing broker. Footer disclaimer text is fixed (section 6.12).

## 2. The 13 goals

The page must achieve all of these, in this priority order.

1. **Convert** traders to sign-up (landing → app.10xtrader.com sign-up, optimised for first deposit).
2. **Easy to understand**: a visitor can explain the product after one scroll.
3. **Understand the upside**: shown in money, not adjectives.
4. **Show the alternative is worse**: prop firms and standard broker accounts, both, factually.
5. **Build trust**: open economics, money at the broker, real traders.
6. **Build authority**: 10X names how the industry works and takes a stance.
7. **Qualify the right trader, repel the wrong one**: traders with a working strategy stay; "10x my $50" tourists are gently filtered.
8. **Neutralise objections before they are asked**: "is this just leverage?", "how do you make money?", "what if you disappear?", "what happens when I lose?".
9. **One clear action, repeated**: one CTA label, one destination, after every beat.
10. **Make the next step feel small**: two minutes, KYC at the broker, live the same day.
11. **Give the reader a sentence to repeat**: "The size of a prop account. The freedom of your own broker."
12. **Serve the second audiences without diluting the first**: copiers, PAMM investors, strategy providers get one tile each, after the trader pitch.
13. **Open the door to what is next**: trade 10x → scale → get backed.

## 3. Audience and tone

- **Primary persona**: experienced retail traders tired of prop-firm evaluation accounts; secondary: traders stuck on a small broker account. English only. Everywhere except the US.
- **Tone**: factual, sharp, confident, calm. Short sentences. No hype, no scarcity, no urgency, no countdowns. Challenge the industry structure; scaling is the story, buying power is the entry.
- **Two-sided criticism**: be equally hard on prop firms (fees, rules, denied payouts, firms folding) and on broker accounts (nothing scales, growth only by depositing more). **Never name a specific prop firm.** Only the four partner brokers are ever named.
- **Words never used**: bonus, free, guaranteed, risk-free, any profit promise. Avoid: "first-loss", "collateral", "re-leverage", "notional exposure", "dynamic deleveraging" (term-sheet language).
- **Typography rule**: no em or en dashes in visible text. Use a hyphen for ranges, a period or colon otherwise.
- **Numbers**: anchor example everywhere is **$1,000 → $10,000**. Worked example: +5% month = $50 on own account vs $500 on 10X. Three-way earn example at "typical industry terms" (80% split, ~$500 evaluation fee), labeled illustrative.
- **Proof**: aggregate figures and testimonials are placeholders in square brackets until supplied. Never ship brackets to production; hide the Proof section if unfilled.
- **Trust anchors allowed**: "regulated partner brokers" wording, the four broker logos, testimonials. No licence numbers, no founder faces, brand only.

## 4. Page structure (section order, component mapping)

Reorder `App.tsx` to exactly this. Each section must answer the question the previous one planted.

| # | Section id | Beat | Question it answers | Component | Status |
|---|---|---|---|---|---|
| 0 | `top` | Hero: the promise | What is this? | `Hero` | rewrite copy, add trust chips under the CTAs |
| 1 | `problem` | The problem: "Stop paying to prove yourself" | Why would I leave what I have? | `Problem` | **new** |
| 2 | `model` | The aligned model | So what is different, and why should I trust it? | `Model` | rewrite copy |
| 3 | `compare` | Side by side | Prove it | `Comparison` | rewrite rows, 3 above the fold on mobile |
| 4 | `calculator` | Your numbers | What is it worth to me? | `Calculator` | rewrite copy, defaults $1,000 |
| 5 | `process` | Live the same day | How hard is it? | `Process` | rewrite copy, 4 steps |
| 6 | `ladder` | Where it goes | Where does this lead? | `Ladder` | **new** |
| 7 | `features` | What you get | What else is in the box? | `Benefits` | rewrite copy |
| 8 | `plans` | Plans | Which account? | `Plans` | rewrite copy, confirm facts |
| 9 | `proof` | The people | Who else is doing this? | `Proof` | **new**, hidden while placeholders remain |
| 10 | `faq` | FAQ | My remaining objections | `Faq` | rewrite, 11 items |
| 11 | footer | Close + legal | What now? | `Footer` | rewrite closing copy |

Nav notch (in order): Why 10X (`#problem`), The model (`#model`), Compare (`#compare`), Your numbers (`#calculator`), How it works (`#process`), FAQ (`#faq`).

**CTA rule (goal 9)**: the only primary button label on the page is **"Start Trading 10X"**, always linking to `links.signUp`. It appears in: hero, after Model, after Comparison, after Calculator, after Ladder, after Proof, closing, and the mobile sticky CTA. Secondary links are text links, never buttons, except "Chat on WhatsApp" in the closing.

## 5. New components (spec)

Build in the existing style: `ChamferFrame`/`chamfer-24` panels, `font-firs` uppercase headlines at the same sizes as `Comparison`, `useReveal(root)` with `data-reveal` on cards, `text-navy` / `text-navy-2` / `text-navy-3` hierarchy, `bg-frost` or white alternating with neighbours.

### 5.1 `Problem` (`src/components/sections/Problem.tsx`, reads `problem` from content)
- Eyebrow label, headline, intro.
- Five numbered steps in a vertical list (number in a small chamfer tile, title bold, body under it). On desktop, two columns: steps left, a sticky panel right that shows the `bridge` line.
- Below: two-column block. Left column labeled "Built against you" with two cards (`against.cards`). Right column labeled "Built for you" with one accent-tinted card (`forYou`) and a text link to `#model`.
- Then a primary CTA button.

### 5.2 `Ladder` (`src/components/sections/Ladder.tsx`, reads `ladder`)
- Eyebrow, headline, intro.
- Three rungs as a horizontal stepper on desktop (connected by a hairline in `rgba(0,104,162,0.25)`), stacked on mobile. Rung number in a chamfer tile, title, body.
- Small `note` text under the rungs in `text-navy-3`.
- Primary CTA button.

### 5.3 `Proof` (`src/components/sections/Proof.tsx`, reads `proof`)
- Eyebrow, headline, intro.
- Three stat tiles (`stats`): big value in `font-firs`, text under it.
- Testimonial grid: three cards, each with name, country, "on 10X since [month]", "[$X] → [$Y] buying power", and the quote. `verification` line above the grid in `text-navy-3`.
- Three community tiles (`community`) with title and body.
- Primary CTA button.
- **Guard**: if any stat value or testimonial field still contains `[`, render nothing (`return null`) and log a console warning in dev. The section must never ship with placeholders.

### 5.4 Existing component changes
- `Hero`: render `hero.trust` as four small chips under the CTAs. The `hero.qualifier` line is not shown (removed from the hero at the owner's request). `line1`/`line2` are the two headline lines.
- `Comparison`: add `comparison.intro` under the title; on screens `< sm`, show only the first `comparison.foldAfter` rows with a "Show all rows" toggle.
- `Model`: render three paragraphs; keep the three stat cards. The second stat has `count: 0` with prefix `$`; make sure the CountUp renders "$0" cleanly.
- `Process`: four steps as in content; keep the layout.
- `Faq`: render `faq.outro` under the accordion with two text links (WhatsApp, Discord).
- `Footer`: render `closing.title`, `closing.body`, `closing.bullets` as chips, primary CTA and the WhatsApp secondary button, then `footer.tagline` above the legal columns.
- Remove the "Compare the plans" link from Model (now "Put it side by side" → `#compare`).

## 6. Final copy

The complete copy lives in `src/content.ts` (supplied). The key lines are repeated here so the intent is unambiguous.

### 6.1 Hero
- Eyebrow: `10x buying power. Your own broker account.`
- Headline: `Deposit $X.` / `Trade with $10X.`, counting up through $500, $1,000, $2,500, $5,000 and $10,000 (the trade amount, 10x, in a blue frame with white text), so no single deposit reads as required. Screen readers get the starting line, `Deposit $500. Trade with $5,000.`
- Sub: `10x buying power in a real broker account that is yours. No evaluation, no rules, withdraw any time. Scale as you perform.`
- Trust chips: `No evaluation` · `Nothing extra to pay` · `Live the same day` · `4 regulated partner brokers`
- Qualifier (goal 7): `Built for traders with a strategy that works and a deposit that was holding it back. Still finding your edge? Start smaller and grow into it.`
- Buttons: `Start Trading 10X` (primary), `See how it works` (text link to `#process`)

### 6.2 Problem
- Title: `Stop paying to prove yourself.`
- Intro: `You already know this story. Most traders live it for years before they see the pattern.`
- Steps: (1) First, you pay the fee · (2) Then you trade their way · (3) Win, and you wait · (4) Then the firm disappears · (5) So you retreat to your own broker. Full bodies in content.ts.
- Bridge: `You were never the problem. Nothing was built for you to win.`
- Built against you: `The prop model` / `The broker model` cards.
- Built for you: `The first model built for you to win.` + `A blown account earns 10X nothing. We only grow when you keep trading and keep growing.`

### 6.3 Model
- Title: `The aligned model`
- P1: `The size of a prop account. The freedom of your own broker. Deposit at one of four partner brokers and 10X adds trading credit at 1:9, live the same day. Every dollar trades like ten, in an account that is yours.`
- P2: `Not plain leverage: the credit puts real buying power behind you and is re-issued at 1:9 as your balance grows. Your results raise your size. Your deposits never have to.`
- P3: `Open book: the broker pays 10X on the volume you trade. That is the whole business. You pay nothing extra, 10X earns nothing from your losses, and a blown account is worth nothing to us. Our best customer is the trader still growing in year three.`
- Stats: `10x` buying power from day one · `$0` extra to pay · `4` regulated partner brokers.

### 6.4 Comparison
Columns: 10X Trader · Standard broker · Prop firm. Rows (yes/no), hardest three first:

| Row | 10X | Broker | Prop |
|---|---|---|---|
| Trade 10x your deposit | yes | no | yes |
| In a broker account, in your name | yes | yes | no |
| No evaluation, no fee to start | yes | yes | no |
| No daily drawdown, time or consistency rules | yes | yes | no |
| Keep 100% of what you make, no payout cycle | yes | yes | no |
| Buying power grows with your balance, automatically | yes | no | no |
| Nobody at the table profits when you lose | yes | no | no |
| Your money is safe if the company disappears | yes | yes | no |

Intro: `Prop firms sell you size and take the rest. Brokers give you freedom and no size. Only 10X is built to give you both.`

### 6.5 Calculator
- Title: `Same performance.` / `Different outcome.`
- Intro: `A +5% month on a $1,000 broker account is $50. The same month on 10X is $500, re-credited at 1:9, and your buying power follows. Run your own numbers.`
- Methods: `10X` vs `Own account`. Defaults: deposit $1,000, 2% monthly.
- Note (keep verbatim): `Illustrative at a constant monthly return and 1:9. Not a forecast. The credit amplifies losses the same way it amplifies gains: losses come out of your deposit, and the credit scales down with your balance. Trading leveraged products carries a high level of risk.`

### 6.6 Process
Title `Live the same day`. Intro `Three steps between you and 10x the buying power. No challenge to pass, no fee to prove yourself.` Steps: 01 Sign up · 02 KYC and deposit · 03 Trade with 10x · 04 Scale as you perform.

### 6.7 Ladder
Title `The ceiling is not raised. It is removed.` Rungs: 1 Trade with 10x · 2 Scale as you perform · 3 Get backed. Note: `No allocation is promised. Results depend on your trading.`

### 6.8 Benefits
Six cards: 10x buying power, day one · Scaling that follows your balance · No rules. No split. No cycle. · Four brokers, one login · Marketplace, copy trading and PAMM · Analytics and AI tools.

### 6.9 Plans
Intro: `The same 1:9 credit on every plan. Pick the trading conditions that fit how you trade.` Three plans, identical first four lines, fifth line is the condition difference. **Confirm names and conditions with Leroy before shipping.**

### 6.10 Proof
Title `Join [N]+ traders who scale with 10X`. Stats, three testimonials, three community tiles (Discord, WhatsApp, "Your money, your name"). Hidden until placeholders are filled.

### 6.11 FAQ (order is deliberate)
1. Is this actually better than trading at my broker?
2. Is there an evaluation or a challenge?
3. What does 10X cost me?
4. How does 10X make money?
5. What happens when I lose?
6. What if 10X disappears tomorrow?
7. How does scaling work?
8. Can I withdraw whenever I want?
9. Which brokers, which platform, which markets?
10. Who can open a 10X account?
11. I would rather copy than trade. Is this for me?

Outro: `Anything else, ask the 10X team on WhatsApp or in the Discord.`

### 6.12 Closing and footer
- Closing: `Your $10,000 account` / `is one deposit away.` Body: `Built for the trader who was always good enough. The infrastructure just wasn't. A real broker account, 10x buying power, no rules, withdraw any time.` Chips: No evaluation · Nothing extra to pay · 2-minute sign-up.
- Footer tagline: `The bridge between prop and broker trading. 10x buying power in a real broker account, no rules, withdraw any time, scaling that follows your results.`
- Legal links and the four disclaimer paragraphs: unchanged from the current `content.ts` (they are the legal-reviewed text).

## 7. Things to remove from the current site

- Hero "Enter the markets 10X smarter" and the "This is 10X Trader" eyebrow.
- CTA label "Open an account" everywhere (replace with "Start Trading 10X").
- "$500 → $5,000" examples (replace with $1,000 → $10,000).
- "Hit 2% profit and scale up" (scaling is automatic and continuous).
- "Maximum 10% drawdown" as a benefit, "up to $2M exposure", "25:1 leverage", "first-loss", "re-leverage", "notional", "dynamic deleveraging".
- The "Traditional" method label in the calculator (now "Own account").
- Comparison rows that hand prop firms a tick for "Scale without adding capital".

## 8. Open decisions (ask Leroy, do not guess)

1. Plans: confirm Standard / Prime / Prime X names, conditions, and which broker offers which. Cut the section if unconfirmed.
2. If the broker applies an automatic close at a drawdown on the starting deposit, add one FAQ line under "What happens when I lose?" and keep it out of every selling section.
3. WhatsApp and Discord links.
4. Proof figures: [N] traders, [$X] buying power deployed, three named testimonials with permission.

## 9. Acceptance checklist (every item must pass)

Goal → check:

1. Convert: every section ends in or is followed by "Start Trading 10X"; mobile sticky CTA uses the same label and link.
2. Easy to understand: the hero contains a deposit → buying power example in dollars; no term-sheet words (section 3) appear anywhere in visible text.
3. Upside: the page shows "$50 vs $500" (or the slider equivalent) before the Process section.
4. Alternative is worse: Problem section has both the prop story and the broker dead-end; Comparison has three columns and eight rows; no prop firm is named.
5. Trust: Model P3 states how 10X earns; FAQ contains "How does 10X make money?" and "What if 10X disappears tomorrow?"; "in your name" appears in Process, Comparison and Proof.
6. Authority: "The aligned model" is used as a title; "Built against you / Built for you" block exists.
7. Qualify: no longer checked in the hero (the qualifier line was removed at the owner's request).
8. Objections: all 11 FAQ items present in the given order; the first is "Is this actually better than trading at my broker?".
9. One action: `grep` finds exactly one primary button label string, "Start Trading 10X"; "Open an account" returns zero hits.
10. Small next step: Process has "Two minutes" and "live the same day"; closing has "2-minute sign-up".
11. Repeatable sentence: "The size of a prop account. The freedom of your own broker." appears verbatim in Model P1.
12. Second audiences: Benefits contains the Marketplace/copy/PAMM card and FAQ 11; no copier/investor copy appears above the Model section.
13. What is next: Ladder section renders with three rungs and the no-allocation note.

Global: no em/en dashes in visible text; no occurrence of bonus/free/guaranteed/risk-free; no "$2M", "10% drawdown" or "2%" scaling claims; Proof section hidden while any `[` placeholder remains; all anchors in nav resolve; `npm run build` passes with no TypeScript errors.
