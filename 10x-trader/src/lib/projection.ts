/**
 * The live 10xtrader.com calculator, reproduced exactly (checked against its output, Oct 2026):
 *   months      = whole months from the chosen start month to the current month
 *   traditional = deposit x (1 + r)^months
 *   10X         = 10 x deposit x (1 + r)^months, profit measured against the 10X starting account
 *   return %    = profit / deposit
 * A constant-return illustration, not a forecast.
 */
export type Method = '10x' | 'traditional'

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function monthsSince(month: number, year: number, now = new Date()) {
  return Math.max(0, (now.getFullYear() - year) * 12 + (now.getMonth() - month))
}

export function project(deposit: number, monthlyPct: number, months: number, method: Method) {
  const start = method === '10x' ? deposit * 10 : deposit
  const balance = start * Math.pow(1 + monthlyPct / 100, months)
  const profit = balance - start
  return { start, balance, profit, returnPct: deposit > 0 ? (profit / deposit) * 100 : 0 }
}

/** Month-by-month balances for the chart, both methods. */
export function series(deposit: number, monthlyPct: number, months: number) {
  return Array.from({ length: months + 1 }, (_, i) => ({
    i,
    tenX: project(deposit, monthlyPct, i, '10x').balance,
    traditional: project(deposit, monthlyPct, i, 'traditional').balance,
  }))
}

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const formatUsd = (n: number) => usd0.format(Math.round(n))

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const formatCompactUsd = (n: number) => '$' + compact.format(n)

export const formatPct = (n: number) =>
  (n >= 0 ? '+' : '') + n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
