// fromPlanck.ts
import {
  ERR_DECIMALS_RANGE,
  ERR_DECIMALS_TOO_LARGE,
  ERR_NEGATIVE_NOT_SUPPORTED,
  MAX_DECIMALS,
} from './config'

export type FromPlanckOptions = {
  fixed?: boolean
}

/**
 * Convert a scaled bigint (plancks) back to a decimal string.
 *
 * Example with decimals = 18:
 *  0n                      -> "0"
 *  1_000000000000000000n   -> "1"
 *  123_450000000000000000n -> "123.45"
 *  1n                      -> "0.000000000000000001"
 *
 * Rules:
 *  - No negatives
 *  - String manipulation only (no floats)
 *  - When fixed = false (default):
 *      - Trim trailing zeros in fractional part
 *      - Remove decimal point if fractional part is empty
 *  - When fixed = true:
 *      - Always output exactly `decimals` fractional digits
 */
export function fromPlanck(
  value: bigint,
  decimals = 18,
  options: FromPlanckOptions = {}
): string {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(ERR_DECIMALS_RANGE)
  }

  if (decimals > MAX_DECIMALS) {
    throw new RangeError(ERR_DECIMALS_TOO_LARGE)
  }

  if (value < 0n) {
    throw new Error(ERR_NEGATIVE_NOT_SUPPORTED)
  }

  const { fixed = false } = options
  const str = value.toString()

  if (decimals === 0) {
    return str
  }

  const len = str.length

  // value < 1.0
  if (len <= decimals) {
    const padded = str.padStart(decimals, '0')
    const intPart = '0'
    let fracPart = padded

    if (!fixed) {
      fracPart = fracPart.replace(/0+$/, '')
      if (fracPart === '') {
        return intPart
      }
    }

    if (fixed && fracPart.length < decimals) {
      fracPart = fracPart.padEnd(decimals, '0')
    }

    return `${intPart}.${fracPart}`
  }

  // value >= 1.0
  let intPart = str.slice(0, len - decimals)
  let fracPart = str.slice(len - decimals)

  intPart = intPart.replace(/^0+/, '') || '0'

  if (!fixed) {
    fracPart = fracPart.replace(/0+$/, '')
    if (fracPart === '') {
      return intPart
    }
    return `${intPart}.${fracPart}`
  }

  // fixed = true, keep all decimals (already exactly `decimals` digits)
  return `${intPart}.${fracPart}`
}
