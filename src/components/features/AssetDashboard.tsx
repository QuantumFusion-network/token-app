import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountDashboard } from '@/components/shared/AccountDashboard'
import { CreateAsset } from './CreateAsset'
import { MintTokens } from './MintTokens'
import { TransferTokens } from './TransferTokens'
import { DestroyAsset } from './DestroyAsset'
import { AssetList } from './AssetList'

type View = 'portfolio' | 'create' | 'mint' | 'transfer' | 'destroy'

/**
 * Main asset management dashboard
 *
 * Combines all asset operations into a single view:
 * - Portfolio view with asset list
 * - Create new assets
 * - Mint tokens
 * - Transfer tokens
 * - Destroy assets
 */
export function AssetDashboard() {
  const [currentView, setCurrentView] = useState<View>('portfolio')
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)

  const handleMint = (assetId: number) => {
    setSelectedAssetId(assetId)
    setCurrentView('mint')
  }

  const handleTransfer = (assetId: number) => {
    setSelectedAssetId(assetId)
    setCurrentView('transfer')
  }

  const handleDestroy = (assetId: number) => {
    setSelectedAssetId(assetId)
    setCurrentView('destroy')
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">
            Manage your custom tokens on QF Network
          </p>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
          <CardDescription>Choose an action to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentView === 'portfolio' ? 'default' : 'outline'}
              onClick={() => setCurrentView('portfolio')}
            >
              Portfolio
            </Button>
            <Button
              variant={currentView === 'create' ? 'default' : 'outline'}
              onClick={() => setCurrentView('create')}
            >
              Create Asset
            </Button>
            <Button
              variant={currentView === 'mint' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAssetId(null)
                setCurrentView('mint')
              }}
            >
              Mint Tokens
            </Button>
            <Button
              variant={currentView === 'transfer' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAssetId(null)
                setCurrentView('transfer')
              }}
            >
              Transfer Tokens
            </Button>
            <Button
              variant={currentView === 'destroy' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAssetId(null)
                setCurrentView('destroy')
              }}
            >
              Destroy Asset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <AccountDashboard />

      {/* Main Content */}
      <div className="space-y-6">
        {currentView === 'portfolio' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>
                View and manage all your custom tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetList
                onMint={handleMint}
                onTransfer={handleTransfer}
                onDestroy={handleDestroy}
              />
            </CardContent>
          </Card>
        )}

        {currentView === 'create' && <CreateAsset />}

        {currentView === 'mint' && <MintTokens />}

        {currentView === 'transfer' && <TransferTokens />}

        {currentView === 'destroy' && <DestroyAsset />}
      </div>
    </div>
  )
}
