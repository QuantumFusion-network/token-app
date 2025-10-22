import { useState, type FormEvent } from 'react'

import { ArrowRight, Coins } from 'lucide-react'

import {
  AccountDashboard,
  FeatureErrorBoundary,
  FeeDisplay,
  TransactionReview,
} from '@/components'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'
import {
  useAssetMutation,
  useConnectionContext,
  useFee,
  useWalletContext,
} from '@/hooks'
import {
  invalidateAssetQueries,
  invalidateBalanceQueries,
  mintTokens,
  mintTokensToasts,
  type MintParams,
} from '@/lib'

const initialFormData = {
  assetId: '',
  recipient: '',
  amount: '',
  decimals: 12,
}

function MintTokensInner() {
  const { selectedAccount } = useWalletContext()
  const { isConnected, api } = useConnectionContext()

  const [formData, setFormData] = useState<MintParams>(initialFormData)

  const { mutation: mintMutation, transaction } = useAssetMutation<MintParams>({
    params: formData,
    operationFn: (params) => mintTokens(api, params),
    toastConfig: mintTokensToasts,
    transactionKey: 'mintTokens',
    isValid: (params) =>
      params.assetId !== '' &&
      !isNaN(parseInt(params.assetId)) &&
      params.recipient !== '' &&
      params.amount !== '' &&
      parseFloat(params.amount) > 0,
    onSuccess: async (queryClient) => {
      invalidateBalanceQueries(queryClient, parseInt(formData.assetId), [
        formData.recipient,
      ])
      await invalidateAssetQueries(queryClient)

      // Reset form
      setFormData({ ...initialFormData })
    },
  })

  const feeState = useFee(transaction, selectedAccount?.address)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mintMutation.mutate()
  }

  if (!selectedAccount) {
    return <div>Please connect your wallet to mint tokens</div>
  }

  const reviewData = {
    assetId: formData.assetId,
    recipient: formData.recipient,
    amount: formData.amount,
  }

  return (
    <div>
      <AccountDashboard />
      <div className="mb-4 flex items-center gap-4">
        <Coins className="text-primary h-5 w-5" />
        <h1 className="text-foreground text-2xl leading-tight font-bold">
          Mint Tokens
        </h1>
      </div>
      <Card className="gap-8 shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Form Fields - 2 columns */}
              <div className="space-y-4 lg:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="assetId">Asset ID</Label>
                  <Input
                    id="assetId"
                    type="number"
                    value={formData.assetId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assetId: e.target.value,
                      }))
                    }
                    required
                    min="1"
                    placeholder="Enter asset ID"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    type="text"
                    value={formData.recipient}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        recipient: e.target.value,
                      }))
                    }
                    className="h-12 font-mono text-sm"
                    required
                    placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Mint</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                    min="0"
                    step="0.000000000001"
                    placeholder="0.0"
                    className="h-12"
                  />
                </div>

                {mintMutation.isError && (
                  <div className="text-destructive-foreground bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
                    {mintMutation.error?.message}
                  </div>
                )}
              </div>

              {/* Review Column - 1 column */}
              <div className="lg:col-span-1">
                <TransactionReview data={reviewData} />
              </div>
            </div>

            {/* Fee + CTA Section */}
            <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 lg:flex-row">
              <FeeDisplay {...feeState} />
              <Button
                type="submit"
                disabled={!isConnected || mintMutation.isPending}
                size="lg"
                className="ml-auto w-full lg:w-auto"
              >
                {mintMutation.isPending ? 'Minting Tokens...' : 'Mint Tokens'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function MintTokens() {
  return (
    <FeatureErrorBoundary featureName="Mint Tokens">
      <MintTokensInner />
    </FeatureErrorBoundary>
  )
}
