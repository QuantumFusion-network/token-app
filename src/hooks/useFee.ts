import { useDeferredValue, useEffect, useState } from 'react'
import type { Transaction } from 'polkadot-api'

interface FeeState {
  fee: bigint | null
  isCalculating: boolean
  error: string | null
}

/**
 * Estimates transaction fees in real-time with debouncing
 *
 * Uses React 19's useDeferredValue to debounce fee calculation
 * by 500ms, preventing excessive API calls during form input.
 *
 * @param transaction - polkadot-api transaction object
 * @param address - Signer address for fee calculation
 * @returns FeeState with fee amount, loading state, and error
 */
export const useFee = (
  transaction: Transaction<object, string, string, unknown> | null,
  address: string | undefined
): FeeState => {
  const [feeState, setFeeState] = useState<FeeState>({
    fee: null,
    isCalculating: false,
    error: null,
  })

  // Debounce transaction changes by 500ms
  const deferredTransaction = useDeferredValue(transaction)

  useEffect(() => {
    if (!deferredTransaction || !address) {
      setFeeState({ fee: null, isCalculating: false, error: null })
      return
    }

    let cancelled = false
    setFeeState({ fee: null, isCalculating: true, error: null })

    deferredTransaction
      .getPaymentInfo(address, { at: 'best' })
      .then((info) => {
        if (!cancelled) {
          setFeeState({
            fee: info.partial_fee,
            isCalculating: false,
            error: null,
          })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setFeeState({
            fee: null,
            isCalculating: false,
            error: error instanceof Error ? error.message : 'Failed to estimate fee',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [deferredTransaction, address])

  return feeState
}
