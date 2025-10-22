import { AlertCircle } from 'lucide-react'

import { Badge } from './ui/badge'

interface FeeDisplayProps {
  fee: string | null
  isLoading: boolean
  error: Error | null
  variant?: 'default' | 'destructive'
}

export const FeeDisplay = ({
  fee,
  isLoading,
  error,
  variant = 'default',
}: FeeDisplayProps) => {
  const borderClass = variant === 'destructive' ? 'border-destructive/30' : ''

  // Hide completely when form is empty (no fee, not loading, no error)
  if (!isLoading && !error && !fee) {
    return null
  }

  const renderBadge = () => {
    if (isLoading) {
      return (
        <Badge
          variant="outline"
          className={`font-mono text-base font-semibold ${borderClass}`}
        >
          Calculating...
        </Badge>
      )
    }

    if (error) {
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 border-yellow-500 font-mono text-base font-semibold text-yellow-700"
        >
          <AlertCircle className="h-3 w-3" />
          Unable to estimate
        </Badge>
      )
    }

    if (fee) {
      return (
        <Badge
          variant="outline"
          className={`font-mono text-base font-semibold ${borderClass}`}
        >
          {fee} QF
        </Badge>
      )
    }

    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Estimated Fee:</span>
      {renderBadge()}
    </div>
  )
}
