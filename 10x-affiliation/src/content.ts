/**
 * Every visible string on the page lives here, taken from the 10X Affiliation funnel canvas.
 *
 * Values wrapped in ph() are PLACEHOLDERS: they render with an amber dashed outline on the dev
 * server so they can't slip into a launch unnoticed. Replace them (and the empty links below)
 * before going live.
 */

export type Value = string | { value: string; placeholder: true }
const ph = (value: string): Value => ({ value, placeholder: true })

/* -------------------------------------------------------------------------- */
/* Links and integrations                                                      */
/* -------------------------------------------------------------------------- */

export const links = {
  /** Full wa.me link, e.g. https://wa.me/9715XXXXXXXX. Empty = the WhatsApp buttons scroll to the form. */
  whatsapp: '',
  /** Partner channel invite link, e.g. https://t.me/+XXXX. Empty = the link is hidden. */
  telegram: '',
  /** Calendly event URL for the 30-minute partner strategy call (or set VITE_CALENDLY_URL). */
  calendly: (import.meta.env.VITE_CALENDLY_URL as string | undefined) ?? '',
  /** Where qualifier answers are POSTed as JSON (or set VITE_QUALIFIER_ENDPOINT). Empty = simulated. */
  qualifierEndpoint: (import.meta.env.VITE_QUALIFIER_ENDPOINT as string | undefined) ?? '',
  terms: '#',
  privacy: '#',
  risk: '#',
}

/** One label per intent, used everywhere on the page. */
export const cta = {
  primary: 'Book my strategy call',
  short: 'Book call',
  whatsapp: 'Chat on WhatsApp',
}

export const nav = [
  { id: 'problems', label: 'Problems' },
  { id: 'results', label: 'Results' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'trader', label: '10X Trader' },
  { id: 'apply', label: 'Apply' },
]

/* -------------------------------------------------------------------------- */
/* 01 Hero                                                                     */
/* -------------------------------------------------------------------------- */

export const hero = {
  eyebrow: 'For IBs & affiliates',
  line1: 'Scale 10X',
  line2: 'smarter',
  sub: 'The infrastructure to scale your affiliate business. Starting with a better deal.',
  secondary: 'See what we solve',
}

/* -------------------------------------------------------------------------- */
/* 02 Problems we solve                                                        */
/* -------------------------------------------------------------------------- */

export type Problem = {
  id: string
  title: string
  subtitle: string
  fixTitle: string
  fixText: string
}

export const problemsIntro = {
  label: '[sound familiar?]',
  title: 'Hit a wall?',
  hint: 'Pick the wall you hit. This is what changes with 10X Affiliation.',
}

export const problems: Problem[] = [
  {
    id: 'rebate',
    title: 'Low rebate or CPA deals',
    subtitle: "Your volume grows. Your deal doesn't.",
    fixTitle: 'On average 40% more per lot',
    fixText: 'A deal sized to your volume, on the table within 1 hour of your call.',
  },
  {
    id: 'infrastructure',
    title: 'No infrastructure',
    subtitle: 'No tracking, no tools, chasing payouts',
    fixTitle: 'Full partner infrastructure',
    fixText: 'Dashboard, tracking and CRM. Every client, every lot and every payout, visible.',
  },
  {
    id: 'product',
    title: "A product that doesn't convert",
    subtitle: '"Open an account" is not a reason',
    fixTitle: 'Products your audience actually wants',
    fixText: 'Copy trading, PAMM and 10X Trader: offers that sell better than "open an account with my broker".',
  },
  {
    id: 'blowups',
    title: 'Referrals blow their accounts',
    subtitle: 'Small deposits, short lives',
    fixTitle: 'Traders who stay active longer',
    fixText: 'Copy trading, PAMM and 10X Trader give referrals the structure to keep trading. When they stay, your income stays.',
  },
  {
    id: 'support',
    title: 'Slow support, no help to scale',
    subtitle: 'A ticket queue instead of a partner',
    fixTitle: 'A dedicated partner manager',
    fixText: 'One person who knows your business, backed by marketing, funnels and a UGC network.',
  },
  {
    id: 'broker',
    title: 'Clients unhappy with your broker',
    subtitle: 'Their complaints become your churn',
    fixTitle: 'Stay or switch, your call',
    fixText: 'Keep your broker and add 10X, or move to one of our partner brokers. We decide it together.',
  },
]

