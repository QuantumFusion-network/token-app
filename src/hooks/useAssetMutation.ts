import type { Transaction } from 'polkadot-api'

import type { ToastConfig } from '@/lib/toastConfigs'
import { useMutation, type QueryClient } from '@tanstack/react-query'

import { useTransaction } from './useTransaction'
import { useWalletContext } from './useWalletContext'

interface AssetMutationConfig<TParams> {
  params: TParams
  operationFn: (params: TParams) => Transaction<object, string, string, unknown>
  toastConfig: ToastConfig<TParams>
  onSuccess?: (queryClient: QueryClient) => void | Promise<void>
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
      ? (() => {
          try {
            return operationFn(params)
          } catch {
            return null
          }
        })()
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
    onSuccess: async (_data, _variables, context) => {
      if (onSuccess) {
        const queryClient = (context as { queryClient: QueryClient })
          .queryClient
        await onSuccess(queryClient)
      }
    },
  })

  return {
    mutation,
    transaction,
  }
}
