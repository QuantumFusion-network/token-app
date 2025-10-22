export const formatFee = (fee: bigint): string => {
  // QF Network uses 12 decimals
  const decimals = 12
  const divisor = 10n ** BigInt(decimals)
  const whole = fee / divisor
  const fraction = fee % divisor

  // Format with up to 4 significant decimal places
  const fractionStr = fraction.toString().padStart(decimals, '0')
  const trimmed = fractionStr.replace(/0+$/, '').slice(0, 4)

  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}
