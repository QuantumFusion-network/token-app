import type { Transaction } from 'polkadot-api'
import { useMutation } from '@tanstack/react-query'
import type { ToastConfig } from '@/lib/toastConfigs'
import { useTransaction } from './useTransaction'
import { useWalletContext } from './useWalletContext'

interface AssetMutationConfig<TParams> {
  params: TParams
  operationFn: (
    params: TParams
  ) => Transaction<object, string, string, unknown>
  toastConfig: ToastConfig<TParams>
  onSuccess?: () => void | Promise<void>
  transactionKey: string
  isValid?: (params: TParams) => boolean
}

/**
 * Generic hook for asset mutations with transaction lifecycle tracking
 *
 * Handles the complete flow:
 * 1. Validates params (optional)
 * 2. Builds transaction reactively (for fee estimation)
 * 3. Executes transaction with tracking
 * 4. Calls onSuccess callback
 *
 * @param config - Mutation configuration
 * @returns mutation object and current transaction
 */
export const useAssetMutation = <TParams>({
  params,
  operationFn,
  toastConfig,
  onSuccess,
  transactionKey,
  isValid,
}: AssetMutationConfig<TParams>) => {
  const { selectedAccount } = useWalletContext()
  const { executeTransaction } = useTransaction<TParams>(toastConfig)

  // Build transaction from current params (reactive for fee estimation)
  const transaction =
    selectedAccount && (!isValid || isValid(params))
      ? operationFn(params)
      : null

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount || !transaction) {
        throw new Error('No account selected or transaction not available')
      }

      const observable = transaction.signSubmitAndWatch(
        selectedAccount.polkadotSigner
      )
      await executeTransaction(transactionKey, observable, params)
    },
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess()
      }
    },
  })

  return { mutation, transaction }
}
