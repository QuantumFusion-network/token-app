// format.test.ts
import { describe, expect, it } from 'vitest'

import { ERR_EMPTY_INPUT, ERR_DECIMALS_RANGE } from './config'
import {
  formatTokenDisplay,
  formatBalance,
  type RoundingMode,
} from './format'

describe('formatTokenDisplay', () => {
  describe('basic formatting without options', () => {
    it('should return input unchanged when no options provided', () => {
      expect(formatTokenDisplay('1.23')).toBe('1.23')
      expect(formatTokenDisplay('0')).toBe('0')
      expect(formatTokenDisplay('1234.56789')).toBe('1234.56789')
    })

    it('should trim whitespace from input', () => {
      expect(formatTokenDisplay('  1.23  ')).toBe('1.23')
      expect(formatTokenDisplay(' 0.5 ')).toBe('0.5')
    })

    it('should reject empty string', () => {
      expect(() => formatTokenDisplay('')).toThrow(ERR_EMPTY_INPUT)
      expect(() => formatTokenDisplay('   ')).toThrow(ERR_EMPTY_INPUT)
    })
  })

  describe('displayDecimals parameter', () => {
    it('should pad with zeros when input has fewer decimals than requested', () => {
      expect(formatTokenDisplay('1.2', { displayDecimals: 4 })).toBe('1.2000')
      expect(formatTokenDisplay('5', { displayDecimals: 2 })).toBe('5.00')
      expect(formatTokenDisplay('0.1', { displayDecimals: 6 })).toBe('0.100000')
    })

    it('should handle displayDecimals = 0 by removing decimal point', () => {
      expect(formatTokenDisplay('1.999', { displayDecimals: 0 })).toBe('1')
      expect(formatTokenDisplay('42.5', { displayDecimals: 0 })).toBe('42')
      expect(formatTokenDisplay('100', { displayDecimals: 0 })).toBe('100')
    })

    it('should return exact value when displayDecimals matches input', () => {
      expect(formatTokenDisplay('1.23', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('0.123456', { displayDecimals: 6 })).toBe('0.123456')
    })

    it('should validate displayDecimals parameter', () => {
      expect(() =>
        formatTokenDisplay('1.23', { displayDecimals: -1 })
      ).toThrow(ERR_DECIMALS_RANGE)

      expect(() =>
        formatTokenDisplay('1.23', { displayDecimals: 1.5 })
      ).toThrow(ERR_DECIMALS_RANGE)
    })
  })

  describe('floor mode (default)', () => {
    it('should truncate extra decimals without rounding', () => {
      expect(formatTokenDisplay('1.236', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('1.239', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('0.999', { displayDecimals: 2 })).toBe('0.99')
    })

    it('should never round up, even when next digit >= 5', () => {
      expect(formatTokenDisplay('1.235', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('1.239', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('0.995', { displayDecimals: 2 })).toBe('0.99')
      expect(formatTokenDisplay('0.999', { displayDecimals: 2 })).toBe('0.99')
    })

    it('should handle floor mode explicitly specified', () => {
      expect(
        formatTokenDisplay('1.236', { displayDecimals: 2, mode: 'floor' })
      ).toBe('1.23')
    })
  })

  describe('round mode', () => {
    it('should round up when next digit >= 5', () => {
      expect(
        formatTokenDisplay('1.235', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.24')
      expect(
        formatTokenDisplay('1.236', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.24')
      expect(
        formatTokenDisplay('0.995', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.00')
    })

    it('should round down when next digit < 5', () => {
      expect(
        formatTokenDisplay('1.234', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.23')
      expect(
        formatTokenDisplay('1.231', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.23')
      expect(
        formatTokenDisplay('0.994', { displayDecimals: 2, mode: 'round' })
      ).toBe('0.99')
    })

    it('should handle carry-over when rounding causes overflow', () => {
      // 0.999 rounded to 2 decimals → 1.00
      expect(
        formatTokenDisplay('0.999', { displayDecimals: 2, mode: 'round' })
      ).toBe('1.00')

      // 9.995 rounded to 2 decimals → 10.00
      expect(
        formatTokenDisplay('9.995', { displayDecimals: 2, mode: 'round' })
      ).toBe('10.00')

      // 99.99999 rounded to 2 decimals → 100.00
      expect(
        formatTokenDisplay('99.99999', { displayDecimals: 2, mode: 'round' })
      ).toBe('100.00')
    })
  })

  describe('ceil mode', () => {
    it('should always round up when there are extra decimals', () => {
      expect(
        formatTokenDisplay('1.231', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.24')
      expect(
        formatTokenDisplay('1.239', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.24')
      expect(
        formatTokenDisplay('0.991', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.00')
    })

    it('should not round up when no extra decimals', () => {
      expect(
        formatTokenDisplay('1.23', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.23')
      expect(
        formatTokenDisplay('1.230', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.23')
    })

    it('should handle carry-over when rounding causes overflow', () => {
      expect(
        formatTokenDisplay('0.991', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1.00')
      expect(
        formatTokenDisplay('9.991', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('10.00')
    })
  })

  describe('comparison of rounding modes', () => {
    const testCases: Array<[string, number, string, string, string]> = [
      // [input, decimals, floor, round, ceil]
      ['1.234', 2, '1.23', '1.23', '1.24'],
      ['1.235', 2, '1.23', '1.24', '1.24'],
      ['1.236', 2, '1.23', '1.24', '1.24'],
      ['0.999', 2, '0.99', '1.00', '1.00'],
      ['0.994', 2, '0.99', '0.99', '1.00'],
      ['0.991', 2, '0.99', '0.99', '1.00'],
    ]

    it.each(testCases)(
      'formats %s with %i decimals: floor=%s, round=%s, ceil=%s',
      (input, decimals, floorResult, roundResult, ceilResult) => {
        expect(
          formatTokenDisplay(input, { displayDecimals: decimals, mode: 'floor' })
        ).toBe(floorResult)
        expect(
          formatTokenDisplay(input, { displayDecimals: decimals, mode: 'round' })
        ).toBe(roundResult)
        expect(
          formatTokenDisplay(input, { displayDecimals: decimals, mode: 'ceil' })
        ).toBe(ceilResult)
      }
    )
  })

  describe('thousand separators (grouping)', () => {
    it('should add commas to integer part when useGrouping is true', () => {
      expect(formatTokenDisplay('1234', { useGrouping: true })).toBe('1,234')
      expect(formatTokenDisplay('1234567', { useGrouping: true })).toBe(
        '1,234,567'
      )
      expect(formatTokenDisplay('1234567.89', { useGrouping: true })).toBe(
        '1,234,567.89'
      )
    })

    it('should not add commas to small numbers', () => {
      expect(formatTokenDisplay('123', { useGrouping: true })).toBe('123')
      expect(formatTokenDisplay('12.34', { useGrouping: true })).toBe('12.34')
    })

    it('should work with displayDecimals and grouping together', () => {
      expect(
        formatTokenDisplay('1234567.123456', {
          displayDecimals: 2,
          useGrouping: true,
        })
      ).toBe('1,234,567.12')

      expect(
        formatTokenDisplay('1234567.999', {
          displayDecimals: 2,
          mode: 'round',
          useGrouping: true,
        })
      ).toBe('1,234,568.00')
    })

    it('should handle grouping with displayDecimals = 0', () => {
      expect(
        formatTokenDisplay('1234567.89', {
          displayDecimals: 0,
          useGrouping: true,
        })
      ).toBe('1,234,567')
    })
  })

  describe('edge cases', () => {
    it('should handle zero correctly', () => {
      expect(formatTokenDisplay('0', { displayDecimals: 2 })).toBe('0.00')
      expect(formatTokenDisplay('0.00', { displayDecimals: 4 })).toBe('0.0000')
      expect(formatTokenDisplay('0', { displayDecimals: 0 })).toBe('0')
    })

    it('should handle very small values', () => {
      expect(
        formatTokenDisplay('0.000000000000000001', { displayDecimals: 18 })
      ).toBe('0.000000000000000001')

      expect(
        formatTokenDisplay('0.000000000000000001', { displayDecimals: 6 })
      ).toBe('0.000000')
    })

    it('should handle very large values', () => {
      const large = '999999999999999999.123456789'
      expect(formatTokenDisplay(large, { displayDecimals: 2 })).toBe(
        '999999999999999999.12'
      )
      expect(
        formatTokenDisplay(large, { displayDecimals: 2, useGrouping: true })
      ).toBe('999,999,999,999,999,999.12')
    })

    it('should handle integer inputs (no decimal point)', () => {
      expect(formatTokenDisplay('42', { displayDecimals: 0 })).toBe('42')
      expect(formatTokenDisplay('42', { displayDecimals: 2 })).toBe('42.00')
      expect(formatTokenDisplay('1000', { useGrouping: true })).toBe('1,000')
    })

    it('should handle trailing zeros in input', () => {
      expect(formatTokenDisplay('1.2300', { displayDecimals: 2 })).toBe('1.23')
      expect(formatTokenDisplay('1.0000', { displayDecimals: 4 })).toBe(
        '1.0000'
      )
    })
  })

  describe('real-world usage scenarios', () => {
    it('should format token balances for dashboard (2 decimals)', () => {
      const balance = '1234.56789012345'

      expect(formatTokenDisplay(balance, { displayDecimals: 2 })).toBe(
        '1234.56'
      )
      expect(
        formatTokenDisplay(balance, {
          displayDecimals: 2,
          useGrouping: true,
        })
      ).toBe('1,234.56')
    })

    it('should format USD values with rounding', () => {
      const price = '1234.5678'

      expect(
        formatTokenDisplay(price, { displayDecimals: 2, mode: 'round' })
      ).toBe('1234.57')

      expect(
        formatTokenDisplay(price, {
          displayDecimals: 2,
          mode: 'round',
          useGrouping: true,
        })
      ).toBe('1,234.57')
    })

    it('should format transaction amounts conservatively', () => {
      // When showing "you will send", use floor to never overstate
      const userInput = '999.999'

      expect(
        formatTokenDisplay(userInput, { displayDecimals: 2, mode: 'floor' })
      ).toBe('999.99')
    })

    it('should format high-precision token amounts', () => {
      const highPrecision = '0.000000000000123456'

      // Show full precision in details view
      expect(formatTokenDisplay(highPrecision)).toBe(
        '0.000000000000123456'
      )

      // Truncate for compact view
      expect(
        formatTokenDisplay(highPrecision, { displayDecimals: 8 })
      ).toBe('0.00000000')
    })
  })

  describe('integration with fromPlanck', () => {
    it('should handle typical fromPlanck output', () => {
      // Simulate fromPlanck returning "1.236789"
      const fromPlanckOutput = '1.236789'

      // Format for display
      expect(
        formatTokenDisplay(fromPlanckOutput, {
          displayDecimals: 2,
          mode: 'floor',
        })
      ).toBe('1.23')

      // With rounding
      expect(
        formatTokenDisplay(fromPlanckOutput, {
          displayDecimals: 2,
          mode: 'round',
        })
      ).toBe('1.24')
    })

    it('should preserve precision when no formatting applied', () => {
      const exact = '1.000000000000000001'

      // No formatting - keeps exact value
      expect(formatTokenDisplay(exact)).toBe('1.000000000000000001')

      // Can still calculate with original value
      const [int, frac] = exact.split('.')
      expect(int).toBe('1')
      expect(frac).toBe('000000000000000001')
    })
  })
})

describe('formatBalance', () => {
  describe('basic formatting without locale/symbol', () => {
    it('should format with default en-US locale', () => {
      expect(formatBalance('1234.56')).toBe('1,234.56')
      expect(formatBalance('1234567.89')).toBe('1,234,567.89')
    })

    it('should apply displayDecimals', () => {
      expect(formatBalance('1234.5678', { displayDecimals: 2 })).toBe('1,234.56')
      // Default mode is floor, so 1234.5678 → 1234
      expect(formatBalance('1234.5678', { displayDecimals: 0 })).toBe('1,234')
    })

    it('should respect rounding mode', () => {
      expect(
        formatBalance('1234.567', { displayDecimals: 2, mode: 'floor' })
      ).toBe('1,234.56')
      expect(
        formatBalance('1234.567', { displayDecimals: 2, mode: 'round' })
      ).toBe('1,234.57')
      expect(
        formatBalance('1234.564', { displayDecimals: 2, mode: 'ceil' })
      ).toBe('1,234.57')
    })
  })

  describe('locale formatting', () => {
    it('should format with en-US locale (comma thousands, dot decimal)', () => {
      expect(formatBalance('1234.56', { locale: 'en-US' })).toBe('1,234.56')
      expect(formatBalance('1234567.89', { locale: 'en-US' })).toBe(
        '1,234,567.89'
      )
    })

    it('should format with de-DE locale (dot thousands, comma decimal)', () => {
      expect(formatBalance('1234.56', { locale: 'de-DE' })).toBe('1.234,56')
      expect(formatBalance('1234567.89', { locale: 'de-DE' })).toBe(
        '1.234.567,89'
      )
    })

    it('should format with fr-FR locale (space thousands, comma decimal)', () => {
      // French uses non-breaking space (U+202F) as thousands separator
      const result = formatBalance('1234.56', { locale: 'fr-FR' })
      expect(result).toMatch(/1[\s\u00A0\u202F]234,56/)
    })

    it('should handle decimals with different locales', () => {
      expect(
        formatBalance('1234.5678', { locale: 'en-US', displayDecimals: 2 })
      ).toBe('1,234.56')
      expect(
        formatBalance('1234.5678', { locale: 'de-DE', displayDecimals: 2 })
      ).toBe('1.234,56')
    })
  })

  describe('symbol support', () => {
    it('should add suffix symbol by default', () => {
      expect(
        formatBalance('123.456', { displayDecimals: 2, symbol: 'ETH' })
      ).toBe('123.45 ETH') // floor mode: 123.456 → 123.45
      expect(
        formatBalance('1234.56', { displayDecimals: 2, symbol: 'USDC' })
      ).toBe('1,234.56 USDC')
    })

    it('should add prefix symbol when specified', () => {
      expect(
        formatBalance('123.456', {
          displayDecimals: 2,
          symbol: '$',
          symbolPosition: 'prefix',
        })
      ).toBe('$123.45') // floor mode: 123.456 → 123.45
      expect(
        formatBalance('1234.56', {
          displayDecimals: 2,
          symbol: '€',
          symbolPosition: 'prefix',
        })
      ).toBe('€1,234.56')
    })

    it('should add suffix symbol when explicitly specified', () => {
      expect(
        formatBalance('123.456', {
          displayDecimals: 2,
          symbol: 'BTC',
          symbolPosition: 'suffix',
        })
      ).toBe('123.45 BTC') // floor mode: 123.456 → 123.45
    })

    it('should respect explicit prefix position', () => {
      // Explicit prefix for $
      const us = formatBalance('1234.56', {
        displayDecimals: 2,
        locale: 'en-US',
        symbol: '$',
        symbolPosition: 'prefix',
      })
      expect(us).toBe('$1,234.56')

      // Explicit prefix for € with German locale
      const de = formatBalance('1234.56', {
        displayDecimals: 2,
        locale: 'de-DE',
        symbol: '€',
        symbolPosition: 'prefix',
      })
      expect(de).toMatch(/€1\.234,56/)
    })

    it('should respect explicit suffix position', () => {
      // Explicit suffix for $ (unusual but valid)
      expect(
        formatBalance('1234.56', {
          displayDecimals: 2,
          locale: 'en-US',
          symbol: '$',
          symbolPosition: 'suffix',
        })
      ).toBe('1,234.56 $')
    })
  })

  describe('combined locale and symbol', () => {
    it('should format US dollars correctly', () => {
      expect(
        formatBalance('1234.5678', {
          displayDecimals: 2,
          locale: 'en-US',
          symbol: '$',
          symbolPosition: 'prefix',
        })
      ).toBe('$1,234.56') // floor mode: 1234.5678 → 1234.56
    })

    it('should format German Euros correctly', () => {
      const result = formatBalance('1234.5678', {
        displayDecimals: 2,
        locale: 'de-DE',
        symbol: '€',
      })
      expect(result).toMatch(/1\.234,56\s*€/) // floor mode: 1234.5678 → 1234.56
    })

    it('should format crypto tokens with custom locale', () => {
      expect(
        formatBalance('123.456789', {
          displayDecimals: 4,
          locale: 'de-DE',
          symbol: 'ETH',
          symbolPosition: 'suffix',
        })
      ).toBe('123,4567 ETH') // floor mode: 123.456789 → 123.4567
    })
  })

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatBalance('0', { displayDecimals: 2 })).toBe('0.00')
      expect(formatBalance('0', { displayDecimals: 2, symbol: 'ETH' })).toBe(
        '0.00 ETH'
      )
    })

    it('should handle very large numbers', () => {
      expect(formatBalance('999999999.99', { displayDecimals: 2 })).toBe(
        '999,999,999.99'
      )
    })

    it('should handle very small numbers', () => {
      expect(
        formatBalance('0.000000000000123456', { displayDecimals: 18 })
      ).toBe('0.000000000000123456')
    })

    it('should handle integer amounts', () => {
      expect(formatBalance('1000', { displayDecimals: 0 })).toBe('1,000')
      expect(
        formatBalance('1000', { displayDecimals: 0, symbol: 'tokens' })
      ).toBe('1,000 tokens')
    })

    it('should reject empty input', () => {
      expect(() => formatBalance('')).toThrow(ERR_EMPTY_INPUT)
      expect(() => formatBalance('   ')).toThrow(ERR_EMPTY_INPUT)
    })
  })

  describe('real-world usage scenarios', () => {
    it('should format wallet balance display', () => {
      expect(
        formatBalance('1234.56789012345', {
          displayDecimals: 4,
          symbol: 'ETH',
        })
      ).toBe('1,234.5678 ETH') // floor mode
    })

    it('should format USD equivalent', () => {
      expect(
        formatBalance('3567.89', {
          displayDecimals: 2,
          locale: 'en-US',
          symbol: '$',
          symbolPosition: 'prefix',
          mode: 'round',
        })
      ).toBe('$3,567.89')
    })

    it('should format token prices', () => {
      expect(
        formatBalance('0.00234567', {
          displayDecimals: 6,
          symbol: 'ETH',
        })
      ).toBe('0.002345 ETH') // floor mode
    })

    it('should format transaction amounts conservatively', () => {
      // Use floor mode for "you will send" display
      expect(
        formatBalance('999.999', {
          displayDecimals: 2,
          mode: 'floor',
          symbol: 'USDC',
        })
      ).toBe('999.99 USDC')
    })

    it('should format portfolio totals', () => {
      expect(
        formatBalance('12345.6789', {
          displayDecimals: 2,
          locale: 'en-US',
          symbol: '$',
          symbolPosition: 'prefix',
          mode: 'round',
        })
      ).toBe('$12,345.68')
    })

    it('should format different tokens with same locale', () => {
      const balance = '1234.56789'

      expect(
        formatBalance(balance, {
          displayDecimals: 2,
          locale: 'de-DE',
          symbol: 'BTC',
          symbolPosition: 'suffix',
        })
      ).toBe('1.234,56 BTC') // floor mode
      expect(
        formatBalance(balance, {
          displayDecimals: 4,
          locale: 'de-DE',
          symbol: 'ETH',
          symbolPosition: 'suffix',
        })
      ).toBe('1.234,5678 ETH') // floor mode
    })
  })

  describe('integration with fromPlanck', () => {
    it('should format fromPlanck output as balance', () => {
      // Simulate: fromPlanck(1_236_789_000_000_000_000n, 18) → "1.236789"
      const fromPlanckOutput = '1.236789'

      expect(
        formatBalance(fromPlanckOutput, {
          displayDecimals: 4,
          symbol: 'ETH',
        })
      ).toBe('1.2367 ETH') // floor mode
    })

    it('should handle full precision token amounts', () => {
      const highPrecision = '123.456789012345678901'

      expect(
        formatBalance(highPrecision, {
          displayDecimals: 6,
          locale: 'en-US',
          symbol: 'TOK',
        })
      ).toBe('123.456789 TOK')
    })
  })
})
