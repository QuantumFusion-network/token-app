import { useState } from 'react'

import { Coins, LayoutDashboard, Plus, Send, Trash2 } from 'lucide-react'

import QfLogo from '@/assets/qf-logo.svg'
import {
  AccountSelector,
  AssetList,
  ConnectionBanner,
  CreateAsset,
  DestroyAsset,
  MintTokens,
  TransferTokens,
  WalletConnector,
} from '@/components'
import { Button, Toaster } from '@/components/ui'
import {
  useConnectionContext,
  useTransactionToasts,
  useWalletContext,
} from '@/hooks'

import './App.css'

type Tab = 'assets' | 'create' | 'mint' | 'transfer' | 'destroy'

export default function App() {
  const { isConnected: isWalletConnected } = useWalletContext()
  const { isConnected: isChainConnected } = useConnectionContext()
  const [activeTab, setActiveTab] = useState<Tab>('assets')

  // Initialize transaction toasts
  useTransactionToasts()

  if (!isWalletConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <WalletConnector />
      </div>
    )
  }

  const navigationItems = [
    {
      id: 'assets' as const,
      label: 'Portfolio',
      icon: LayoutDashboard,
      component: AssetList,
      section: 'main',
    },
    {
      id: 'create' as const,
      label: 'Create Asset',
      icon: Plus,
      component: CreateAsset,
      section: 'main',
    },
    {
      id: 'mint' as const,
      label: 'Mint Tokens',
      icon: Coins,
      component: MintTokens,
      section: 'operations',
    },
    {
      id: 'transfer' as const,
      label: 'Transfer',
      icon: Send,
      component: TransferTokens,
      section: 'operations',
    },
    {
      id: 'destroy' as const,
      label: 'Destroy Asset',
      icon: Trash2,
      component: DestroyAsset,
      section: 'admin',
    },
  ]

  const ActiveComponent =
    navigationItems.find((item) => item.id === activeTab)?.component ||
    AssetList

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-card border-border flex w-64 flex-col border-r shadow-lg">
        {/* Header */}
        <div className="text-foreground border-border from-muted/20 to-muted/40 flex items-center gap-3 border-b bg-gradient-to-br p-4">
          <img src={QfLogo} alt="QF Network" className="h-9 w-9 lg:h-10 lg:w-10" />
          <div className="text-left">
            <h1 className="text-foreground mt-1.5 text-xl leading-4 font-bold">
              QF Network
            </h1>
            <p className="text-muted-foreground text-sm">Asset Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className={`h-10 w-full justify-start px-3 ${
                    activeTab === item.id
                      ? ''
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Connection status banner */}
        <ConnectionBanner />

        {/* Header with account selector */}
        <header className="border-border bg-background/80 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isChainConnected ? 'bg-green-500' : 'bg-destructive'
                }`}
              ></div>
              <span className="text-muted-foreground text-sm font-medium">
                {isChainConnected
                  ? 'Connected to QF Network'
                  : 'Disconnected from QF Network'}
              </span>
            </div>
            <AccountSelector />
          </div>
        </header>

        <main className="bg-muted/20 flex-1 p-4">
          <ActiveComponent />
        </main>
      </div>

      <Toaster toastOptions={{ duration: 30_000 }} />
    </div>
  )
}
