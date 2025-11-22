// format.test.ts
import { describe, expect, it } from 'vitest'

import { ERR_EMPTY_INPUT } from './config'
import { formatBalance } from './format'

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
        formatBalance('123.456', { displayDecimals: 2, symbol: 'QF' })
      ).toBe('123.45 QF') // floor mode: 123.456 → 123.45
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
          symbol: 'QF',
          symbolPosition: 'suffix',
        })
      ).toBe('123,4567 QF') // floor mode: 123.456789 → 123.4567
    })
  })

  describe('trailing zeros removal', () => {
    it('should remove trailing zeros with high displayDecimals', () => {
      // Common case: token with 18 decimals but clean value
      expect(formatBalance('234.234', { displayDecimals: 18 })).toBe('234.234')
      expect(formatBalance('123.456', { displayDecimals: 18 })).toBe('123.456')
    })

    it('should remove trailing zeros from fromPlanck output', () => {
      // These match the user's reported cases
      // 234234000000000000n with 18 decimals = 234.234
      expect(
        formatBalance('234.234000000000000000', { displayDecimals: 18 })
      ).toBe('234.234')

      // 123456000000000000000n with 18 decimals = 123.456
      expect(
        formatBalance('123.456000000000000000', { displayDecimals: 18 })
      ).toBe('123.456')
    })

    it('should remove all trailing zeros including after decimal point', () => {
      expect(formatBalance('1000.000', { displayDecimals: 3 })).toBe('1,000')
      expect(formatBalance('42.100', { displayDecimals: 3 })).toBe('42.1')
      expect(formatBalance('5.500', { displayDecimals: 3 })).toBe('5.5')
    })

    it('should preserve significant zeros', () => {
      expect(formatBalance('100.01', { displayDecimals: 2 })).toBe('100.01')
      expect(formatBalance('0.01', { displayDecimals: 2 })).toBe('0.01')
      expect(formatBalance('10.10', { displayDecimals: 2 })).toBe('10.1')
    })

    it('should work with symbols', () => {
      expect(
        formatBalance('234.234000000000000000', {
          displayDecimals: 18,
          symbol: 'QF',
        })
      ).toBe('234.234 QF')

      expect(
        formatBalance('1000.000', {
          displayDecimals: 6,
          symbol: 'USDC',
        })
      ).toBe('1,000 USDC')
    })
  })

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatBalance('0', { displayDecimals: 2 })).toBe('0')
      expect(formatBalance('0', { displayDecimals: 2, symbol: 'QF' })).toBe(
        '0 QF'
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
          symbol: 'QF',
        })
      ).toBe('1,234.5678 QF') // floor mode
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
          symbol: 'QF',
        })
      ).toBe('0.002345 QF') // floor mode
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
          symbol: 'QF',
          symbolPosition: 'suffix',
        })
      ).toBe('1.234,5678 QF') // floor mode
    })
  })

  describe('integration with fromPlanck', () => {
    it('should format fromPlanck output as balance', () => {
      // Simulate: fromPlanck(1_236_789_000_000_000_000n, 18) → "1.236789"
      const fromPlanckOutput = '1.236789'

      expect(
        formatBalance(fromPlanckOutput, {
          displayDecimals: 4,
          symbol: 'QF',
        })
      ).toBe('1.2367 QF') // floor mode
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
