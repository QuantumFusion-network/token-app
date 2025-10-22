import { useDeferredValue, useEffect, useState } from 'react'

import type { Transaction } from 'polkadot-api'

import { formatFee } from '@/lib'

export const useFee = (
  transaction: Transaction<object, string, string, unknown> | null,
  signerAddress: string | undefined
) => {
  const [fee, setFee] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Debounce transaction changes by 500ms
  const deferredTransaction = useDeferredValue(transaction)

  useEffect(() => {
    if (!deferredTransaction || !signerAddress) {
      setFee(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    deferredTransaction
      .getPaymentInfo(signerAddress, { at: 'best' })
      .then((paymentInfo) => {
        if (!cancelled) {
          setFee(formatFee(paymentInfo.partial_fee))
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [deferredTransaction, signerAddress])

  return { fee, isLoading, error }
}
