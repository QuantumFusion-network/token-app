/**
 * Tests for lib/utils.ts - Numeric precision and utility functions
 *
 * CRITICAL: These functions handle financial calculations for token amounts.
 * Errors in these functions could result in:
 * - Incorrect token amounts displayed to users
 * - Incorrect token amounts sent in transactions
 * - Loss of funds or precision
 *
 * Test Coverage:
 * - formatUnits: Converts bigint (blockchain units) → decimal string (display)
 * - parseUnits: Converts decimal string (user input) → bigint (blockchain)
 * - formatFee: Formats QF Network fees (18 decimals → 4 decimal places)
 * - cn: Tailwind CSS class merging utility
 */

import { describe, expect, it } from 'vitest'
import { formatUnits, parseUnits, formatFee, cn } from '@/lib/utils'

describe('formatUnits', () => {
  describe('Basic functionality', () => {
    it('formats whole numbers without decimals', () => {
      // 1000 tokens with 0 decimals = 1000
      expect(formatUnits(1000n, 0)).toBe('1000')

      // 1000 tokens with 6 decimals but no fractional part = 1
      expect(formatUnits(1000000n, 6)).toBe('1')

      // 100 USDC (6 decimals)
      expect(formatUnits(100000000n, 6)).toBe('100')
    })

    it('formats decimal numbers correctly', () => {
      // 123.45 USDC (6 decimals)
      expect(formatUnits(123450000n, 6)).toBe('123.45')

      // 0.5 TOKEN (18 decimals)
      expect(formatUnits(500000000000000000n, 18)).toBe('0.5')

      // 1.23 TOKEN (18 decimals)
      expect(formatUnits(1230000000000000000n, 18)).toBe('1.23')
    })

    it('removes trailing zeros from decimal portion', () => {
      // 1.100000 → 1.1
      expect(formatUnits(1100000n, 6)).toBe('1.1')

      // 123.450000 → 123.45
      expect(formatUnits(123450000n, 6)).toBe('123.45')

      // 0.100000000000000000 → 0.1
      expect(formatUnits(100000000000000000n, 18)).toBe('0.1')
    })

    it('handles zero values', () => {
      expect(formatUnits(0n, 0)).toBe('0')
      expect(formatUnits(0n, 6)).toBe('0')
      expect(formatUnits(0n, 18)).toBe('0')
    })
  })

  describe('High precision (18 decimals)', () => {
    it('formats maximum precision values', () => {
      // 1.123456789012345678 TOKEN (all 18 decimals used)
      expect(formatUnits(1123456789012345678n, 18)).toBe('1.123456789012345678')

      // 0.000000000000000001 TOKEN (minimum non-zero)
      expect(formatUnits(1n, 18)).toBe('0.000000000000000001')
    })

    it('preserves precision without trailing zeros', () => {
      // 1.000000000000000001 TOKEN → 1.000000000000000001
      expect(formatUnits(1000000000000000001n, 18)).toBe('1.000000000000000001')

      // 1.100000000000000000 TOKEN → 1.1
      expect(formatUnits(1100000000000000000n, 18)).toBe('1.1')
    })

    it('handles very large amounts', () => {
      // 1,000,000 TOKEN (18 decimals)
      expect(formatUnits(1000000000000000000000000n, 18)).toBe('1000000')

      // 1 billion TOKEN
      expect(formatUnits(1000000000000000000000000000n, 18)).toBe('1000000000')
    })
  })

  describe('Medium precision (6 decimals - USDC pattern)', () => {
    it('formats common stablecoin amounts', () => {
      // 1 USDC
      expect(formatUnits(1000000n, 6)).toBe('1')

      // 100.50 USDC
      expect(formatUnits(100500000n, 6)).toBe('100.5')

      // 1,000,000.123456 USDC (max precision)
      expect(formatUnits(1000000123456n, 6)).toBe('1000000.123456')
    })

    it('handles fractional cents', () => {
      // 0.01 USDC (1 cent)
      expect(formatUnits(10000n, 6)).toBe('0.01')

      // 0.000001 USDC (minimum unit)
      expect(formatUnits(1n, 6)).toBe('0.000001')
    })
  })

  describe('Edge cases', () => {
    it('handles 1 decimal place', () => {
      expect(formatUnits(10n, 1)).toBe('1')
      expect(formatUnits(15n, 1)).toBe('1.5')
      expect(formatUnits(1n, 1)).toBe('0.1')
    })

    it('handles fractional amounts less than 1', () => {
      // 0.5 with 6 decimals
      expect(formatUnits(500000n, 6)).toBe('0.5')

      // 0.001 with 6 decimals
      expect(formatUnits(1000n, 6)).toBe('0.001')

      // 0.999999 with 6 decimals
      expect(formatUnits(999999n, 6)).toBe('0.999999')
    })

    it('handles amounts that barely exceed whole numbers', () => {
      // 1.000001 with 6 decimals
      expect(formatUnits(1000001n, 6)).toBe('1.000001')

      // 1.000000000000000001 with 18 decimals
      expect(formatUnits(1000000000000000001n, 18)).toBe('1.000000000000000001')
    })
  })
})