/* -------------------------------------------------------------------------- */
/* 03 Results: stats, partner kit, proof                                       */
/* -------------------------------------------------------------------------- */

export const results = {
  titleLine1: "You're leaving money on the table.",
  titleLine2: 'Every single trade.',
  paragraphs: [
    'Most IBs only negotiate their rate. What you actually earn depends on three things: your rate, how many leads convert and how long they keep trading.',
    'We raise all three. Then 10X Trader multiplies them.',
  ],
  link: { label: 'See how 10X Trader works', href: '#trader' },
  stats: [
    {
      count: 40,
      prefix: '+',
      suffix: '%',
      text: 'Average rebate increase, negotiated on the combined volume of all our partners.',
      image: '/images/sculpture-1.webp',
    },
    {
      display: '2-3x',
      text: 'More rebates per 10X Trader client, from the same deposits.',
      image: '/images/sculpture-2.webp',
    },
    {
      count: 1,
      suffix: ' hour',
      text: 'From your strategy call to your new offer.',
      image: '/images/glass-3.webp',
    },
  ],
}

export type KitBlock = {
  id: 'earn' | 'attract' | 'convert' | 'retain'
  title: string
  text: string
  items: Array<[string, string]>
}

export const partnerKit = {
  title: 'We raise everything that pays you',
  intro: 'Not just your rate. Starting with the clients you already have.',
  blocks: [
    {
      id: 'earn',
      title: 'Earn more per existing client',
      text: 'More from the book you already have.',
      items: [
        ['Better rebate deals', 'On average 40% more per lot.'],
        ['10X Trader', '2-3x more rebates on the same deposits.'],
        ['Partner dashboard & CRM', 'See what every client earns you.'],
      ],
    },
    {
      id: 'attract',
      title: 'Attract more leads',
      text: 'A steady flow of new leads.',
      items: [
        ['Free value for your community', 'Signals, education and tools to give your followers.'],
        ['Marketing & UGC network', 'Creators and content that grow your reach.'],
        ['Done-for-you ads', 'Campaigns built for your market and language.'],
      ],
    },
    {
      id: 'convert',
      title: 'Convert more leads',
      text: 'Offers people actually sign up for.',
      items: [
        ['10X Trader', '10x buying power from day one. The easiest yes.'],
        ['Done-for-you funnels', 'Pages and follow-ups that turn followers into clients.'],
        ['Education & live sessions', 'Builds the trust to deposit.'],
      ],
    },
    {
      id: 'retain',
      title: 'Keep traders longer',
      text: 'Your referrals are your assets.',
      items: [
        ['Copy trading & PAMM', "Clients stay active, even when they don't trade themselves."],
        ['Signal rooms', 'Keep your community active, and trading.'],
        ['10X Trader scaling', 'Traders who perform get more capital, not a blown account.'],
      ],
    },
  ] satisfies KitBlock[],
  /** Illustrative example from the canvas: an $18k/month book, run through the calculator maths below. */
  earnings: [
    { label: 'Old deal', amount: '$18,000' },
    { label: 'New deal', amount: '+$7,200' },
    { label: '10X Trader', amount: '+$6,300' },
  ],
  earningsTotalLabel: 'Monthly earnings',
  earningsTotal: '$31,500',
  earningsCaption: 'Example: monthly earnings on existing flow',
  ugcImage: '/images/partner-ib.webp',
  ugcAlt: 'A partner recording a UGC video at his home trading desk',
  ugcCaption: 'UGC ads made for your brand and language',
  funnel: [
    { label: 'Visitors', width: 1 },
    { label: 'Sign-ups', width: 0.62 },
    { label: 'Deposited', width: 0.38 },
  ],
  funnelResult: '+$380k',
  funnelResultLabel: 'in deposits',
  funnelCaption: 'Example: a done-for-you funnel',
  traderImage: '/images/active-trader.webp',
  traderAlt: 'A referred trader holding a tablet with a rising equity curve',
  traderStats: [
    { label: 'Deposit', value: '$2,500' },
    { label: 'Earned from client', value: '$800' },
  ],
  traderCaption: 'Example: referred 5 months ago, still trading',
  footnote: 'All included for approved partners. No fees: the broker pays us.',
}

