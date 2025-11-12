import { Badge } from '@/components/ui/badge'
import { formatFee } from '@/lib/utils'

interface FeeDisplayProps {
  fee: bigint | null
  isCalculating: boolean
  error: string | null
}

/**
 * Displays transaction fee with loading and error states
 *
 * Shows:
 * - Loading state while calculating
 * - Error message if calculation fails
 * - Formatted fee amount when available
 */
export const FeeDisplay = ({
  fee,
  isCalculating,
  error,
}: FeeDisplayProps) => {
  if (isCalculating) {
    return <Badge variant="secondary">Calculating fee...</Badge>
  }

  if (error) {
    return <Badge variant="destructive">Fee estimate failed</Badge>
  }

  if (fee === null) {
    return <Badge variant="outline">No fee estimate</Badge>
  }

  return (
    <Badge variant="outline">
      Estimated fee: {formatFee(fee)} QFN
    </Badge>
  )
}
