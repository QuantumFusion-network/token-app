import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

interface TransactionReviewProps {
  params: unknown
  title?: string
}

/**
 * Collapsible JSON preview of transaction parameters
 *
 * Displays transaction details in a formatted, expandable view.
 * Useful for reviewing parameters before submission.
 */
export const TransactionReview = ({
  params,
  title = 'Transaction Details',
}: TransactionReviewProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          {isOpen ? 'Hide' : 'Show'} {title}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}
