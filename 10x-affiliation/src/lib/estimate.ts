import { calculator } from '@/content'

export type Estimate = {
  lots: number
  rate: number | null
  withTrader: boolean
  now: number
  deal: number
  trader: number
  total: number
  gap: number
}

/**
 * The canvas formula: the better deal is the current rebate x1.4; 10X Trader assumes a share of
 * clients (1 in 4) trades on it at a multiple (2x) of the new rebate.
 */
export function estimate(lots: number, rate: number | null, withTrader: boolean): Estimate {
  const now = rate ? lots * rate : 0
  const next = Math.round(now * calculator.uplift)
  const boosted = Math.round(next * (1 - calculator.traderShare) + next * calculator.traderShare * calculator.traderMultiple)
  const total = withTrader ? boosted : next
  return { lots, rate, withTrader, now, deal: next - now, trader: withTrader ? boosted - next : 0, total, gap: total - now }
}

/** The visitor's last calculator result, sent along with the qualifier so the partner manager sees it. */
let last: Estimate | null = null
export const lastEstimate = {
  get: () => last,
  set: (e: Estimate | null) => {
    last = e
  },
}

export const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
