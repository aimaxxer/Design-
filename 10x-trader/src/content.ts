/**
 * Every visible string, number and link on the page, taken from www.10xtrader.com (October 2026).
 * Edit copy here only. House rules: no em or en dashes in visible text; ranges use a hyphen.
 */

export const links = {
  signUp: 'https://app.10xtrader.com/sign-up/standard',
  logIn: 'https://app.10xtrader.com/',
  legals: 'https://www.10xtrader.com/legals',
}

/** One label per intent: opening an account is always "Open an account". */
export const cta = {
  primary: 'Open an account',
  short: 'Open account',
  logIn: 'Log in',
}

/** Notch nav, in page order. Ids match the live site's anchors (#features, #process, #calculator, #plans). */
export const nav = [
  { id: 'features', label: 'Benefits' },
  { id: 'process', label: 'Process' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'plans', label: 'Plans' },
  { id: 'faq', label: 'FAQ' },
]

export const brand = {
  name: '10X Trader',
  word: 'trader',
  tagline: 'scale your capital',
}

export const hero = {
  eyebrow: 'This is 10X Trader',
  line1: 'Enter the markets',
  line2: '10X smarter',
  sub: '10X buying power from day one. Scale up with every 2% profit.',
  secondary: 'See how it works',
  coinsLabel: 'Six 10X glass coins drifting across the screen. Drag one to spin it.',
}

/* ------------------------------------------------------------------------------------------ */
/* Benefits: the template's nominations layout, with the coin in place of the centre video.    */
/* ------------------------------------------------------------------------------------------ */

export type Benefit = { id: string; title: string; sub: string; body: string }

export const benefits = {
  label: '[the 10x model]',
  title: 'benefits',
  coinLabel: 'The 10X coin. It turns over each time you pick a benefit.',
  left: [
    {
      id: 'capital',
      title: 'Trade bigger with 10X',
      sub: 'Deposit $500, trade $5,000',
      body: 'Deposit $500 and start trading with $5,000 in buying power instantly. No application, no evaluation, no waiting.',
    },
    {
      id: 'scaling',
      title: 'Hit 2%. Scale instantly.',
      sub: '10X more buying power',
      body: 'Hit 2% profit and scale up 10X instantly. At 10X Trader, every move forward comes with 10X more buying power behind it.',
    },
    {
      id: 'copy',
      title: 'Proven strategies',
      sub: 'Ready to copy',
      body: 'Follow proven managers. Scale alongside their results.',
    },
  ] satisfies Benefit[],
  right: [
    {
      id: 'journal',
      title: 'AI powered trading journal',
      sub: 'Track trades, improve faster',
      body: 'AI tools to sharpen your performance, track your trades, and help you improve faster.',
    },
    {
      id: 'ownership',
      title: 'Full control and ownership',
      sub: '24/7 access, withdraw any time',
      body: 'Keep full ownership of your account with 24/7 access, the flexibility to withdraw at any time, and a partner committed to your growth.',
    },
    {
      id: 'risk',
      title: 'Maximum 10% drawdown',
      sub: 'Your risk has a clear limit',
      body: 'Your account operates with a fixed maximum drawdown of 10%. This defines your total risk at any given time and keeps losses within a clear limit.',
    },
  ] satisfies Benefit[],
}

/* ------------------------------------------------------------------------------------------ */
/* The model: the template's "about" layout with three stat cards.                              */
/* ------------------------------------------------------------------------------------------ */

