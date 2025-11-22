// format.ts
import { ERR_EMPTY_INPUT, ERR_DECIMALS_RANGE } from './config'

/**
 * Rounding mode for display formatting
 * - 'floor': Always round down (safest, never overstates value)
 * - 'round': Standard rounding (0.5 rounds up)
 * - 'ceil': Always round up
 */
export type RoundingMode = 'floor' | 'round' | 'ceil'

export interface FormatOptions {
  /**
   * Number of decimal places to show in output
   * If undefined, shows all decimals from input
   */
  displayDecimals?: number

  /**
   * How to handle truncation when displayDecimals < input decimals
   * Default: 'floor' (safest - never overstates the value)
   */
  mode?: RoundingMode

  /**
   * Add thousand separators (1,234.56)
   * Default: false
   */
  useGrouping?: boolean
}

/**
 * Format a decimal string for display with optional rounding.
 *
 * IMPORTANT: This function is LOSSY - use only for display purposes.
 * For calculations, always use the original unrounded value.
 *
 * @example
 * // Basic truncation
 * formatTokenDisplay('1.236789', { displayDecimals: 2 })  // "1.23"
 *
 * @example
 * // Rounding
 * formatTokenDisplay('1.236', { displayDecimals: 2, mode: 'round' })  // "1.24"
 *
 * @example
 * // Padding
 * formatTokenDisplay('1.2', { displayDecimals: 4 })  // "1.2000"
 *
 * @example
 * // Grouping
 * formatTokenDisplay('1234567.89', { displayDecimals: 2, useGrouping: true })  // "1,234,567.89"
 *
 * @param amount - Decimal string to format (e.g., from fromPlanck)
 * @param options - Formatting options
 * @returns Formatted string for display
 */
export function formatTokenDisplay(
  amount: string,
  options: FormatOptions = {}
): string {
  const {
    displayDecimals,
    mode = 'floor',
    useGrouping = false,
  } = options

  // Normalize input: trim whitespace
  const normalized = amount.trim()

  if (normalized === '') {
    throw new Error(ERR_EMPTY_INPUT)
  }

  // Split into integer and fractional parts
  const [intPart = '0', fracPart = ''] = normalized.split('.')

  // If no display decimals specified, return as-is (with optional grouping)
  if (displayDecimals === undefined) {
    if (useGrouping) {
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return fracPart ? `${grouped}.${fracPart}` : grouped
    }
    return normalized
  }

  // Validate displayDecimals
  if (!Number.isInteger(displayDecimals) || displayDecimals < 0) {
    throw new Error(ERR_DECIMALS_RANGE)
  }

  // If we have fewer decimals than requested, pad with zeros
  if (fracPart.length <= displayDecimals) {
    const padded = fracPart.padEnd(displayDecimals, '0')
    const result = displayDecimals === 0 ? intPart : `${intPart}.${padded}`

    if (useGrouping) {
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return displayDecimals === 0 ? grouped : `${grouped}.${padded}`
    }

    return result
  }

  // Need to truncate/round
  const truncated = fracPart.slice(0, displayDecimals)
  const nextDigit = parseInt(fracPart[displayDecimals] || '0', 10)

  let finalInt = BigInt(intPart)
  let finalFrac = BigInt(truncated || '0')

  // Apply rounding mode
  if (mode === 'round' && nextDigit >= 5) {
    finalFrac += 1n
  } else if (mode === 'ceil' && nextDigit > 0) {
    finalFrac += 1n
  }
  // mode === 'floor': do nothing (already truncated)

  // Handle carry-over (e.g., 0.99 rounded to 1 decimal → 1.0)
  const maxFrac = 10n ** BigInt(displayDecimals)
  if (finalFrac >= maxFrac) {
    finalInt += 1n
    finalFrac = 0n
  }

  const intStr = finalInt.toString()
  const fracStr = finalFrac.toString().padStart(displayDecimals, '0')

  const result =
    displayDecimals === 0 ? intStr : `${intStr}.${fracStr}`

  // Apply grouping if requested
  if (useGrouping) {
    const grouped = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return displayDecimals === 0 ? grouped : `${grouped}.${fracStr}`
  }

  return result
}

