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
import { Badge } from '@/components/ui/badge'
import { useAssetMutation } from '@/hooks/useAssetMutation'
import { useConnectionContext } from '@/hooks/useConnectionContext'
import { useFee } from '@/hooks/useFee'
import { useWalletContext } from '@/hooks/useWalletContext'
import { TransactionFormFooter } from '@/components/shared/TransactionFormFooter'
import { TransactionReview } from '@/components/shared/TransactionReview'
import { FeatureErrorBoundary } from '@/components/error-boundaries'
import {
  destroyAssetBatch,
  type DestroyAssetParams,
} from '@/lib/assetOperations'
import { destroyAssetToasts } from '@/lib/assetToasts'
import { invalidateAssetQueries } from '@/lib/queryHelpers'

const initialFormData = {
  assetId: '',
  confirmAssetId: '',
}

function DestroyAssetInner() {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(initialFormData)

  const params: DestroyAssetParams = {
    assetId: formData.assetId,
  }

  const { mutation, transaction } = useAssetMutation<DestroyAssetParams>({
    params,
    operationFn: (p) => destroyAssetBatch(api!, p),
    toastConfig: destroyAssetToasts,
    transactionKey: 'destroyAsset',
    isValid: (p) =>
      p.assetId !== '' && p.assetId === formData.confirmAssetId,
    onSuccess: async () => {
      await invalidateAssetQueries(queryClient)
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
    formData.assetId === formData.confirmAssetId

  if (!selectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Destroy Asset</CardTitle>
          <CardDescription>
            Please connect your wallet to destroy assets
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Destroy Asset</CardTitle>
        <CardDescription>
          Permanently destroy an asset (5-step atomic process)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-2">
              <Badge variant="destructive">Warning</Badge>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-destructive">
                  This action cannot be undone!
                </p>
                <p className="text-muted-foreground">
                  Destroying an asset will:
                </p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Freeze the asset to prevent further operations</li>
                  <li>Remove all account holdings</li>
                  <li>Clear all approvals</li>
                  <li>Permanently delete the asset</li>
                </ul>
              </div>
            </div>
          </div>

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
                    setFormData((prev) => ({
                      ...prev,
                      assetId: e.target.value,
                    }))
                  }
                  placeholder="1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmAssetId">
                  Confirm Asset ID (Type to confirm) *
                </Label>
                <Input
                  id="confirmAssetId"
                  type="number"
                  value={formData.confirmAssetId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmAssetId: e.target.value,
                    }))
                  }
                  placeholder="Type the Asset ID again"
                  required
                />
                {formData.confirmAssetId &&
                  formData.assetId !== formData.confirmAssetId && (
                    <p className="text-sm text-destructive">
                      Asset IDs do not match
                    </p>
                  )}
              </div>

              <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                <p className="font-semibold">Destruction Process:</p>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>Freeze asset</li>
                  <li>Start destruction</li>
                  <li>Destroy approvals</li>
                  <li>Destroy accounts</li>
                  <li>Finish destruction</li>
                </ol>
                <p className="mt-2">
                  All steps execute atomically in a single transaction.
                </p>
              </div>
            </div>

            {/* Review - 1 column */}
            <div className="lg:col-span-1">
              <TransactionReview params={params} title="Destroy Parameters" />
            </div>
          </div>

          <TransactionFormFooter
            fee={fee}
            isCalculating={isCalculating}
            feeError={feeError}
            onSubmit={handleSubmit}
            submitLabel="Destroy Asset"
            disabled={!isFormValid || mutation.isPending}
          />
        </form>
      </CardContent>
    </Card>
  )
}

export function DestroyAsset() {
  return (
    <FeatureErrorBoundary featureName="Destroy Asset">
      <DestroyAssetInner />
    </FeatureErrorBoundary>
  )
}