describe('parseUnits', () => {
  describe('Basic functionality', () => {
    it('parses whole numbers', () => {
      // 100 → 100000000 (6 decimals)
      expect(parseUnits('100', 6)).toBe(100000000n)

      // 1 → 1000000000000000000 (18 decimals)
      expect(parseUnits('1', 18)).toBe(1000000000000000000n)

      // 1000 with 0 decimals
      expect(parseUnits('1000', 0)).toBe(1000n)
    })

    it('parses decimal numbers', () => {
      // 123.45 → 123450000 (6 decimals)
      expect(parseUnits('123.45', 6)).toBe(123450000n)

      // 0.5 → 500000000000000000 (18 decimals)
      expect(parseUnits('0.5', 18)).toBe(500000000000000000n)

      // 1.23 → 1230000000000000000 (18 decimals)
      expect(parseUnits('1.23', 18)).toBe(1230000000000000000n)
    })

    it('pads short decimals with zeros', () => {
      // 1.1 → 1.100000 (6 decimals)
      expect(parseUnits('1.1', 6)).toBe(1100000n)

      // 100.5 → 100.500000 (6 decimals)
      expect(parseUnits('100.5', 6)).toBe(100500000n)

      // 1.1 → 1.100000000000000000 (18 decimals)
      expect(parseUnits('1.1', 18)).toBe(1100000000000000000n)
    })

    it('truncates excess decimal places', () => {
      // 1.123456789 → 1.123456 (6 decimals, truncated)
      expect(parseUnits('1.123456789', 6)).toBe(1123456n)

      // 1.123456789012345678901 → 1.123456789012345678 (18 decimals, truncated)
      expect(parseUnits('1.123456789012345678901', 18)).toBe(1123456789012345678n)
    })

    it('handles zero values', () => {
      expect(parseUnits('0', 0)).toBe(0n)
      expect(parseUnits('0', 6)).toBe(0n)
      expect(parseUnits('0', 18)).toBe(0n)
      expect(parseUnits('0.0', 6)).toBe(0n)
      expect(parseUnits('0.000000', 6)).toBe(0n)
    })
  })

  describe('High precision (18 decimals)', () => {
    it('parses maximum precision values', () => {
      // 1.123456789012345678 TOKEN
      expect(parseUnits('1.123456789012345678', 18)).toBe(1123456789012345678n)

      // Minimum non-zero amount
      expect(parseUnits('0.000000000000000001', 18)).toBe(1n)
    })

    it('handles very large amounts', () => {
      // 1,000,000 TOKEN
      expect(parseUnits('1000000', 18)).toBe(1000000000000000000000000n)

      // 1 billion TOKEN
      expect(parseUnits('1000000000', 18)).toBe(1000000000000000000000000000n)
    })
  })

  describe('Medium precision (6 decimals - USDC pattern)', () => {
    it('parses common stablecoin amounts', () => {
      // 1 USDC
      expect(parseUnits('1', 6)).toBe(1000000n)

      // 100.50 USDC
      expect(parseUnits('100.50', 6)).toBe(100500000n)

      // 1,000,000.123456 USDC
      expect(parseUnits('1000000.123456', 6)).toBe(1000000123456n)
    })

    it('handles fractional cents', () => {
      // 0.01 USDC
      expect(parseUnits('0.01', 6)).toBe(10000n)

      // 0.000001 USDC (minimum)
      expect(parseUnits('0.000001', 6)).toBe(1n)
    })
  })

  describe('Edge cases', () => {
    it('handles strings without decimal points', () => {
      expect(parseUnits('100', 6)).toBe(100000000n)
      expect(parseUnits('1', 18)).toBe(1000000000000000000n)
    })

    it('handles strings with trailing zeros', () => {
      // 1.100000 → same as 1.1
      expect(parseUnits('1.100000', 6)).toBe(1100000n)
      expect(parseUnits('1.1', 6)).toBe(1100000n)

      // 100.000000 → same as 100
      expect(parseUnits('100.000000', 6)).toBe(100000000n)
      expect(parseUnits('100', 6)).toBe(100000000n)
    })

    it('handles fractional amounts less than 1', () => {
      // 0.5
      expect(parseUnits('0.5', 6)).toBe(500000n)
      expect(parseUnits('0.5', 18)).toBe(500000000000000000n)

      // 0.001
      expect(parseUnits('0.001', 6)).toBe(1000n)
      expect(parseUnits('0.001', 18)).toBe(1000000000000000n)
    })
  })
})

