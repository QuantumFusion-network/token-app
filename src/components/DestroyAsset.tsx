import { useState, type FormEvent } from 'react'

import { AlertTriangle, Trash } from 'lucide-react'

import {
  AccountDashboard,
  FeatureErrorBoundary,
  MutationError,
  TransactionFormFooter,
  TransactionReview,
} from '@/components'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'
import {
  useAssetMutation,
  useConnectionContext,
  useFee,
  useWalletContext,
} from '@/hooks'
import {
  destroyAssetBatch,
  destroyAssetToasts,
  invalidateAssetQueries,
  type DestroyAssetParams,
} from '@/lib'
import { useQueryClient } from '@tanstack/react-query'

function DestroyAssetInner() {
  const { selectedAccount } = useWalletContext()
  const { isConnected, api } = useConnectionContext()
  const queryClient = useQueryClient()
  const [showConfirmation, setShowConfirmation] = useState(false)

  const [formData, setFormData] = useState<DestroyAssetParams>({
    assetId: '',
  })

  const { mutation: destroyAssetMutation, transaction } =
    useAssetMutation<DestroyAssetParams>({
      params: formData,
      operationFn: (params) => {
        console.log('operationFn')
        return destroyAssetBatch(api, params)
      },
      toastConfig: destroyAssetToasts,
      transactionKey: 'destroyAsset',
      isValid: (params) =>
        params.assetId !== '' && !isNaN(parseInt(params.assetId)),
      onSuccess: async () => {
        await invalidateAssetQueries(queryClient)
        // Reset form
        setFormData({
          assetId: '',
        })
        setShowConfirmation(false)
      },
    })

  const feeState = useFee(transaction, selectedAccount?.address)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleConfirmDestroy = () => {
    destroyAssetMutation.mutate()
  }

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>
  }

  const reviewData = {
    assetId: formData.assetId,
  }

  if (showConfirmation) {
    return (
      <div>
        <AccountDashboard />
        <div className="mx-auto max-w-3xl">
          <Card className="border-destructive/30 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Confirm Asset Destruction</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                This action cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="mb-2 font-medium text-red-800">
                  You are about to permanently destroy:
                </p>
                <div className="mb-2 rounded bg-white p-3">
                  <p>
                    <strong>Asset ID:</strong> {formData.assetId}
                  </p>
                </div>
                <p className="text-sm text-red-700">
                  <strong>This action cannot be undone.</strong> The asset will
                  be permanently removed from the blockchain, and all associated
                  tokens will be destroyed.
                </p>
              </div>

              <MutationError error={destroyAssetMutation.error} />

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleConfirmDestroy}
                  disabled={!isConnected || destroyAssetMutation.isPending}
                  className="flex-1"
                >
                  {destroyAssetMutation.isPending
                    ? 'Destroying Asset...'
                    : 'Yes, Destroy Asset'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={destroyAssetMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AccountDashboard />
      <div className="mb-4 flex items-center gap-4">
        <Trash className="text-foreground h-5 w-5" />
        <h1 className="text-foreground text-2xl leading-tight font-bold">
          Destroy Asset
        </h1>
      </div>
      <Card className="gap-8 shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Form Fields - 2 columns */}
              <div className="space-y-4 lg:col-span-2">
                <div className="bg-muted/50 border-muted/50 rounded-lg border p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-muted-foreground text-sm">
                      <strong>Warning:</strong> Asset destruction is permanent
                      and irreversible. The chain will reject the transaction if
                      you don't own the asset.
                    </p>
                  </div>
                </div>

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
                    min="0"
                    placeholder="Enter asset ID to destroy"
                    className="h-12"
                  />
                </div>

                <MutationError error={destroyAssetMutation.error} />
              </div>

              {/* Review Column - 1 column */}
              <div className="lg:col-span-1">
                <TransactionReview data={reviewData} variant="destructive" />
              </div>
            </div>

            {/* Fee + CTA Section */}
            <TransactionFormFooter
              feeState={feeState}
              isDisabled={
                !isConnected ||
                !formData.assetId ||
                destroyAssetMutation.isPending
              }
              isPending={destroyAssetMutation.isPending}
              variant="destructive"
              actionText="Destroy Asset"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function DestroyAsset() {
  return (
    <FeatureErrorBoundary featureName="Destroy Asset">
      <DestroyAssetInner />
    </FeatureErrorBoundary>
  )
}
