import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { FeeDisplay } from './FeeDisplay'

interface TransactionFormFooterProps {
  fee: bigint | null
  isCalculating: boolean
  feeError: string | null
  onSubmit: (e: FormEvent) => void
  submitLabel: string
  disabled?: boolean
}

/**
 * Shared footer for transaction forms
 *
 * Combines:
 * - Fee display with loading/error states
 * - Submit button with disabled state
 *
 * Provides consistent UX across all transaction forms.
 */
export const TransactionFormFooter = ({
  fee,
  isCalculating,
  feeError,
  onSubmit,
  submitLabel,
  disabled = false,
}: TransactionFormFooterProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <FeeDisplay fee={fee} isCalculating={isCalculating} error={feeError} />
      <Button type="submit" onClick={onSubmit} disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  )
}
