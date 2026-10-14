/**
 * Every visible string, number and link on the page.
 * Edit copy here only. House rules: no em or en dashes in visible text; ranges use a hyphen.
 * Words never used in 10X Trader copy: bonus, free, guaranteed, risk-free, profit promises.
 *
 * Narrative order this file is written for (see App.tsx):
 *   Hero (promise) -> Problem (built against you) -> Model (the aligned model) -> Comparison
 *   -> Calculator (same month, in money) -> Process (live the same day) -> Benefits (what you get)
 *   -> Plans -> Proof (traders + community) -> FAQ -> Closing
 */

export const links = {
  signUp: 'https://app.10xtrader.com/sign-up/standard',
  logIn: 'https://app.10xtrader.com/',
  legals: 'https://www.10xtrader.com/legals',
  whatsapp: '#', // TODO: wa.me link
  discord: '#', // TODO: invite link
}

/** One label per intent. The main action is always "Start Trading 10X". */
export const cta = {
  primary: 'Start Trading 10X',
  short: 'Start 10X',
  logIn: 'Log in',
  whatsapp: 'Chat on WhatsApp',
}

/** Notch nav, in page order. */
export const nav = [
  { id: 'problem', label: 'Why 10X' },
  { id: 'model', label: 'The model' },
  { id: 'compare', label: 'Compare' },
  { id: 'calculator', label: 'Your numbers' },
  { id: 'process', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
]

export const brand = {
  name: '10X Trader',
  word: 'trader',
  tagline: 'The bridge between prop and broker trading',
}

/* ------------------------------------------------------------------------------------------ */
/* Hero: one promise, one proof line, one action. Nothing to decode.                           */
/* ------------------------------------------------------------------------------------------ */

export const hero = {
  eyebrow: '10x buying power. Your own broker account.',
  line1: 'Deposit $1,000.',
  line2: 'Trade with $10,000.',
  sub: '10x buying power in a real broker account that is yours. No evaluation, no rules, withdraw any time. Scale as you perform.',
  secondary: 'See how it works',
  trust: ['No evaluation', 'Nothing extra to pay', 'Live the same day', '4 regulated partner brokers'],
  qualifier: 'Built for traders with a strategy that works and a deposit that was holding it back. Still finding your edge? Start smaller and grow into it.',
  coinsLabel: 'Six 10X glass coins drifting across the screen. Drag one to spin it.',
}

/* ------------------------------------------------------------------------------------------ */
/* Problem: the reader's own story, told back to them. NEW SECTION (wire a component).         */
/* ------------------------------------------------------------------------------------------ */

export const problem = {
  label: '01 · The problem',
  title: 'Stop paying to prove yourself.',
  intro: 'You already know this story. Most traders live it for years before they see the pattern.',
  /** Small line under each step card's title ("Step 1"). */
  stepLabel: 'Step',
  coinLabel: 'The 10X coin. It turns over each time you pick a step.',
  steps: [
    {
      n: '1',
      title: 'First, you pay the fee',
      body: 'An evaluation fee, just for the chance to prove you can trade. Breach one rule and you pay it again. The resets cost more than the trading.',
    },
    {
      n: '2',
      title: 'Then you trade their way',
      body: 'Daily drawdown, time limits, consistency rules, lot caps. Built so one normal losing day ends the account, however good the month was.',
    },
    {
      n: '3',
      title: 'Win, and you wait',
      body: 'A split of your own profit, on their payout cycle. Payouts get delayed, reviewed and denied for breaches no one can explain. Perform too well and you get flagged, limited or blacklisted.',
    },
    {
      n: '4',
      title: 'Then the firm disappears',
      body: 'A prop firm holds your balance until the day it cannot. Firms shut down or freeze payouts every year, some of the biggest names in the space among them. The money their traders earned went with them.',
    },
    {
      n: '5',
      title: 'So you retreat to your own broker',
      body: 'Full freedom, and that is it. It is just an account: nothing scales, nothing rewards your skill, and the only way to grow is depositing more of your own money. A +5% month on $1,000 is $50.',
    },
  ],
  bridge: 'You were never the problem. Nothing was built for you to win.',
  against: {
    label: 'Built against you',
    cards: [
      {
        title: 'The prop model',
        body: 'Evaluation firms earn when traders fail. Every failed challenge is revenue. The model is built for you to lose, not win.',
      },
      {
        title: 'The broker model',
        body: 'Brokers earn on your volume, or on your losses. Half the industry is betting against you. The other half does not care. Neither rewards you for winning.',
      },
    ],
  },
  forYou: {
    label: 'Built for you',
    title: 'The first model built for you to win.',
    body: 'A blown account earns 10X nothing. We only grow when you keep trading and keep growing.',
    link: { label: 'See the aligned model', href: '#model' },
  },
}

/* ------------------------------------------------------------------------------------------ */
/* The model: three paragraphs and three stat cards. This is the "what" and the "why trust".  */
/* ------------------------------------------------------------------------------------------ */

export const model = {
  label: '02 · The solution',
  title: ['The aligned', 'model'],
  paragraphs: [
    'The size of a prop account. The freedom of your own broker. Deposit at one of four partner brokers and 10X adds trading credit at 1:9, live the same day. Every dollar trades like ten, in an account that is yours.',
    'Not plain leverage: the credit puts real buying power behind you and is re-issued at 1:9 as your balance grows. Your results raise your size. Your deposits never have to.',
    'Open book: the broker pays 10X on the volume you trade. That is the whole business. You pay nothing extra, 10X earns nothing from your losses, and a blown account is worth nothing to us. Our best customer is the trader still growing in year three.',
  ],
  link: { label: 'Put it side by side', href: '#compare' },
  stats: [
    { prefix: '', count: 10, suffix: 'x', text: 'buying power from day one. Deposit $1,000 and trade with $10,000.', image: 'images/coin-stat-1.webp' },
    { prefix: '$', count: 0, suffix: '', text: 'extra to pay. The broker pays 10X. No subscription, no split, no fee for the credit.', image: 'images/coin-stat-2.webp' },
    { prefix: '', count: 4, suffix: '', text: 'regulated partner brokers, one login, MetaTrader 5. Your money sits with them, in your name.', image: 'images/coin-stat-3.webp' },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Comparison: the three hardest rows first, the rest can fold.                                */
/* Booleans must stay honest; a prop firm does give size, so that row says so.                 */
/* ------------------------------------------------------------------------------------------ */

export const comparison = {
  label: '03 · Side by side',
  title: 'Put them side by side. Then decide.',
  intro: 'Prop firms sell you size and take the rest. Brokers give you freedom and no size. Only 10X is built to give you both.',
  columns: ['10X Trader', 'Standard broker', 'Prop firm'],
  rows: [
    { label: 'Trade 10x your deposit', values: [true, false, true] },
    { label: 'In a broker account, in your name', values: [true, true, false] },
    { label: 'No evaluation, no fee to start', values: [true, true, false] },
    { label: 'No daily drawdown, time or consistency rules', values: [true, true, false] },
    { label: 'Keep 100% of what you make, no payout cycle', values: [true, true, false] },
    { label: 'Buying power grows with your balance, automatically', values: [true, false, false] },
    { label: 'Nobody at the table profits when you lose', values: [true, false, false] },
    { label: 'Your money is safe if the company disappears', values: [true, true, false] },
  ],
  /** Rows shown before the fold on mobile. */
  foldAfter: 3,
  showAll: 'Show all rows',
}

/* ------------------------------------------------------------------------------------------ */
/* Calculator: the upside in money, not in adjectives.                                         */
/* ------------------------------------------------------------------------------------------ */

export const calculator = {
  label: '04 · Your numbers',
  title: ['Same performance.', 'Different outcome.'],
  intro:
    'A +5% month on a $1,000 broker account is $50. The same month on 10X is $500, re-credited at 1:9, and your buying power follows. Run your own numbers.',
  sentence: {
    deployed: 'If you deposited',
    with: 'with the',
    method: 'method at',
    gain: 'monthly gain since',
    result: 'your account balance would be',
    profit: 'with a profit of',
  },
  methods: [
    { id: '10x', label: '10X' },
    { id: 'traditional', label: 'Own account' },
  ] as const,
  defaults: { deposit: 1000, monthlyPct: 2, month: 0, year: 2025, method: '10x' as const },
  firstYear: 2015,
  chartLabel: 'Account balance over time',
  legend: { tenX: '10X account', traditional: 'Standard broker account' },
  note: 'Illustrative at a constant monthly return and 1:9. Not a forecast. The credit amplifies losses the same way it amplifies gains: losses come out of your deposit, and the credit scales down with your balance. Trading leveraged products carries a high level of risk.',
}

/* ------------------------------------------------------------------------------------------ */
/* Process: three steps, same day. Removes the "this sounds complicated" objection.           */
/* ------------------------------------------------------------------------------------------ */

export const processFlow = {
  label: '05 · How it works',
  title: 'Live the same day',
  intro: 'Three steps between you and 10x the buying power. No challenge to pass, no fee to prove yourself.',
  steps: [
    {
      n: '01',
      title: 'Sign up',
      body: 'Two minutes. Create your 10X login and pick your broker: PU Prime, MarketsVox, STG or Premier Markets.',
      points: ['One login for the 10X Dashboard and your broker', 'Anyone the broker accepts is in', 'Not available to US residents'],
    },
    {
      n: '02',
      title: 'KYC and deposit',
      body: 'At your broker, on their terms, in your name. No minimum deposit from 10X.',
      points: ['Your capital stays in your name', 'Deposit and withdraw through the broker', '10X never holds client funds'],
    },
    {
      n: '03',
      title: 'Trade with 10x',
      body: 'The credit is activated the same day your deposit lands. $1,000 trades as $10,000, on MetaTrader 5.',
      points: ['Forex, indices, metals, commodities and crypto CFDs', 'No rules: trade news, hold overnight, size as you like', 'Profits are yours the moment you close'],
    },
    {
      n: '04',
      title: 'Scale as you perform',
      body: 'Profits are re-credited automatically. Buying power stays 10x your balance, so every good month compounds your size.',
      points: ['No targets, no review, no request to make', 'A verified track record on the open Marketplace', 'Keep performing and there is a path toward being backed'],
    },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Ladder: where it goes. NEW SECTION (wire a component). The argument nobody else can make.  */
/* ------------------------------------------------------------------------------------------ */

export const ladder = {
  label: '06 · Where it goes',
  title: 'The ceiling is not raised. It is removed.',
  intro: 'Three rungs, one direction. Each one is earned by trading, not by paying for another evaluation.',
  rungs: [
    { n: '1', title: 'Trade with 10x', body: 'Your account, your rules. $1,000 trades as $10,000 from the first trade, live the same day.' },
    { n: '2', title: 'Scale as you perform', body: 'Profits are re-credited automatically. Buying power stays 10x your balance, so every good month compounds your size.' },
    { n: '3', title: 'Get backed', body: 'A verified track record on the open Marketplace attracts copiers and PAMM allocators. Keep performing, and there is a path toward institutional allocation.' },
  ],
  note: 'No allocation is promised. Results depend on your trading.',
}

/* ------------------------------------------------------------------------------------------ */
/* Benefits: what you get. Each card answers a pain the reader just recognised above.         */
/* ------------------------------------------------------------------------------------------ */

export type Benefit = { id: string; title: string; sub: string; body: string }

export const benefits = {
  label: '07 · What you get',
  title: 'built for every trader',
  coinLabel: 'The 10X coin. It turns over each time you pick a benefit.',
  left: [
    {
      id: 'capital',
      title: '10x buying power, day one',
      sub: 'Deposit $1,000, trade $10,000',
      body: 'Real buying power on your own deposit, in a broker account in your name. No application, no evaluation, no waiting.',
    },
    {
      id: 'scaling',
      title: 'Scaling that follows your balance',
      sub: 'Re-credited at 1:9, automatically',
      body: 'Grow the balance and the credit is re-issued on the new balance. No firm decides whether you are worth it.',
    },
    {
      id: 'rules',
      title: 'No rules. No split. No cycle.',
      sub: 'Withdraw any time',
      body: 'No daily drawdown, no time limits, no consistency rules, no lot caps. What you make on the full size is yours, through your broker, whenever you want it.',
    },
  ] satisfies Benefit[],
  right: [
    {
      id: 'brokers',
      title: 'Four brokers, one login',
      sub: 'PU Prime · MarketsVox · STG · Premier Markets',
      body: 'Established, regulated partner brokers on MetaTrader 5, with the same 1:9 credit at all four. Your money sits with them, never with 10X.',
    },
    {
      id: 'marketplace',
      title: 'Marketplace, copy trading and PAMM',
      sub: 'Get copied, or copy',
      body: 'List your strategy with a verified track record and attract copiers and allocators. Or copy verified strategies yourself, on the same 10x buying power.',
    },
    {
      id: 'tools',
      title: 'Analytics and AI tools',
      sub: 'Read your edge like an allocator would',
      body: 'A dashboard that tracks your trades, scores your performance and shows you what to fix. Built into your 10X login.',
    },
  ] satisfies Benefit[],
}

/* ------------------------------------------------------------------------------------------ */
/* Plans: account types at the broker. Keep this factual and short; the pitch is done.        */
/* TODO Leroy: confirm the plan names, conditions and which broker offers which.               */
/* ------------------------------------------------------------------------------------------ */

export type Plan = {
  id: string
  name: string
  tagline: string
  features: string[]
  coin: { finish: 'engraved' | 'cutout'; tint: string }
}

export const plans = {
  title: 'Plans',
  intro: 'The same 1:9 credit on every plan. Pick the trading conditions that fit how you trade.',
  list: [
    {
      id: 'standard',
      name: 'Standard',
      tagline: 'For traders who want the simplest way to trade bigger and scale.',
      features: ['Your own broker account', '10x buying power at 1:9', 'No rules, withdraw any time', 'Keep 100% of what you make', 'Standard spreads and commission'],
      coin: { finish: 'engraved', tint: '#4bbdf0' },
    },
    {
      id: 'prime',
      name: 'Prime',
      tagline: 'For active traders who want tighter conditions.',
      features: ['Your own broker account', '10x buying power at 1:9', 'No rules, withdraw any time', 'Keep 100% of what you make', 'Tighter spreads, lower commission'],
      coin: { finish: 'cutout', tint: '#2f9fd6' },
    },
    {
      id: 'prime-x',
      name: 'Prime X',
      tagline: 'For advanced traders who trade size and want institutional-grade conditions.',
      features: ['Your own broker account', '10x buying power at 1:9', 'No rules, withdraw any time', 'Keep 100% of what you make', 'Lowest spread and commission structure'],
      coin: { finish: 'engraved', tint: '#1f6f99' },
    },
  ] satisfies Plan[],
}

/* ------------------------------------------------------------------------------------------ */
/* Proof: traders, numbers, community. NEW SECTION (wire a component). Fill the brackets.      */
/* ------------------------------------------------------------------------------------------ */

export const proof = {
  label: '08 · The people',
  title: 'Join [N]+ traders who scale with 10X',
  intro: 'Real traders, real accounts, in the open. The team is one message away, and your money sits at regulated partner brokers, never with us.',
  stats: [
    { value: '[N]', text: 'traders on 10X' },
    { value: '[$X]', text: 'buying power deployed' },
    { value: '4', text: 'partner brokers live' },
  ],
  verification: 'Results from live 10X accounts, shown with permission.',
  testimonials: [
    { name: '[Trader name]', country: '[Country]', since: '[month]', from: '[$X]', to: '[$Y]', quote: '[One or two sentences: what changed for them since trading on 10X.]' },
    { name: '[Trader name]', country: '[Country]', since: '[month]', from: '[$X]', to: '[$Y]', quote: '[One or two sentences: what changed for them since trading on 10X.]' },
    { name: '[Trader name]', country: '[Country]', since: '[month]', from: '[$X]', to: '[$Y]', quote: '[One or two sentences: what changed for them since trading on 10X.]' },
  ],
  community: [
    { title: 'The 10X Discord', body: 'Direct access to the team, likeminded traders and real education.', href: '#discord' },
    { title: 'A person on WhatsApp', body: 'Ask the team anything. No ticket queue.', href: '#whatsapp' },
    { title: 'Your money, your name', body: 'At established, regulated partner brokers, in your name. Never with 10X.', href: '#faq' },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* FAQ: every objection a sceptical trader raises, in the order they raise them.              */
/* ------------------------------------------------------------------------------------------ */

export const faq = {
  title: ['The questions', 'every trader asks'],
  outro: 'Anything else, ask the 10X team on WhatsApp or in the Discord.',
  items: [
    {
      id: 'better',
      q: 'Is this actually better than trading at my broker?',
      a: 'It is your broker account, with two things added. Ten times the buying power on the same deposit, and a scaling plan that follows your balance. Whatever you make on the full size is yours. Same broker, same MT5, same withdrawals, nothing extra to pay. Leverage amplifies you; the credit scales you.',
    },
    {
      id: 'challenge',
      q: 'Is there an evaluation or a challenge?',
      a: 'No. You open a live account at one of our partner brokers, pass their KYC, deposit, and the credit is activated. Nothing to pass, nothing to pay for first. Anyone the broker accepts is in.',
    },
    {
      id: 'cost',
      q: 'What does 10X cost me?',
      a: 'Nothing extra. You trade on the broker\'s standard conditions. The broker pays 10X a rebate on the volume you trade; that is the whole business. No subscription, no profit split, no fee for the credit.',
    },
    {
      id: 'money',
      q: 'How does 10X make money?',
      a: 'In the open: our partner brokers pay 10X a rebate on the volume our traders trade. 10X earns nothing from your losses and nothing from fees. A blown account is worth nothing to us; a trader who stays active and keeps growing is worth everything. We also work with our partner brokers toward A-booking 10X traders, so no one at the table profits from your loss.',
    },
    {
      id: 'lose',
      q: 'What happens when I lose?',
      a: 'Like any live account, losses come out of your own capital. The credit scales down with your balance so the ratio stays 1:9. You can lose your deposit; you cannot lose more than it.',
    },
    {
      id: 'disappear',
      q: 'What if 10X disappears tomorrow?',
      a: 'Your money is not affected. 10X never holds client funds: your deposit and your profits sit at your regulated broker, in your name, withdrawable like on any other day. The credit would simply stop being re-issued. That is the structural difference with a prop firm, where the balance is theirs and your payout dies with the firm.',
    },
    {
      id: 'scaling',
      q: 'How does scaling work?',
      a: 'Automatically. Profits are re-credited: as your balance grows, the credit is re-issued at 1:9 on the new balance, so your buying power is always ten times what you have. No targets to hit, no review, no request to make.',
    },
    {
      id: 'withdraw',
      q: 'Can I withdraw whenever I want?',
      a: 'Yes. It is your broker account: withdraw through the broker any time, deposit and profits alike. The credit itself is never withdrawn; it adjusts to 1:9 of whatever balance remains.',
    },
    {
      id: 'brokers',
      q: 'Which brokers, which platform, which markets?',
      a: 'PU Prime, MarketsVox, STG or Premier Markets, on MetaTrader 5. Forex, indices, metals, commodities and crypto CFDs, as offered by your broker. The credit applies across all of them.',
    },
    {
      id: 'who',
      q: 'Who can open a 10X account?',
      a: 'Anyone who passes the partner broker\'s KYC, with no minimum deposit from 10X. Not available to US residents.',
    },
    {
      id: 'copy',
      q: 'I would rather copy than trade. Is this for me?',
      a: 'Yes. Copy verified strategies from the 10X Marketplace, or let a PAMM manager trade for you, on the same 10x buying power. And if you run a strategy yourself, list it and attract copiers and allocators.',
    },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Closing and footer                                                                          */
/* ------------------------------------------------------------------------------------------ */

export const closing = {
  title: ['Your $10,000 account', 'is one deposit away.'],
  body: 'Built for the trader who was always good enough. The infrastructure just wasn\'t. A real broker account, 10x buying power, no rules, withdraw any time.',
  bullets: ['No evaluation', 'Nothing extra to pay', '2-minute sign-up'],
  coinLabel: 'The 10X coin, slowly turning.',
}

export const footer = {
  tagline: 'The bridge between prop and broker trading. 10x buying power in a real broker account, no rules, withdraw any time, scaling that follows your results.',
  legalTitle: 'Legal documents',
  legal: [
    { label: 'Risk Disclosure Notice', href: 'https://www.10xtrader.com/legals/risk-disclosure-notice' },
    { label: 'General Risk Disclaimer', href: 'https://www.10xtrader.com/legals/general-risk-disclaimer' },
    { label: 'General Terms & Conditions', href: 'https://www.10xtrader.com/legals/general-terms-and-conditions' },
    { label: 'Privacy Policy', href: 'https://www.10xtrader.com/legals/privacy-policy' },
    { label: 'Cookie Policy', href: 'https://www.10xtrader.com/legals/cookie-policy' },
  ],
  disclaimerTitle: 'Disclaimer',
  disclaimer: [
    '10X Trader (10xtrader.com) operates as an Introducing Broker. It introduces clients to a regulated partner broker, does not hold client funds, does not execute trades, and does not operate live trading accounts. The partner broker acts as principal for all execution, custody, deposits, and withdrawals. 10X Trader receives compensation from its partner broker for introduced clients; full details are disclosed at sign-up.',
    "CFDs and FX are complex leveraged products and carry a high level of risk to your capital. 10X Trader's products use a credit structure that amplifies exposure and the dollar impact of both gains and losses, and is subject to a drawdown limit on the starting deposit that, if reached, results in automatic and immediate account closure. These products may not be suitable for all clients. Please read the full Risk Disclosure Notice and General Risk Disclaimer before opening an account.",
    'This website and any information on it is not intended to offer services to residents of certain jurisdictions, including the United States of America, Belgium, Spain, Iran, Russia, North Korea, Myanmar, or to residents of any other country or jurisdiction where such distribution or use would be contrary to local law or regulation. Additional country restrictions may be applied by the partner broker during onboarding.',
    "Any analysis, opinion, commentary, research-based material, or other content on this website is for information and educational purposes only. It is not, under any circumstances, an offer, recommendation, personal advice, or solicitation for any financial services or product. All trading and investment decisions are the user's own.",
  ],
}