export const proof = {
  title: 'Proof, not promises',
  sub: "These partners are 10X'ing their business. Right now.",
  /** Add `video: '/videos/<file>.mp4'` to a card and it plays inline with controls. */
  videos: [
    {
      video: '',
      image: '/images/partner-creator.webp',
      alt: 'Partner video still: a young creator at his trading desk',
      name: ph('[IB name]'),
      meta: ph('[Region]'),
      quote: ph('[Testimonial video: one-line quote]'),
      duration: '0:42',
      result: { value: ph('[$X] → [$Y] per lot'), label: 'After moving their book' },
    },
    {
      video: '',
      image: '/images/partner-community.webp',
      alt: 'Partner video still: a creator recording in her living room',
      name: ph('[Signal room name]'),
      meta: ph('[Members]'),
      quote: ph('[Testimonial video: one-line quote]'),
      duration: '0:57',
      result: { value: ph('[+X%] monthly rebates'), label: 'After adding 10X Trader' },
    },
    {
      video: '',
      image: '/images/partner-ib.webp',
      alt: 'Partner video still: an experienced IB in his home office',
      name: ph('[Affiliate name]'),
      meta: ph('[Platform]'),
      quote: ph('[Testimonial video: one-line quote]'),
      duration: '1:12',
      result: { value: ph('[+$X] a month in rebates'), label: ph('Within [X] months of switching') },
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* 04 Earnings calculator                                                      */
/* -------------------------------------------------------------------------- */

export const calculator = {
  titleLine1: 'What is your flow',
  titleLine2: 'really worth?',
  sub: 'Three inputs. Your real number in seconds.',
  lots: { label: 'Monthly volume', hint: 'Lots your clients trade per month', min: 500, max: 100_000, initial: 800 },
  rate: { label: 'Your current rebate', hint: 'What your broker pays you per lot', placeholder: 'e.g. 6', max: 30 },
  trader: { label: 'Add 10X Trader', hint: '10x buying power for your clients', badge: 'Exclusive' },
  /** Average partner rebate increase. */
  uplift: 1.4,
  /** Share of clients assumed to trade on 10X Trader, and the rebate multiple they earn. */
  traderShare: 0.25,
  traderMultiple: 2,
  result: {
    title: 'Your monthly earnings',
    now: 'Your deal now',
    deal: 'Better deal',
    trader: '10X Trader',
    perMonth: 'per month',
    perYear: "a year you're leaving on the table",
  },
  empty: {
    title: 'Your number appears here',
    text: "Type your current rebate per lot to see what you're leaving on the table each month.",
  },
  invalidRate: 'Enter a rebate between $0.01 and $30 per lot.',
  note: 'Estimate based on the average partner rebate increase of 40%. Your offer depends on your flow.',
  traderNote: '10X Trader assumes 1 in 4 clients trade on it at 2x rebates.',
  brokersLabel: 'Live deals with',
}

export const brokers = [
  { name: 'PU Prime', logo: '/images/broker-pu-prime.webp', w: 100, h: 96 },
  { name: 'MarketsVox', logo: '/images/broker-marketsvox.webp', w: 77, h: 96 },
  { name: 'STG Trader', logo: '/images/broker-stg.webp', w: 96, h: 96 },
]

/* -------------------------------------------------------------------------- */
/* 05 10X Trader                                                               */
/* -------------------------------------------------------------------------- */

export const trader = {
  titleLine1: 'Your referrals are your assets.',
  titleLine2: 'Stop watching them blow up.',
  body: 'Put 10x buying power behind every deposit. Your clients trade bigger from day one, and you earn 2-3x more on the same audience. As they perform, 10X scales them further, so your best referrals keep growing, and so do your earnings.',
  image: '/images/coins-trader.webp',
  imageAlt: 'Three 10X coins turning slowly in the air',
  stats: [
    { value: '10X', label: 'Buying power' },
    { value: '2-3x', label: 'More rebates for you' },
    { value: 'Scales', label: 'As your traders perform' },
  ],
  access: 'For selected partners only',
  howTitle: 'How 10X Trader works',
  howSub: 'One example client',
  deposit: {
    title: 'Deposit becomes buying power',
    text: 'Every client starts with 10x.',
    rows: [
      { label: 'Client deposit', value: '$1,000' },
      { label: '10X credit', value: '$9,000' },
      { label: 'Buying power', value: '$10,000' },
    ],
    rules: 'Max 10% drawdown. Leverage 1:25.',
  },
  scale: {
    title: 'Scales with performance',
    text: 'Buying power grows as they perform.',
    ladder: [
      { value: '$10k', label: 'Start' },
      { value: '$20k', label: 'Performs' },
      { value: '$50k', label: 'Scaled up' },
      { value: '$100k', label: 'Scaled further' },
    ],
  },
  earn: {
    title: 'Your earnings as IB',
    text: 'Rebates on 10x the trading capital.',
    standard: { label: 'Standard account', value: '1x' },
    boosted: { label: '10X Trader', value: '2-3x' },
    note: '2-3x more rebates on the same $1,000 deposit, and more as they scale.',
  },
  disclosure: ph('Illustrative example. [INSERT PRODUCT TERMS AND RISK DISCLOSURE]'),
}

/* -------------------------------------------------------------------------- */
/* 06 Apply: steps, qualifier, booking, FAQ, final CTA, footer                 */
/* -------------------------------------------------------------------------- */

export const apply = {
  titleLine1: 'The infrastructure to scale',
  titleLine2: 'in 3 simple steps',
  steps: [
    { title: 'Apply for access', text: 'Free, but not for everyone. Only for partners built for the top.' },
    { title: 'Strategy call', text: 'Meet your dedicated partner manager.' },
    { title: 'Your growth plan in 1 hour', text: 'Better rebates and access to all services, plus 10X Trader.' },
  ],
  badges: ['No fees', 'Keep your current broker', '2-minute application'],
}

export type Option = { value: string; label: string; sub?: string }

export const qualifier = {
  title: "Let's see what your flow is really worth.",
  intro: 'Six questions. Two minutes. Your answers shape the offer you get within 1 hour of your call.',
  steps: ['About you', 'Your book', 'Your flow', 'Growth', 'Your broker', 'Contact'],
  role: {
    question: 'Which best describes you?',
    options: [
      { value: 'ib', label: 'IB with active clients', sub: 'I refer traders to a broker and earn rebates' },
      { value: 'community', label: 'Signal room or trading community', sub: 'Telegram, Discord or WhatsApp groups' },
      { value: 'creator', label: 'Affiliate or content creator', sub: 'I have an audience, not yet a client book' },
      { value: 'pamm', label: 'PAMM or copy-trade manager', sub: 'I lead or manage follower capital' },
      { value: 'new', label: 'Just starting out', sub: 'I want to build an IB business' },
    ] satisfies Option[],
  },
  clients: {
    question: 'How many funded clients do you have right now?',
    options: [
      { value: '0', label: '0', sub: 'None yet' },
      { value: '1-25', label: '1-25', sub: 'Early book' },
      { value: '26-100', label: '26-100', sub: 'Growing book' },
      { value: '100+', label: '100+', sub: 'Established book' },
    ] satisfies Option[],
  },
  volume: {
    question: "What's your monthly trading volume?",
    options: [
      { value: '<100', label: 'Under 100 lots' },
      { value: '100-500', label: '100-500 lots' },
      { value: '500-2000', label: '500-2,000 lots' },
      { value: '2000+', label: '2,000+ lots' },
      { value: 'unknown', label: 'Not sure yet' },
    ] satisfies Option[],
  },
  blockers: {
    question: "What's slowing your growth right now?",
    hint: 'Pick everything that applies.',
    options: [
      'Low rebate or CPA deal',
      "My product doesn't convert",
      'Referrals blow their accounts',
      'No help with marketing or scaling',
      'No real infrastructure or tracking',
      'Late or missing payouts',
      'Clients unhappy with my broker',
      "Can't get new leads consistently",
    ],
  },
  broker: {
    question: 'How do you feel about your current broker?',
    options: [
      { value: 'stay', label: 'Fine, I just want a better deal' },
      { value: 'open', label: 'Open to switching' },
      { value: 'leave', label: 'I want to leave' },
      { value: 'none', label: 'No broker yet' },
    ] satisfies Option[],
  },
  contact: {
    question: 'Where do we send your partner plan?',
    name: 'Full name',
    email: 'Email',
    handle: 'WhatsApp or Telegram',
    handleHint: 'Optional, fastest reply',
    region: 'Where are most of your clients?',
    regionHint: 'So we match you with the right partner manager.',
    regions: ['Europe', 'Middle East', 'Africa', 'Asia', 'Latin America', 'North America', 'Oceania'],
    privacy: 'No spam. Your details stay with 10X.',
    submit: 'See my result',
  },
  partnerTrack: {
    label: 'Partner track',
    title: 'you qualify for a partner strategy call.',
    text: 'Your flow qualifies for a custom deal. On the call with your partner manager we cover:',
    points: [
      'Where your current deal leaves money on the table',
      'A better rebate offer within 1 hour',
      'Stay or switch broker, and how 10X Trader fits in',
    ],
  },
  growthTrack: {
    label: 'Growth track',
    title: "let's build your flow with the right structure from day one.",
    text: 'On a strategy call we set you up with 10X Trader as your product, a funnel to drive referrals and a partner manager to help you scale. Your offer lands within 1 hour.',
  },
  booking: {
    title: "You're in. Pick your time.",
    placeholder: '[CALENDLY EMBED: PARTNER STRATEGY CALL, 30 MIN]',
    placeholderHint: 'Set VITE_CALENDLY_URL (or links.calendly in src/content.ts). Name and email are prefilled from the qualifier.',
    afterTitle: 'Within 1 hour after the call',
    after: ['Your better rebate offer', 'Access to 10X Trader', "Your partner manager's direct line"],
    telegram: 'Join the partner channel on Telegram',
  },
  error: "We couldn't send your answers. Check your connection and try again. Nothing you entered has been lost.",
}

export const faq = {
  title: 'Straight answers',
  sub: 'Anything else, ask your partner manager on the call.',
  items: [
    {
      q: 'Do I have to leave my broker?',
      a: 'No. Keep your broker and add 10X Trader, or move to one of our partner brokers. We decide together on the call.',
    },
    {
      q: 'What does it cost me?',
      a: "Nothing. We're paid by the broker, out of the same deal that pays you. We only earn when your flow does, so our job is to make it grow.",
    },
    {
      q: 'Do my clients have to use 10X Trader?',
      a: 'No. Your deal covers standard accounts, copy trading and PAMM. 10X Trader is an optional extra if you want a product that converts faster.',
    },
    {
      q: 'How do you get to 40% more?',
      a: "Direct deals with our partner brokers, negotiated on the combined volume of all our partners. That's the average uplift our partners get. Your exact offer depends on your flow.",
    },
    {
      q: 'What happens after the call?',
      a: "Within 1 hour you get your rebate offer, access to 10X Trader and your dedicated partner manager's direct line.",
    },
    {
      q: "I'm just starting out. Is this for me?",
      a: 'Yes. Funnels, marketing and the UGC network are built to help you create flow, and 10X Trader gives you a product worth promoting.',
    },
  ],
}

export const finalCta = {
  titleLine1: 'Your referrals are your assets.',
  titleLine2: "Let's make them pay.",
  text: 'Plug into the full 10X infrastructure: a better rebate deal, 10X Trader, done-for-you funnels and a dedicated partner manager. No fees: the broker pays us, not you.',
  badges: ['No fees', 'Offer within 1 hour', '2-minute application'],
}

export const footer = {
  blurb: 'The partner infrastructure behind top IBs: better deals, products that convert and a team that helps you scale.',
  links: [
    { label: 'Terms', href: links.terms },
    { label: 'Privacy', href: links.privacy },
    { label: 'Risk disclosure', href: links.risk },
  ],
  copyright: '© 10X Affiliation. WeGroup Ventures FZCO, Dubai.',
  disclaimer: 'Individual results depend on volume and client activity.',
  risk: ph('Risk warning: [INSERT COMPLIANCE RISK WARNING. Leveraged trading carries a high level of risk.]'),
}
