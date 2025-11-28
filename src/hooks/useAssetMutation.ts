import type { Transaction } from 'polkadot-api'

import type { ToastConfig } from '@/components/asset-management/toastConfigs'
import { useMutation } from '@tanstack/react-query'

import { useWalletContext } from '@/contexts'
import { useTransaction } from './useTransaction'

interface AssetMutationConfig<TParams> {
  params: TParams
  operationFn: (params: TParams) => Transaction<object, string, string, unknown>
  toastConfig: ToastConfig<TParams>
  onSuccess?: () => void | Promise<void>
  transactionKey: string
  isValid?: (params: TParams) => boolean
}

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

  // Build transaction from current params
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

  return {
    mutation,
    transaction,
  }
}
