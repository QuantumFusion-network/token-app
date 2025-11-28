// toPlanck.test.ts
import { describe, expect, it } from 'vitest'

import {
  ERR_DECIMALS_RANGE,
  ERR_DECIMALS_TOO_LARGE,
  ERR_NEGATIVE_NOT_SUPPORTED,
  MAX_DECIMALS,
} from './config'
import { toPlanck } from './toPlanck'

describe('toPlanck', () => {
  const ONE = 10n ** 18n // 1.0 with 18 decimals
  const P = (s: string, decimals = 18) => toPlanck(s, decimals)

  it('converts basic integers', () => {
    expect(P('0')).toBe(0n)
    expect(P('1')).toBe(ONE) // 1.0 = 1 * 10^18
    expect(P('42')).toBe(42n * ONE) // 42.0 = 42 * 10^18
    expect(P('000')).toBe(0n)
    expect(P('00042')).toBe(42n * ONE)
  })

  it('converts basic fractions with exact precision', () => {
    expect(P('0.1')).toBe(ONE / 10n) // 0.1 = 1/10
    expect(P('0.01')).toBe(ONE / 100n) // 0.01 = 1/100
    expect(P('1.23')).toBe((123n * ONE) / 100n) // 1.23 = 123/100
    expect(P('0001.2300')).toBe((123n * ONE) / 100n) // Normalized: 1.23 = 123/100
  })

  it('handles fractions shorter than decimals (right-padding)', () => {
    expect(P('0.000000000000000001')).toBe(1n) // Smallest unit (1 planck)
    expect(P('.5')).toBe((5n * ONE) / 10n) // 0.5 = 5/10
    expect(P('5.')).toBe(5n * ONE) // 5.0 = 5 * 10^18
  })

  it('truncates extra fractional digits (no rounding)', () => {
    // 18 decimals: all digits fit
    expect(P('1.234567891234567891')).toBe(1234567891234567891n)

    // 2 decimals: truncates to 1.23 (not 1.24)
    expect(P('1.2345', 2)).toBe(123n) // 1.23 with 2 decimals
    expect(P('0.9999', 2)).toBe(99n) // 0.99 (NOT 1.00 - never rounds up!)
  })

  it('supports numeric separators with underscores', () => {
    expect(P('1_000')).toBe(1000n * ONE) // 1,000.0 = 1000 * 10^18
    expect(P('1_000.5')).toBe((10005n * ONE) / 10n) // 1,000.5 = 10005/10
    expect(P('0.000_001')).toBe(ONE / 1_000_000n) // 0.000001 = 1/1,000,000
  })

  it('handles decimals = 0 by ignoring fractional part', () => {
    expect(P('0', 0)).toBe(0n)
    expect(P('42', 0)).toBe(42n)
    expect(P('42.999', 0)).toBe(42n) // Truncates to 42
    expect(P('.5', 0)).toBe(0n) // Truncates to 0
  })

  it('trims whitespace', () => {
    expect(P('  1  ')).toBe(ONE)
    expect(P('  01.230  ')).toBe((123n * ONE) / 100n) // 1.23 = 123/100
  })

  it.each([
    ['', 'empty string'],
    [' ', 'whitespace only'],
    ['.', 'decimal point only'],
    ['   .   ', 'decimal point with whitespace'],
    ['abc', 'non-numeric characters'],
    ['1.2.3', 'multiple decimal points'],
    ['1..2', 'consecutive decimal points'],
    ['1e3', 'lowercase exponential notation'],
    ['1E3', 'uppercase exponential notation'],
    ['+1', 'explicit positive sign'],
    ['+0.1', 'positive sign with decimal'],
    ['1-2', 'dash in middle'],
    ['1-', 'trailing dash'],
    ['_', 'underscore only'],
    ['--1', 'double negative sign'],
    ['_.1', 'underscore at start'],
    ['1._2', 'underscore after decimal point'],
  ])('rejects invalid input: %s (%s)', (input, _reason) => {
    expect(() => P(input)).toThrow()
  })

  it('rejects negative numbers with a clear error', () => {
    const negatives = ['-1', '-0.1', ' -1 ', '-0']
    for (const s of negatives) {
      expect(() => P(s)).toThrow(ERR_NEGATIVE_NOT_SUPPORTED)
    }
  })

  it('validates decimals parameter and cap', () => {
    expect(() => P('1', -1 as unknown as number)).toThrow(ERR_DECIMALS_RANGE)
    expect(() => P('1', 1.5 as unknown as number)).toThrow(ERR_DECIMALS_RANGE)
    expect(() => P('1', MAX_DECIMALS + 1)).toThrow(ERR_DECIMALS_TOO_LARGE)
    expect(() => P('1', MAX_DECIMALS)).not.toThrow()
  })
})
