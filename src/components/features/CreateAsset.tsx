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
import { useNextAssetId } from '@/hooks/useNextAssetId'
import { useWalletContext } from '@/hooks/useWalletContext'
import { TransactionFormFooter } from '@/components/shared/TransactionFormFooter'
import { TransactionReview } from '@/components/shared/TransactionReview'
import { FeatureErrorBoundary } from '@/components/error-boundaries'
import {
  createAssetBatch,
  type CreateAssetParams,
} from '@/lib/assetOperations'
import { createAssetToasts } from '@/lib/assetToasts'
import { invalidateAssetQueries } from '@/lib/queryHelpers'

const initialFormData = {
  name: '',
  symbol: '',
  decimals: '12',
  minBalance: '1',
  initialMintAmount: '',
  initialMintBeneficiary: '',
}

function CreateAssetInner() {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(initialFormData)

  const {
    data: nextAssetId,
    isLoading: isLoadingAssetId,
    error: assetIdError,
  } = useNextAssetId()

  const params: CreateAssetParams = {
    ...formData,
    assetId: nextAssetId ?? '1',
    initialMintBeneficiary:
      formData.initialMintBeneficiary || selectedAccount?.address || '',
  }

  const { mutation, transaction } = useAssetMutation<CreateAssetParams>({
    params,
    operationFn: (p) =>
      createAssetBatch(api!, p, selectedAccount?.address ?? ''),
    toastConfig: createAssetToasts,
    transactionKey: 'createAsset',
    isValid: (p) => p.name !== '' && p.symbol !== '' && !!nextAssetId,
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
    formData.name !== '' && formData.symbol !== '' && !!nextAssetId

  if (!selectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Asset</CardTitle>
          <CardDescription>
            Please connect your wallet to create assets
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Asset</CardTitle>
        <CardDescription>
          Create a custom token on QF Network testnet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form fields - 2 columns */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid gap-2">
                <Label htmlFor="assetId">Asset ID</Label>
                <Input
                  id="assetId"
                  value={isLoadingAssetId ? 'Loading...' : nextAssetId ?? ''}
                  disabled
                  placeholder="Auto-assigned"
                />
                {assetIdError && (
                  <p className="text-sm text-destructive">
                    Failed to load next asset ID
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Token Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="My Custom Token"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      symbol: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="MCT"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    value={formData.decimals}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        decimals: e.target.value,
                      }))
                    }
                    min="0"
                    max="18"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minBalance">Min Balance</Label>
                  <Input
                    id="minBalance"
                    value={formData.minBalance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minBalance: e.target.value,
                      }))
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="initialMintAmount">
                  Initial Mint Amount (Optional)
                </Label>
                <Input
                  id="initialMintAmount"
                  value={formData.initialMintAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      initialMintAmount: e.target.value,
                    }))
                  }
                  placeholder="1000"
                />
              </div>

              {formData.initialMintAmount && (
                <div className="grid gap-2">
                  <Label htmlFor="initialMintBeneficiary">
                    Beneficiary Address (Optional)
                  </Label>
                  <Input
                    id="initialMintBeneficiary"
                    value={formData.initialMintBeneficiary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        initialMintBeneficiary: e.target.value,
                      }))
                    }
                    placeholder={selectedAccount.address}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to mint to your account
                  </p>
                </div>
              )}
            </div>

            {/* Review - 1 column */}
            <div className="lg:col-span-1">
              <TransactionReview params={params} title="Asset Parameters" />
            </div>
          </div>

          <TransactionFormFooter
            fee={fee}
            isCalculating={isCalculating}
            feeError={feeError}
            onSubmit={handleSubmit}
            submitLabel="Create Asset"
            disabled={!isFormValid || mutation.isPending}
          />
        </form>
      </CardContent>
    </Card>
  )
}

export function CreateAsset() {
  return (
    <FeatureErrorBoundary featureName="Create Asset">
      <CreateAssetInner />
    </FeatureErrorBoundary>
  )
}
