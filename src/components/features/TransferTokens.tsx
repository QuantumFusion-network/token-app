import { type FormEvent, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAssetMutation } from '@/hooks/useAssetMutation'
import { useConnectionContext } from '@/hooks/useConnectionContext'
import { useFee } from '@/hooks/useFee'
import { useWalletContext } from '@/hooks/useWalletContext'
import { TransactionFormFooter } from '@/components/shared/TransactionFormFooter'
import { TransactionReview } from '@/components/shared/TransactionReview'
import { FeatureErrorBoundary } from '@/components/error-boundaries'
import { transferTokens, type TransferParams } from '@/lib/assetOperations'
import { transferTokensToasts } from '@/lib/assetToasts'
import { invalidateBalanceQueries } from '@/lib/queryHelpers'

const initialFormData = {
  assetId: '',
  recipient: '',
  amount: '',
  decimals: 12,
}

function TransferTokensInner() {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(initialFormData)

  const params: TransferParams = formData

  const { mutation, transaction } = useAssetMutation<TransferParams>({
    params,
    operationFn: (p) => transferTokens(api!, p),
    toastConfig: transferTokensToasts,
    transactionKey: 'transferTokens',
    isValid: (p) =>
      p.assetId !== '' && p.recipient !== '' && p.amount !== '',
    onSuccess: async () => {
      await invalidateBalanceQueries(queryClient, formData.assetId)
      setFormData(initialFormData)
    },
  })

  const { fee, isCalculating, error: feeError } = useFee(
    transaction,
    selectedAccount?.address
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const isFormValid =
    formData.assetId !== '' &&
    formData.recipient !== '' &&
    formData.amount !== ''

  if (!selectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>
            Please connect your wallet to transfer tokens
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Tokens</CardTitle>
        <CardDescription>
          Transfer tokens to another account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form fields - 2 columns */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid gap-2">
                <Label htmlFor="assetId">Asset ID *</Label>
                <Input
                  id="assetId"
                  type="number"
                  value={formData.assetId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, assetId: e.target.value }))
                  }
                  placeholder="1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient">Recipient Address *</Label>
                <Input
                  id="recipient"
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recipient: e.target.value,
                    }))
                  }
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="100"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={formData.decimals}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      decimals: parseInt(e.target.value) || 12,
                    }))
                  }
                  min="0"
                  max="18"
                />
              </div>
            </div>

            {/* Review - 1 column */}
            <div className="lg:col-span-1">
              <TransactionReview params={params} title="Transfer Parameters" />
            </div>
          </div>

          <TransactionFormFooter
            fee={fee}
            isCalculating={isCalculating}
            feeError={feeError}
            onSubmit={handleSubmit}
            submitLabel="Transfer Tokens"
            disabled={!isFormValid || mutation.isPending}
          />
        </form>
      </CardContent>
    </Card>
  )
}

export function TransferTokens() {
  return (
    <FeatureErrorBoundary featureName="Transfer Tokens">
      <TransferTokensInner />
    </FeatureErrorBoundary>
  )
}