export interface FormatBalanceOptions {
  /**
   * Number of decimal places to show in output
   * If undefined, shows all decimals from input
   */
  displayDecimals?: number

  /**
   * How to handle truncation when displayDecimals < input decimals
   * Default: 'floor' (safest - never overstates the value)
   */
  mode?: RoundingMode

  /**
   * Locale for number formatting (affects decimal/thousands separators)
   * Examples: 'en-US' (1,234.56), 'de-DE' (1.234,56), 'fr-FR' (1 234,56)
   * Default: 'en-US'
   */
  locale?: string

  /**
   * Symbol to display (e.g., 'ETH', 'USDC', '$', '€')
   * If not provided, no symbol is shown
   */
  symbol?: string

  /**
   * Where to place the symbol relative to the amount
   * - 'prefix': Symbol before amount ($1.23)
   * - 'suffix': Symbol after amount (1.23 ETH)
   * Default: 'suffix'
   */
  symbolPosition?: 'prefix' | 'suffix'
}

/**
 * Format a decimal string as a balance with locale and symbol support.
 *
 * This is an enhanced version of formatTokenDisplay with:
 * - Locale-aware formatting (decimal/thousands separators)
 * - Symbol support (token symbols, currency symbols)
 * - Configurable symbol position (defaults to suffix)
 *
 * @example
 * // US locale with dollar sign (prefix)
 * formatBalance('1234.5678', {
 *   displayDecimals: 2,
 *   locale: 'en-US',
 *   symbol: '$',
 *   symbolPosition: 'prefix'
 * })  // "$1,234.57"
 *
 * @example
 * // German locale with Euro (suffix)
 * formatBalance('1234.5678', {
 *   displayDecimals: 2,
 *   locale: 'de-DE',
 *   symbol: '€'
 * })  // "1.234,57 €"
 *
 * @example
 * // Token balance (suffix by default)
 * formatBalance('123.456789', {
 *   displayDecimals: 4,
 *   symbol: 'ETH'
 * })  // "123.4567 ETH"
 *
 * @param amount - Decimal string to format (e.g., from fromPlanck)
 * @param options - Formatting options
 * @returns Formatted balance string with locale and symbol
 */
export function formatBalance(
  amount: string,
  options: FormatBalanceOptions = {}
): string {
  const {
    displayDecimals,
    mode = 'floor',
    locale = 'en-US',
    symbol,
    symbolPosition,
  } = options

  // First, apply rounding/truncation using formatTokenDisplay
  // This gives us the numeric value formatted correctly
  const formattedNumber = formatTokenDisplay(amount, {
    displayDecimals,
    mode,
    useGrouping: false, // We'll handle grouping via Intl
  })

  // Normalize input: trim whitespace
  const normalized = formattedNumber.trim()

  if (normalized === '') {
    throw new Error(ERR_EMPTY_INPUT)
  }

  // Use Intl.NumberFormat to determine locale-specific formatting
  let localeFormatted: string

  try {
    // Parse the number (safe since formatTokenDisplay validated it)
    const numericValue = parseFloat(normalized)

    // Format the number with locale-specific separators
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      const numberFormatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: displayDecimals ?? 0,
        maximumFractionDigits: displayDecimals ?? 20,
        useGrouping: true,
      })

      localeFormatted = numberFormatter.format(numericValue)
    } else {
      // Fallback if Intl not available
      localeFormatted = normalized
    }
  } catch {
    // Fallback if parsing fails
    localeFormatted = normalized
  }

  // Add symbol if provided
  if (symbol) {
    // Determine position: explicit symbolPosition or default to suffix
    const position = symbolPosition ?? 'suffix'
    if (position === 'prefix') {
      return `${symbol}${localeFormatted}`
    } else {
      return `${localeFormatted} ${symbol}`
    }
  }

  return localeFormatted
}
