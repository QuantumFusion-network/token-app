// toPlanck.ts
import {
  ERR_DECIMALS_RANGE,
  ERR_DECIMALS_TOO_LARGE,
  ERR_EMPTY_INPUT,
  ERR_INVALID_DECIMAL,
  ERR_INVALID_FRAC_PART,
  ERR_INVALID_INT_PART,
  ERR_NEGATIVE_NOT_SUPPORTED,
  MAX_DECIMALS,
} from './config'

type ParsedDecimal = {
  intPart: string // no sign, no leading zeros except "0"
  fracPart: string // raw fractional digits (can be empty)
}

function parseUnsignedDecimal(input: string): ParsedDecimal {
  const raw = input.trim()

  if (raw.length === 0) {
    throw new Error(ERR_EMPTY_INPUT)
  }

  if (raw.includes('-')) {
    throw new Error(ERR_NEGATIVE_NOT_SUPPORTED)
  }

  if (raw.includes('+') || /[eE]/.test(raw)) {
    throw new Error(`${ERR_INVALID_DECIMAL}: "${input}"`)
  }

  // Check for any digit in the raw input before normalization
  if (!/[0-9]/.test(raw)) {
    throw new Error(`${ERR_INVALID_DECIMAL}: "${input}"`)
  }

  // Allow numeric separators like "10_999.5" or "0.000_001"
  // But underscores must be between digits, not at start/end or around decimal point
  if (/_\./.test(raw) || /\._/.test(raw) || /^_/.test(raw) || /_$/.test(raw)) {
    throw new Error(`${ERR_INVALID_DECIMAL}: "${input}"`)
  }

  const normalizedRaw = raw.replace(/_/g, '')

  const parts = normalizedRaw.split('.')
  if (parts.length > 2) {
    throw new Error(`${ERR_INVALID_DECIMAL}: "${input}"`)
  }

  // eslint-disable-next-line prefer-const
  let [intPart, fracPart = ''] = parts

  if (intPart === '') {
    intPart = '0'
  }

  if (!/^\d+$/.test(intPart)) {
    throw new Error(`${ERR_INVALID_INT_PART}: "${input}"`)
  }

  if (fracPart !== '' && !/^\d+$/.test(fracPart)) {
    throw new Error(`${ERR_INVALID_FRAC_PART}: "${input}"`)
  }

  intPart = intPart.replace(/^0+/, '') || '0'

  return { intPart, fracPart }
}

/**
 * Convert a decimal string to a scaled bigint.
 *
 * - No negatives
 * - No exponent notation
 * - Allows "_" as a numeric separator (e.g. "1_000.25")
 * - Extra fractional digits are silently truncated
 * - Leading and trailing zeros are handled cleanly
 */
export function toPlanck(input: string, decimals = 18): bigint {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(ERR_DECIMALS_RANGE)
  }

  if (decimals > MAX_DECIMALS) {
    throw new RangeError(ERR_DECIMALS_TOO_LARGE)
  }

  const { intPart, fracPart } = parseUnsignedDecimal(input)

  if (decimals === 0) {
    const normalized = intPart.replace(/^0+/, '') || '0'
    return BigInt(normalized)
  }

  let frac = fracPart

  if (frac.length > decimals) {
    // Truncate, do not round
    frac = frac.slice(0, decimals)
  } else {
    frac = frac.padEnd(decimals, '0')
  }

  const combined = (intPart === '0' ? '' : intPart) + frac
  const normalized = combined.replace(/^0+/, '') || '0'

  return BigInt(normalized)
}
