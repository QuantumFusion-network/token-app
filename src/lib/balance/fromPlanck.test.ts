// fromPlanck.test.ts
import { describe, expect, it } from 'vitest'

import {
  ERR_DECIMALS_RANGE,
  ERR_DECIMALS_TOO_LARGE,
  ERR_NEGATIVE_NOT_SUPPORTED,
  MAX_DECIMALS,
} from './config'
import { fromPlanck, type FromPlanckOptions } from './fromPlanck'
import { toPlanck } from './toPlanck'

describe('fromPlanck', () => {
  const D = 18

  it('formats basic values with default (trimmed) behavior', () => {
    expect(fromPlanck(0n, D)).toBe('0')
    expect(fromPlanck(1_000000000000000000n, D)).toBe('1')
    expect(fromPlanck(123_000000000000000000n, D)).toBe('123')
    expect(fromPlanck(123_450000000000000000n, D)).toBe('123.45')
    expect(fromPlanck(1n, D)).toBe('0.000000000000000001')
  })

  it('supports fixed formatting', () => {
    const fixedOpts: FromPlanckOptions = { fixed: true }

    expect(fromPlanck(0n, D, fixedOpts)).toBe('0.' + '0'.repeat(D))
    expect(fromPlanck(1_000000000000000000n, D, fixedOpts)).toBe(
      '1.' + '0'.repeat(D)
    )
    expect(fromPlanck(1n, 3, fixedOpts)).toBe('0.001')
  })

  it('handles decimals = 0', () => {
    expect(fromPlanck(0n, 0)).toBe('0')
    expect(fromPlanck(42n, 0)).toBe('42')
  })

  it('validates decimals and cap', () => {
    expect(() => fromPlanck(1n, -1 as unknown as number)).toThrow(
      ERR_DECIMALS_RANGE
    )
    expect(() => fromPlanck(1n, 1.5 as unknown as number)).toThrow(
      ERR_DECIMALS_RANGE
    )
    expect(() => fromPlanck(1n, MAX_DECIMALS + 1)).toThrow(
      ERR_DECIMALS_TOO_LARGE
    )
    expect(() => fromPlanck(1n, MAX_DECIMALS)).not.toThrow()
  })

  it('rejects negative values', () => {
    expect(() => fromPlanck(-1n, 18)).toThrow(ERR_NEGATIVE_NOT_SUPPORTED)
  })
})

describe('round-trip between toPlanck and fromPlanck', () => {
  const cases: Array<{ s: string; decimals: number }> = [
    { s: '0', decimals: 18 },
    { s: '1', decimals: 18 },
    { s: '1.23', decimals: 18 },
    { s: '0.000000000000000001', decimals: 18 },
    { s: '123456.789123', decimals: 6 },
    { s: '.5', decimals: 18 },
    { s: '5.', decimals: 18 },
    { s: '42.9999', decimals: 2 }, // will truncate
    { s: '1_000.5', decimals: 18 },
    { s: '0.000_001', decimals: 18 },
  ]

  it('round-trips under truncation semantics (trimmed output)', () => {
    for (const { s, decimals } of cases) {
      const planck = toPlanck(s, decimals)
      const back = fromPlanck(planck, decimals)

      // For truncated cases, toPlanck(s) equals toPlanck(back)
      const again = toPlanck(back, decimals)
      expect(again).toBe(planck)
    }
  })

  it('round-trips with fixed formatting preserving numeric value', () => {
    for (const { s, decimals } of cases) {
      const planck = toPlanck(s, decimals)
      const fixed = fromPlanck(planck, decimals, { fixed: true })
      const again = toPlanck(fixed, decimals)
      expect(again).toBe(planck)
    }
  })
})
