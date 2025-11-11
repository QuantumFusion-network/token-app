import { useEffect, useRef } from 'react'

import { toast } from 'sonner'

import { useTransactionContext } from '@/hooks'
import { TransactionErrorCode } from '@/lib/transactionErrors'

interface TransactionToastIds {
  signing?: string | number
  broadcasting?: string | number
  inBlock?: string | number
}

export function useTransactionToasts() {
  const { transactions } = useTransactionContext()
  const processedStatusRef = useRef<Record<string, string>>({})
  const toastIdsRef = useRef<Record<string, TransactionToastIds>>({})

  useEffect(() => {
    Object.values(transactions).forEach((transaction) => {
      const { id, status, toastConfig, details } = transaction

      if (!toastConfig) return

      // Only show toast if status has changed for this transaction
      const lastProcessedStatus = processedStatusRef.current[id]
      if (lastProcessedStatus === status.status) return

      // Update the processed status
      processedStatusRef.current[id] = status.status

      // Get or initialize toast IDs for this transaction
      if (!toastIdsRef.current[id]) {
        toastIdsRef.current[id] = {}
      }
      const toastIds = toastIdsRef.current[id]

      switch (status.status) {
        case 'signing':
          if (toastConfig.signing) {
            toastIds.signing = toast.loading(toastConfig.signing, {
              duration: Infinity, // Manual dismiss only
            })
          }
          break

        case 'broadcasting':
          // Dismiss signing toast immediately
          if (toastIds.signing) {
            toast.dismiss(toastIds.signing)
            toastIds.signing = undefined
          }

          if (toastConfig.broadcasting && status.txHash) {
            const message = toastConfig.broadcasting(status.txHash)
            toastIds.broadcasting = toast.info(message, {
              duration: 10000, // 10 seconds
            })
          }
          break

        case 'inBlock':
          // Dismiss signing toast immediately if still present
          if (toastIds.signing) {
            toast.dismiss(toastIds.signing)
            toastIds.signing = undefined
          }

          if (toastConfig.inBlock) {
            toastIds.inBlock = toast.info(toastConfig.inBlock, {
              duration: 10000, // 10 seconds
            })
          }
          break

        case 'finalized': {
          // Dismiss signing toast immediately if still present
          if (toastIds.signing) {
            toast.dismiss(toastIds.signing)
            toastIds.signing = undefined
          }

          const message = toastConfig.finalized(details)
          const toastOptions: {
            duration: number
            action?: {
              label: string
              onClick: () => void
            }
          } = {
            duration: 30000, // 30 seconds
          }

          // Add explorer link action if we have a blockHash
          if (status.blockHash) {
            toastOptions.action = {
              label: 'Details',
              onClick: () =>
                window.open(
                  `https://portal.qfnetwork.xyz/#/explorer/query/${status.blockHash}`,
                  '_blank'
                ),
            }
          }

          toast.success(message, toastOptions)
          break
        }

        case 'error':
          // Dismiss signing toast immediately if still present
          if (toastIds.signing) {
            toast.dismiss(toastIds.signing)
            toastIds.signing = undefined
          }

          if (status.error && toastConfig.error) {
            const error = status.error
            const message = toastConfig.error(error.message)
            const toastOptions: {
              duration: number
              action?: {
                label: string
                onClick: () => void
              }
            } = {
              duration: 30000, // 30 seconds
            }

            // Add explorer link for dispatch errors (transaction was included in block)
            if (
              error.code === TransactionErrorCode.DISPATCH_ERROR &&
              error.context.blockHash
            ) {
              toastOptions.action = {
                label: 'Details',
                onClick: () =>
                  window.open(
                    `https://portal.qfnetwork.xyz/#/explorer/query/${error.context.blockHash}`,
                    '_blank'
                  ),
              }
            }

            toast.error(message, toastOptions)
          }
          break
      }
    })

    // Clean up processed statuses and toast IDs for removed transactions
    const currentTransactionIds = new Set(Object.keys(transactions))
    Object.keys(processedStatusRef.current).forEach((id) => {
      if (!currentTransactionIds.has(id)) {
        delete processedStatusRef.current[id]
        delete toastIdsRef.current[id]
      }
    })
  }, [transactions])

  return null
}
