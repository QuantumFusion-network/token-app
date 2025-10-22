import { FileJson } from 'lucide-react'

interface TransactionReviewProps {
  data: Record<string, unknown>
  variant?: 'default' | 'destructive'
}

export function TransactionReview({
  data,
  variant = 'default',
}: TransactionReviewProps) {
  // Filter out empty values for cleaner JSON display
  const cleanedData = Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, unknown>
  )

  const hasData = Object.keys(cleanedData).length > 0
  const jsonString = hasData ? JSON.stringify(cleanedData, null, 2) : ''

  const borderColor =
    variant === 'destructive' ? 'border-destructive/30' : 'border-border/40'
  const iconColor =
    variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="lg:sticky lg:top-4">
      <div className={`bg-muted/30 rounded-lg border p-3 ${borderColor}`}>
        <div className="mb-2 flex items-center gap-2">
          <FileJson className={`h-4 w-4 ${iconColor}`} />
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Transaction Details
          </span>
        </div>
        {!hasData ? (
          <div className="text-muted-foreground/60 py-6 text-center">
            <p className="text-xs">Fill form to see preview</p>
          </div>
        ) : (
          <pre className="text-foreground overflow-x-auto font-mono text-xs break-all whitespace-pre-wrap">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  )
}