describe('formatUnits and parseUnits roundtrip', () => {
  it('roundtrip conversion preserves values (6 decimals)', () => {
    const testCases = ['100', '123.45', '0.5', '0.000001', '1000000.123456']

    testCases.forEach((value) => {
      const parsed = parseUnits(value, 6)
      const formatted = formatUnits(parsed, 6)
      // Note: Trailing zeros are removed by formatUnits
      expect(formatted).toBe(parseFloat(value).toString())
    })
  })

  it('roundtrip conversion preserves values (18 decimals)', () => {
    const testCases = [
      '1',
      '0.5',
      '123.456789012345678',
      '0.000000000000000001',
      '1000000',
    ]

    testCases.forEach((value) => {
      const parsed = parseUnits(value, 18)
      const formatted = formatUnits(parsed, 18)
      expect(formatted).toBe(value)
    })
  })

  it('handles values with trailing zeros correctly', () => {
    // Input with trailing zeros
    const parsed = parseUnits('1.100000', 6)
    const formatted = formatUnits(parsed, 6)
    // formatUnits removes trailing zeros
    expect(formatted).toBe('1.1')

    // Verify the numeric value is preserved
    expect(parseUnits(formatted, 6)).toBe(parsed)
  })
})

describe('formatFee', () => {
  describe('QF Network fee formatting (18 decimals → 4 decimal places)', () => {
    it('formats whole number fees', () => {
      // 1 QFN
      expect(formatFee(1000000000000000000n)).toBe('1')

      // 10 QFN
      expect(formatFee(10000000000000000000n)).toBe('10')

      // 100 QFN
      expect(formatFee(100000000000000000000n)).toBe('100')
    })

    it('formats fractional fees with max 4 decimal places', () => {
      // 0.1234 QFN
      expect(formatFee(123400000000000000n)).toBe('0.1234')

      // 1.5678 QFN
      expect(formatFee(1567800000000000000n)).toBe('1.5678')

      // 0.0001 QFN
      expect(formatFee(100000000000000n)).toBe('0.0001')
    })

    it('truncates to 4 decimal places (does not round)', () => {
      // 1.123456789012345678 QFN → 1.1234
      expect(formatFee(1123456789012345678n)).toBe('1.1234')

      // 0.123456789012345678 QFN → 0.1234
      expect(formatFee(123456789012345678n)).toBe('0.1234')

      // 1.999999999999999999 QFN → 1.9999
      expect(formatFee(1999999999999999999n)).toBe('1.9999')
    })

    it('removes trailing zeros from the 4-decimal display', () => {
      // 1.1000 → 1.1
      expect(formatFee(1100000000000000000n)).toBe('1.1')

      // 0.5000 → 0.5
      expect(formatFee(500000000000000000n)).toBe('0.5')

      // 1.2300 → 1.23
      expect(formatFee(1230000000000000000n)).toBe('1.23')
    })

    it('handles very small fees (precision loss expected)', () => {
      // 0.00001 QFN → 0.0000 (truncated to 4 decimals, shows as 0.0000)
      expect(formatFee(10000000000000n)).toBe('0.0000')

      // 0.0001 QFN → 0.0001 (just barely visible)
      expect(formatFee(100000000000000n)).toBe('0.0001')
    })

    it('handles zero fee', () => {
      expect(formatFee(0n)).toBe('0')
    })

    it('handles large fees', () => {
      // 1,000,000 QFN
      expect(formatFee(1000000000000000000000000n)).toBe('1000000')

      // 999,999.9999 QFN
      expect(formatFee(999999999900000000000000n)).toBe('999999.9999')
    })
  })

  describe('Real-world QF Network fee examples', () => {
    it('formats typical transaction fees', () => {
      // Typical transfer fee: ~0.01 QFN
      expect(formatFee(10000000000000000n)).toBe('0.01')

      // Asset creation fee: ~0.1 QFN
      expect(formatFee(100000000000000000n)).toBe('0.1')

      // Complex transaction fee: ~0.05 QFN
      expect(formatFee(50000000000000000n)).toBe('0.05')
    })
  })
})

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar')).toBe('foo bar')
  })

  it('merges Tailwind classes correctly (deduplicates)', () => {
    // twMerge should keep the last conflicting class
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles arrays and objects (clsx patterns)', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })
})
