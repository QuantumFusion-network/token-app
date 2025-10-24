import { useState } from 'react'

import { ChevronDown } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui'
import type { TransactionError } from '@/lib/transactionErrors'

interface MutationErrorProps {
  error?: Error | null
}

/**
 * Type guard to check if error is a TransactionError
 */
function isTransactionError(error: Error): error is TransactionError {
  return (
    'code' in error &&
    'userMessage' in error &&
    'technicalDetails' in error &&
    'context' in error
  )
}

/**
 * Nested collapsible component for displaying stack traces
 */
function StackTraceCollapsible({ stack }: { stack: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded py-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="text-destructive/70 hover:text-destructive/90 bg-destructive/10 hover:bg-destructive/15 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors">
          <ChevronDown
            className={`size-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
          Stack Trace
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <pre className="bg-destructive/20 overflow-x-auto rounded p-2 text-[10px] break-words whitespace-pre-wrap">
            {stack}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function MutationError({ error }: MutationErrorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!error) return null

  const isTypedError = isTransactionError(error)

  return (
    <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
      {/* User-friendly message */}
      <div className="mb-2">
        {isTypedError ? error.userMessage : error.message}
      </div>

      {/* Collapsible technical details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="text-destructive/80 hover:text-destructive flex items-center gap-1.5 text-xs transition-colors">
          <ChevronDown
            className={`size-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
          Details
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 text-xs">
          {isTypedError ? (
            <>
              {/* Error Code */}
              {error.code && (
                <div>
                  <span className="font-medium">Error Code:</span>{' '}
                  <code className="bg-destructive/20 rounded px-1.5 py-0.5">
                    {error.code}
                  </code>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <span className="font-medium">Details:</span>{' '}
                {error.technicalDetails}
              </div>

              {/* Context Information */}
              {error.context && Object.keys(error.context).length > 0 && (
                <div>
                  <div className="mb-1 font-medium">Context:</div>
                  <div className="bg-destructive/20 space-y-1 rounded p-2 font-mono">
                    {error.context.transactionType && (
                      <div>Type: {error.context.transactionType}</div>
                    )}
                    {error.context.transactionId && (
                      <div>ID: {error.context.transactionId}</div>
                    )}
                    {error.context.txHash && (
                      <div>
                        Tx Hash:{' '}
                        <span className="break-all">
                          {error.context.txHash}
                        </span>
                      </div>
                    )}
                    {error.context.blockHash && (
                      <div>
                        Block Hash:{' '}
                        <span className="break-all">
                          {error.context.blockHash}
                        </span>
                      </div>
                    )}
                    {error.context.details !== undefined && (
                      <div className="space-y-1">
                        <div>Details:</div>
                        <pre className="bg-destructive/30 overflow-x-auto rounded p-1.5 text-[10px] break-words whitespace-pre-wrap">
                          {typeof error.context.details === 'object' &&
                          error.context.details !== null
                            ? JSON.stringify(error.context.details, null, 2)
                            : JSON.stringify(error.context.details)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nested Stack Trace */}
              {error.stack && <StackTraceCollapsible stack={error.stack} />}
            </>
          ) : (
            <>
              {/* Legacy Error fallback */}
              <div>
                <span className="font-medium">Error Name:</span>{' '}
                <code className="bg-destructive/20 rounded px-1.5 py-0.5">
                  {error.name}
                </code>
              </div>
              <div>
                <span className="font-medium">Message:</span> {error.message}
              </div>

              {/* Nested Stack Trace */}
              {error.stack && <StackTraceCollapsible stack={error.stack} />}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
