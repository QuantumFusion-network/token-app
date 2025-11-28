import { ArrowRight } from 'lucide-react'

import { FeeDisplay } from '@/components'
import { Button } from '@/components/ui'

interface TransactionFormFooterProps {
  feeState: {
    fee: string | null
    isLoading: boolean
    error: Error | null
  }
  isDisabled: boolean
  isPending: boolean
  variant?: 'default' | 'destructive'
  actionText: string
}

export const TransactionFormFooter = ({
  feeState,
  isDisabled,
  isPending,
  variant = 'default',
  actionText,
}: TransactionFormFooterProps) => {
  const borderClass =
    variant === 'destructive' ? 'border-destructive/20' : 'border-t'

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 pt-4 lg:flex-row ${borderClass}`}
    >
      <FeeDisplay {...feeState} variant={variant} />
      <Button
        type="submit"
        variant={variant}
        size="lg"
        disabled={isDisabled}
        className="ml-auto w-full lg:w-auto"
      >
        {isPending ? 'Processing...' : actionText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
