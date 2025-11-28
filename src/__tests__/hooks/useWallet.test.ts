/**
 * CRITICAL TESTS: Wallet Connection Hook - Auto-Reconnect & Persistence
 *
 * ⚠️  AUTO-RECONNECT RISK: This hook manages wallet auto-reconnection on page load.
 * Errors here cause:
 * - User forced to reconnect wallet every page refresh (UX disaster)
 * - Loss of account selection (wrong account used for transactions)
 * - Race conditions (auto-connect vs manual connect)
 * - localStorage corruption (persisted invalid state)
 *
 * Test Coverage:
 * - Auto-reconnect on mount with saved connection
 * - Auto-reconnect failure handling (extension unavailable, account changed)
 * - Manual wallet connection and account selection
 * - Account switching with persistence
 * - Disconnect and cleanup
 * - Race conditions and edge cases
 *
 * Priority: TIER 1 - Critical for user experience
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Now import the hook
import { useWallet } from '@/contexts/internal/useWallet'
import { loadWalletConnection, saveWalletConnection } from '@/lib/storage'
import { act, renderHook, waitFor } from '@testing-library/react'

// Import mock utilities
import * as pjsSignerMock from '../support/mocks/pjs-signer'

// Mock the polkadot-api/pjs-signer module BEFORE importing useWallet
vi.mock('polkadot-api/pjs-signer', async () => {
  const mocks = await import('../support/mocks/pjs-signer')
  return {
    getInjectedExtensions: mocks.getInjectedExtensions,
    connectInjectedExtension: mocks.connectInjectedExtension,
  }
})

// Test addresses (SS58 format) - cleaner than using MOCK_ACCOUNTS everywhere
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
const CHARLIE = '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'

// Helper: Create accounts from addresses
const accountsFrom = (...addresses: string[]) =>
  addresses.map((addr) => pjsSignerMock.createMockAccount({ address: addr }))

// Helper: Setup extension with accounts
const setupExtension = (name: string, ...addresses: string[]) => {
  pjsSignerMock.registerMockExtension(name, accountsFrom(...addresses))
}

// Helper: Setup auto-reconnect scenario
const setupAutoReconnect = (
  address: string,
  ...availableAddresses: string[]
) => {
  setupExtension('polkadot-js', ...availableAddresses)
  saveWalletConnection({
    extensionName: 'polkadot-js',
    selectedAccountAddress: address,
  })
}

// Helper: Wait for wallet to be ready
const waitForReady = async (
  result: ReturnType<
    typeof renderHook<ReturnType<typeof useWallet>, unknown>
  >['result']
) => {
  await waitFor(() => expect(result.current.isConnecting).toBe(false))
}

describe('useWallet', () => {
  beforeEach(() => {
    pjsSignerMock.resetMockPjsSigner()
    localStorage.clear()
    vi.clearAllMocks()

    // Suppress console logs in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial state', () => {
    it('starts with no connection', () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))

      expect(result.current.extension).toBeNull()
      expect(result.current.accounts).toEqual([])
      expect(result.current.selectedAccount).toBeNull()
      expect(result.current.isConnected).toBe(false)
      expect(result.current.connectionError).toBeNull()
    })

    it('lists available extensions', () => {
      setupExtension('polkadot-js', ALICE)
      setupExtension('talisman', BOB)

      const { result } = renderHook(() => useWallet('testnet'))

      expect(result.current.availableExtensions).toEqual(
        expect.arrayContaining(['polkadot-js', 'talisman'])
      )
    })
  })

  describe('Auto-reconnect on mount', () => {
    it('auto-reconnects with saved connection data', async () => {
      setupAutoReconnect(ALICE, ALICE, BOB)
      const { result } = renderHook(() => useWallet('testnet'))

      // Initially shows auto-connecting state
      expect(result.current.isConnecting).toBe(true)

      await waitForReady(result)

      // Should be connected with saved account
      expect(result.current.isConnected).toBe(true)
      expect(result.current.extension).toBeDefined()
      expect(result.current.selectedAccount?.address).toBe(ALICE)
      expect(result.current.accounts).toHaveLength(2)
    })

    it('auto-reconnects and restores previously selected account', async () => {
      setupAutoReconnect(CHARLIE, ALICE, BOB, CHARLIE)
      const { result } = renderHook(() => useWallet('testnet'))

      await waitForReady(result)

      // Should restore Charlie (not default to first account)
      expect(result.current.selectedAccount?.address).toBe(CHARLIE)
    })

    it('falls back to first account if saved account not found', async () => {
      const DELETED = '5DTestAccountDoesNotExist'
      setupAutoReconnect(DELETED, ALICE, BOB)

      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      // Should connect but use first available account
      expect(result.current.isConnected).toBe(true)
      expect(result.current.selectedAccount?.address).toBe(ALICE)
    })

    it('clears localStorage if saved extension not available', async () => {
      setupExtension('polkadot-js', ALICE)

      // Save connection to extension that no longer exists
      saveWalletConnection({
        extensionName: 'talisman',
        selectedAccountAddress: BOB,
      })

      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      expect(result.current.isConnected).toBe(false)
      expect(loadWalletConnection()).toBeNull()
    })

    it('clears localStorage if auto-reconnect fails', async () => {
      setupExtension('polkadot-js', ALICE)
      pjsSignerMock.setMockExtensionError(
        'polkadot-js',
        new Error('User denied access')
      )
      saveWalletConnection({
        extensionName: 'polkadot-js',
        selectedAccountAddress: ALICE,
      })

      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      expect(result.current.isConnected).toBe(false)
      expect(loadWalletConnection()).toBeNull()
    })

    it('does not auto-reconnect when no saved data', async () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))

      await waitForReady(result)

      expect(result.current.isConnected).toBe(false)
      expect(pjsSignerMock.connectInjectedExtension).not.toHaveBeenCalled()
    })
  })

  describe('Manual wallet connection', () => {
    it('connects to extension and selects first account', async () => {
      setupExtension('polkadot-js', ALICE, BOB)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.extension).toBeDefined()
      expect(result.current.accounts).toHaveLength(2)
      expect(result.current.selectedAccount?.address).toBe(ALICE)
      expect(result.current.connectionError).toBeNull()
    })

    it('persists connection to localStorage', async () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      const saved = loadWalletConnection()
      expect(saved).toEqual({
        extensionName: 'polkadot-js',
        selectedAccountAddress: ALICE,
      })
    })

    it('restores specific account when provided', async () => {
      setupExtension('polkadot-js', ALICE, BOB, CHARLIE)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js', BOB)
      })

      expect(result.current.selectedAccount?.address).toBe(BOB)
    })

    it('handles connection errors gracefully', async () => {
      setupExtension('polkadot-js', ALICE)
      pjsSignerMock.setMockExtensionError(
        'polkadot-js',
        new Error('User rejected authorization')
      )

      const { result } = renderHook(() => useWallet('testnet'))

      // Wait for auto-connect to finish
      await waitFor(() => expect(result.current.isConnecting).toBe(false), {
        timeout: 2000,
      })

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      // Wait for error state to update
      await waitFor(
        () =>
          expect(result.current.connectionError).toBe(
            'User rejected authorization'
          ),
        { timeout: 2000 }
      )

      expect(result.current.isConnected).toBe(false)
      expect(loadWalletConnection()).toBeNull()
    })

    it('clears previous error on successful connection', async () => {
      setupExtension('polkadot-js', ALICE)
      pjsSignerMock.setMockExtensionError(
        'polkadot-js',
        new Error('First attempt failed')
      )

      const { result } = renderHook(() => useWallet('testnet'))

      // Wait for auto-connect to finish
      await waitFor(() => expect(result.current.isConnecting).toBe(false), {
        timeout: 2000,
      })

      // First attempt fails
      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      // Wait for error state
      await waitFor(
        () =>
          expect(result.current.connectionError).toBe('First attempt failed'),
        { timeout: 2000 }
      )

      // Clear the error and try again
      pjsSignerMock.setMockExtensionError('polkadot-js', undefined as never)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      // Wait for successful connection
      await waitFor(() => expect(result.current.isConnected).toBe(true), {
        timeout: 2000,
      })

      expect(result.current.connectionError).toBeNull()
    })
  })

  describe('Account switching', () => {
    it('switches selected account', async () => {
      setupExtension('polkadot-js', ALICE, BOB)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      // Initially Alice
      expect(result.current.selectedAccount?.address).toBe(ALICE)

      // Switch to Bob
      await act(async () => {
        result.current.setSelectedAccount(accountsFrom(BOB)[0])
      })

      // Wait for state to update
      await waitFor(() =>
        expect(result.current.selectedAccount?.address).toBe(BOB)
      )
    })

    it('persists account switch to localStorage', async () => {
      setupExtension('polkadot-js', ALICE, BOB)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      await act(async () => {
        result.current.setSelectedAccount(accountsFrom(BOB)[0])
      })

      // Wait for localStorage to update
      await waitFor(() => {
        const saved = loadWalletConnection()
        return expect(saved?.selectedAccountAddress).toBe(BOB)
      })
    })
  })

  describe('Disconnect', () => {
    it('clears all state on disconnect', async () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })
      expect(result.current.isConnected).toBe(true)

      await act(async () => {
        result.current.disconnect()
      })

      // Wait for state to clear
      await waitFor(() => {
        expect(result.current.extension).toBeNull()
        expect(result.current.accounts).toEqual([])
        expect(result.current.selectedAccount).toBeNull()
        expect(result.current.isConnected).toBe(false)
      })
    })

    it('clears localStorage on disconnect', async () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })
      expect(loadWalletConnection()).not.toBeNull()

      await act(async () => {
        result.current.disconnect()
      })

      // Wait for localStorage to clear
      await waitFor(() => expect(loadWalletConnection()).toBeNull())
    })

    it('calls extension.disconnect()', async () => {
      setupExtension('polkadot-js', ALICE)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      const extensionDisconnect = result.current.extension?.disconnect

      await act(async () => {
        result.current.disconnect()
      })

      // Wait and verify disconnect was called
      await waitFor(() => expect(extensionDisconnect).toHaveBeenCalled())
    })
  })

  describe('Edge cases', () => {
    it('handles extension with no accounts', async () => {
      pjsSignerMock.registerMockExtension('polkadot-js', [])
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js')
      })

      // Wait for connection to complete
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
        expect(result.current.accounts).toEqual([])
        expect(result.current.selectedAccount).toBeNull()
      })
    })

    it('handles non-existent extension gracefully', async () => {
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('non-existent-extension')
      })

      // Wait for error state
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false)
        expect(result.current.connectionError).toContain('not found')
      })
    })

    it('does not auto-reconnect if already connected', async () => {
      setupAutoReconnect(ALICE, ALICE)
      const { result, rerender } = renderHook(() => useWallet('testnet'))

      // Wait for initial auto-reconnect
      await waitFor(() => expect(result.current.isConnected).toBe(true), {
        timeout: 2000,
      })

      const callCount = pjsSignerMock.connectInjectedExtension.mock.calls.length

      // Force re-render
      rerender()

      // Wait a bit to ensure no additional calls
      await waitFor(() => {
        expect(pjsSignerMock.connectInjectedExtension).toHaveBeenCalledTimes(
          callCount
        )
      })
    })

    it('handles multiple accounts with same name', async () => {
      const ALICE_ALT = '5DTestAnotherAliceAccount'

      setupExtension('polkadot-js', ALICE, ALICE_ALT)
      const { result } = renderHook(() => useWallet('testnet'))
      await waitForReady(result)

      await act(async () => {
        await result.current.connectWallet('polkadot-js', ALICE_ALT)
      })

      // Wait for account selection
      await waitFor(() =>
        expect(result.current.selectedAccount?.address).toBe(ALICE_ALT)
      )
    })
  })
})
