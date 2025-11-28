import { useEffect, useRef, useState } from 'react'

import {
  connectInjectedExtension,
  getInjectedExtensions,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from 'polkadot-api/pjs-signer'

import {
  clearWalletConnection,
  getAllDevAccounts,
  loadWalletConnection,
  saveWalletConnection,
  type DevAccount,
  type NetworkId,
} from '@/lib'

// Unified account type that works for both injected and dev accounts
export type Account = InjectedPolkadotAccount | DevAccount

export function useWallet(networkId: NetworkId) {
  const [extension, setExtension] = useState<InjectedExtension | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(true)
  const [connectedExtensionName, setConnectedExtensionName] = useState<
    string | null
  >(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const availableExtensions = getInjectedExtensions()
  const prevNetworkIdRef = useRef(networkId)

  // Handle network changes
  useEffect(() => {
    const prevNetworkId = prevNetworkIdRef.current
    prevNetworkIdRef.current = networkId

    if (prevNetworkId === networkId) return

    // Network changed
    if (networkId === 'local') {
      // Switching to local: use dev accounts
      const devAccounts = getAllDevAccounts()
      setAccounts(devAccounts)
      const alice = devAccounts.find((a) => a.name === 'Alice')
      setSelectedAccount(alice ?? devAccounts[0])
      // Clear extension state but don't disconnect (we may switch back)
      setConnectedExtensionName(null)
      setConnectionError(null)
    } else {
      // Switching from local to testnet: need to reconnect wallet
      setAccounts([])
      setSelectedAccount(null)
      setIsAutoConnecting(true)
    }
  }, [networkId])

  // Initialize dev accounts on mount if on local network
  useEffect(() => {
    if (networkId === 'local') {
      const devAccounts = getAllDevAccounts()
      setAccounts(devAccounts)
      const alice = devAccounts.find((a) => a.name === 'Alice')
      setSelectedAccount(alice ?? devAccounts[0])
      setIsAutoConnecting(false)
    }
  }, []) // Only run on mount

  // Auto-reconnect on mount if we have saved connection data (only for non-local networks)
  useEffect(() => {
    if (networkId === 'local') {
      setIsAutoConnecting(false)
      return
    }

    const attemptAutoReconnect = async () => {
      const saved = loadWalletConnection()
      if (!saved) {
        setIsAutoConnecting(false)
        return
      }

      const { extensionName, selectedAccountAddress } = saved

      // Check if the saved extension is still available
      if (!availableExtensions.includes(extensionName)) {
        console.log(`Saved extension '${extensionName}' is no longer available`)
        clearWalletConnection()
        setIsAutoConnecting(false)
        return
      }

      console.log(`Auto-reconnecting to ${extensionName}...`)
      try {
        await connectWallet(extensionName, selectedAccountAddress)
        console.log('Auto-reconnection successful')
      } catch (error) {
        console.log('Auto-reconnection failed:', error)
        clearWalletConnection()
      } finally {
        setIsAutoConnecting(false)
      }
    }

    // Only attempt auto-reconnect if we're not already connected
    if (!extension) {
      attemptAutoReconnect().catch(console.error)
    } else {
      setIsAutoConnecting(false)
    }
  }, [availableExtensions, extension, networkId])

  const connectWallet = async (
    extensionName: string,
    selectedAccountAddress?: string
  ) => {
    // Dev accounts don't use wallet extensions
    if (networkId === 'local') return

    try {
      setIsConnecting(true)
      setConnectionError(null)
      console.log('Connecting to extension:', extensionName)
      const ext = await connectInjectedExtension(extensionName)
      console.log('Extension connected:', ext)
      setExtension(ext)

      const availableAccounts = ext.getAccounts()
      console.log('Available accounts:', availableAccounts)
      setAccounts(availableAccounts)

      let accountToSelect = availableAccounts[0]

      // Try to find the previously selected account
      if (selectedAccountAddress) {
        const foundAccount = availableAccounts.find(
          (account) => account.address === selectedAccountAddress
        )
        if (foundAccount) {
          accountToSelect = foundAccount
          console.log(
            'Restored previously selected account:',
            selectedAccountAddress
          )
        } else {
          console.log(
            'Previously selected account not found, using first available'
          )
        }
      }

      if (accountToSelect) {
        setSelectedAccount(accountToSelect)
        setConnectedExtensionName(extensionName)
        saveWalletConnection({
          extensionName,
          selectedAccountAddress: accountToSelect.address,
        })
      }

      console.log('Wallet connection completed')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect wallet'
      setConnectionError(errorMessage)
      clearWalletConnection()
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    // For dev accounts, just reset selection
    if (networkId === 'local') {
      const devAccounts = getAllDevAccounts()
      const alice = devAccounts.find((a) => a.name === 'Alice')
      setSelectedAccount(alice ?? devAccounts[0])
      return
    }

    extension?.disconnect()
    setExtension(null)
    setAccounts([])
    setSelectedAccount(null)
    setConnectedExtensionName(null)
    clearWalletConnection()
  }

  // Custom setSelectedAccount that also persists to localStorage (only for injected accounts)
  const updateSelectedAccount = (account: Account | null) => {
    setSelectedAccount(account)

    // Only persist injected account selection
    if (account && connectedExtensionName && networkId !== 'local') {
      saveWalletConnection({
        extensionName: connectedExtensionName,
        selectedAccountAddress: account.address,
      })
    }
  }

  // isConnected: true if on local (dev accounts always available) or has extension
  const isConnected = networkId === 'local' || !!extension

  return {
    extension,
    accounts,
    selectedAccount,
    setSelectedAccount: updateSelectedAccount,
    availableExtensions,
    isConnecting: isConnecting || isAutoConnecting,
    connectWallet,
    disconnect,
    isConnected,
    connectionError,
    isDevMode: networkId === 'local',
  }
}