export const model = {
  title: ['The 10X', 'model'],
  paragraphs: [
    '10X allows you to trade more capital than you deposit. You commit capital as first-loss, and it is expanded into a larger trading account, so you can operate at scale while keeping full control, without raising external capital.',
    'Each time you achieve a 2% profit, you can re-leverage that gain to increase your total exposure. This allows future returns to be generated on a larger base. The scaling process continues up to $2M in exposure, while organic growth can extend well beyond.',
  ],
  link: { label: 'Compare the plans', href: '#plans' },
  stats: [
    { prefix: '', count: 10, suffix: 'X', text: 'buying power from day one. Deposit $500 and trade with $5,000.', image: 'images/coin-stat-1.webp' },
    { prefix: '', count: 2, suffix: '%', text: 'profit is all it takes to scale up again.', image: 'images/coin-stat-2.webp' },
    { prefix: '$', count: 2, suffix: 'M', text: 'in notional exposure as your account scales.', image: 'images/coin-stat-3.webp' },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Process flow                                                                                 */
/* ------------------------------------------------------------------------------------------ */

export const processFlow = {
  title: 'Process flow',
  intro: 'A seamless onboarding journey designed to get you trading and positioned to scale from day one.',
  steps: [
    {
      n: '01',
      title: 'Access through our trusted broker',
      body: 'You start with your own capital, fully in your control. No pooling, no outside investors.',
      points: ['Your capital stays in your name', 'You are the only one taking the risk', 'No shared accounts or third parties', 'Maximum 10% drawdown limit'],
    },
    {
      n: '02',
      title: 'Unlock more buying power',
      body: 'From day one, your capital is boosted, so you can trade bigger without needing more money.',
      points: ['Trade up to 10 times your capital', 'Access larger positions instantly', 'No need to raise external funds'],
    },
    {
      n: '03',
      title: 'Trade like a pro',
      body: 'Your trades are executed in real market conditions, just like professional traders.',
      points: ['Full account size in every trade', 'Direct market execution, no tricks behind the scenes', 'No conflict: what you see is what you get'],
    },
    {
      n: '04',
      title: 'Grow as you perform',
      body: 'Do well, and your account grows with you. Hit a rough patch, and risk automatically scales down.',
      points: ['Increase size as you profit', 'Compound without adding more capital', 'Built-in protection when performance drops'],
    },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Calculator (the live site's formula; see lib/projection.ts)                                  */
/* ------------------------------------------------------------------------------------------ */

export const calculator = {
  title: ['Same performance.', 'Different outcome.'],
  intro:
    'The same performance can lead to completely different outcomes, depending on the capital behind it and how that capital is scaled into the market.',
  sentence: {
    deployed: 'If you deployed',
    with: 'with the',
    method: 'method at',
    gain: 'monthly gain since',
    result: 'your account balance would have been',
    profit: 'with a profit of',
  },
  methods: [
    { id: '10x', label: '10X' },
    { id: 'traditional', label: 'Traditional' },
  ] as const,
  defaults: { deposit: 5000, monthlyPct: 2, month: 0, year: 2025, method: '10x' as const },
  firstYear: 2015,
  chartLabel: 'Account balance over time',
  legend: { tenX: '10X account', traditional: 'Traditional account' },
  note: 'Hypothetical illustration at a constant monthly return. It is not a forecast. The 10X structure amplifies losses the same way it amplifies gains, and reaching the drawdown limit on the starting deposit closes the account.',
}

/* ------------------------------------------------------------------------------------------ */
/* Plans                                                                                        */
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
  intro: 'Access the 10X model your way: trade independently or follow proven execution.',
  list: [
    {
      id: 'standard',
      name: 'Standard',
      tagline: 'For traders who want a simple way to trade bigger and scale faster.',
      features: ['Trade your own account', 'Up to $2M notional exposure', '25:1 leverage', 'Max 10% drawdown', 'Keep 100% of profits'],
      coin: { finish: 'engraved', tint: '#4bbdf0' },
    },
    {
      id: 'prime',
      name: 'Prime',
      tagline: 'For active traders who want tighter conditions and improved execution.',
      features: ['Trade your own account', 'Up to $2M notional exposure', '25:1 leverage', 'Max 10% drawdown', 'Lower-cost trading conditions'],
      coin: { finish: 'cutout', tint: '#2f9fd6' },
    },
    {
      id: 'prime-x',
      name: 'Prime X',
      tagline: 'Scale your trading to an institutional level.',
      features: ['Designed for advanced traders', 'Lower spread and commission structure', 'Up to $2M notional exposure', '25:1 leverage', 'Max 10% drawdown'],
      coin: { finish: 'engraved', tint: '#1f6f99' },
    },
  ] satisfies Plan[],
}

/* ------------------------------------------------------------------------------------------ */
/* Comparison                                                                                   */
/* ------------------------------------------------------------------------------------------ */

export const comparison = {
  title: 'How 10X compares',
  columns: ['10X Trader', 'Traditional brokers', 'Prop firms'],
  rows: [
    { label: 'Keep 100% of your performance', values: [true, true, false] },
    { label: 'Maximum 10% capital at risk', values: [true, false, false] },
    { label: 'Scale without adding capital', values: [true, true, true] },
    { label: 'Leverage up to $2M trading capacity', values: [true, false, false] },
    { label: 'Trade from your own account', values: [true, true, false] },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* FAQ                                                                                          */
/* ------------------------------------------------------------------------------------------ */

export const faq = {
  title: ['Frequently asked', 'questions'],
  items: [
    {
      id: 'scaling',
      q: 'How does the 10X scaling model work?',
      a: 'Your capital is used as first-loss collateral and expanded into a larger trading account. Each time you generate a 2% profit, you can re-leverage that gain to increase your exposure, allowing you to trade on a progressively larger base.',
    },
    {
      id: 'risk',
      q: 'What is the maximum risk on my capital?',
      a: 'Your account operates with a fixed maximum drawdown of 10%. This defines your total risk at any given time and ensures losses are contained within a clear limit.',
    },
    {
      id: 'ownership',
      q: 'Do I keep full ownership of my capital and profits?',
      a: 'Yes. Your capital always remains in your own account, and with the Standard plan you keep 100% of your performance. There is no pooling of funds or external allocation.',
    },
    {
      id: 'scale',
      q: 'How far can my account scale?',
      a: 'You can scale your trading exposure up to $2M through the 10X structure. Beyond that, your account can continue to grow organically through performance.',
    },
    {
      id: 'decline',
      q: 'What happens if my performance declines?',
      a: 'If performance drops, your exposure is automatically reduced. This dynamic deleveraging helps protect your capital and keeps your risk aligned with performance.',
    },
  ],
}

/* ------------------------------------------------------------------------------------------ */
/* Closing and footer                                                                           */
/* ------------------------------------------------------------------------------------------ */

export const closing = {
  title: ['Built for the future.', 'Available today.'],
  coinLabel: 'The 10X coin, slowly turning.',
}

export const footer = {
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
