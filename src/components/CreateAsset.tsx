import { useEffect, useState, type FormEvent } from 'react'

import { ArrowRight, Plus } from 'lucide-react'

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
  useNextAssetId,
  useWalletContext,
} from '@/hooks'
import {
  createAssetBatch,
  createAssetToasts,
  invalidateAssetQueries,
  type CreateAssetParams,
} from '@/lib'

const initialFormData = {
  minBalance: '1',
  name: '',
  symbol: '',
  decimals: '12',
  initialMintAmount: '',
  initialMintBeneficiary: '',
}

function CreateAssetInner() {
  const { selectedAccount } = useWalletContext()
  const { isConnected, api } = useConnectionContext()
  const { nextAssetId } = useNextAssetId()
  const [formData, setFormData] =
    useState<Omit<CreateAssetParams, 'assetId'>>(initialFormData)

  // Keep beneficiary in sync with selected account
  useEffect(() => {
    if (selectedAccount?.address) {
      setFormData((prev) => ({
        ...prev,
        initialMintBeneficiary: selectedAccount.address,
      }))
    }
  }, [selectedAccount?.address])

  const { mutation: createAssetMutation, transaction } =
    useAssetMutation<CreateAssetParams>({
      params: { ...formData, assetId: nextAssetId ?? '' },
      operationFn: (params) =>
        createAssetBatch(api, params, selectedAccount?.address ?? ''),
      toastConfig: createAssetToasts,
      transactionKey: 'createAsset',
      isValid: (params) =>
        params.name !== '' &&
        params.symbol !== '' &&
        params.decimals !== '' &&
        !isNaN(parseInt(params.decimals)) &&
        params.minBalance !== '' &&
        parseFloat(params.minBalance) > 0,
      onSuccess: async (queryClient) => {
        await invalidateAssetQueries(queryClient)
        setFormData(initialFormData)
      },
    })

  const feeState = useFee(transaction, selectedAccount?.address)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createAssetMutation.mutate()
  }

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>
  }

  const reviewData = {
    name: formData.name,
    symbol: formData.symbol,
    decimals: formData.decimals,
    minBalance: formData.minBalance,
    ...(formData.initialMintAmount && {
      initialMint: formData.initialMintAmount,
      beneficiary: formData.initialMintBeneficiary,
    }),
  }

  return (
    <div>
      <AccountDashboard />
      <div className="mb-4 flex items-center gap-4 text-left">
        <Plus className="text-primary h-5 w-5" />
        <h1 className="text-foreground text-2xl leading-tight font-bold">
          Create New Asset
        </h1>
      </div>

      <Card className="gap-8 shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Form Fields - 2 columns */}
              <div className="space-y-4 lg:col-span-2">
                {/* Basic Token Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      maxLength={50}
                      placeholder="My Token"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      type="text"
                      value={formData.symbol}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          symbol: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      maxLength={10}
                      placeholder="MTK"
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Token Configuration */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
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
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minBalance">
                      Minimum Balance (in tokens)
                    </Label>
                    <Input
                      id="minBalance"
                      type="number"
                      value={formData.minBalance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minBalance: e.target.value,
                        }))
                      }
                      min="0.000000000001"
                      step="0.000000000001"
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Initial Mint */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialMint">
                      Initial Mint Amount (optional)
                    </Label>
                    <Input
                      id="initialMint"
                      type="number"
                      value={formData.initialMintAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          initialMintAmount: e.target.value,
                        }))
                      }
                      min="0"
                      step="0.000000000001"
                      placeholder="Amount to mint"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialMintBeneficiary">
                      Beneficiary Address
                    </Label>
                    <Input
                      id="initialMintBeneficiary"
                      type="text"
                      value={formData.initialMintBeneficiary}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          initialMintBeneficiary: e.target.value,
                        }))
                      }
                      className="h-12 font-mono text-sm"
                      placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                    />
                    <p className="text-muted-foreground text-xs">
                      Tokens will be minted to this address
                    </p>
                  </div>
                </div>

                {createAssetMutation.isError && (
                  <div className="text-destructive-foreground bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
                    {createAssetMutation.error?.message}
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
                disabled={!isConnected || createAssetMutation.isPending}
                size="lg"
                className="ml-auto w-full lg:w-auto"
              >
                {createAssetMutation.isPending
                  ? 'Creating Asset...'
                  : 'Create Asset'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function CreateAsset() {
  return (
    <FeatureErrorBoundary featureName="Create Asset">
      <CreateAssetInner />
    </FeatureErrorBoundary>
  )
}
