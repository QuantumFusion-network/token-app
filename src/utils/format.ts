/**
 * Format token amounts from raw units to decimal representation
 */
export function formatUnits(value: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals)
  const quotient = value / divisor
  const remainder = value % divisor

  if (remainder === 0n) {
    return quotient.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmedRemainder = remainderStr.replace(/0+$/, '')

  return `${quotient}.${trimmedRemainder}`
}

/**
 * Parse token amounts from decimal representation to raw units
 */
export function parseUnits(value: string, decimals: number): bigint {
  const [integer, decimal = ''] = value.split('.')
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(integer + paddedDecimal)
}
