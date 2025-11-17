/**
 * Mock factory for wallet extension
 *
 * Provides flexible mocks for polkadot-js wallet extensions.
 * Useful for testing components and hooks that depend on wallet state.
 *
 * Usage:
 * ```ts
 * const mockExtension = createMockWalletExtension({
 *   accounts: [ALICE_ACCOUNT, BOB_ACCOUNT],
 * })
 * ```
 */

import { vi } from 'vitest'
import type { InjectedExtension, InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { ALICE_ACCOUNT } from '../fixtures/accounts'

/**
 * Factory to create a mocked wallet extension
 *
 * @param overrides - Partial configuration for the extension
 * @returns Mocked InjectedExtension
 *
 * @example
 * // Mock with specific accounts
 * const extension = createMockWalletExtension({
 *   accounts: [ALICE_ACCOUNT, BOB_ACCOUNT],
 * })
 */
export const createMockWalletExtension = (
  overrides?: Partial<{
    name: string
    accounts: InjectedPolkadotAccount[]
    version: string
  }>
): InjectedExtension => {
  const accounts = overrides?.accounts || [ALICE_ACCOUNT]

  return {
    name: overrides?.name || 'polkadot-js',
    version: overrides?.version || '0.47.6',
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAccounts: vi.fn().mockResolvedValue(accounts),
  } as unknown as InjectedExtension
}

/**
 * Factory to create mock wallet context value
 * Useful for testing components that use useWallet hook
 *
 * @param overrides - Partial wallet state
 * @returns Mocked wallet context value
 *
 * @example
 * // Mock connected wallet with specific account
 * const walletContext = createMockWalletContext({
 *   isConnected: true,
 *   selectedAccount: BOB_ACCOUNT,
 * })
 */
export const createMockWalletContext = (
  overrides?: Partial<{
    extension: InjectedExtension | null
    accounts: InjectedPolkadotAccount[]
    selectedAccount: InjectedPolkadotAccount | null
    isConnecting: boolean
    isAutoConnecting: boolean
    connectedExtensionName: string | null
    connectionError: string | null
    availableExtensions: string[]
    connectWallet: (extensionName: string) => Promise<void>
    disconnectWallet: () => void
    selectAccount: (account: InjectedPolkadotAccount) => void
  }>
) => {
  const isConnected = overrides?.extension !== undefined && overrides?.extension !== null

  return {
    extension: overrides?.extension || null,
    accounts: overrides?.accounts || [],
    selectedAccount: overrides?.selectedAccount || null,
    isConnecting: overrides?.isConnecting || false,
    isAutoConnecting: overrides?.isAutoConnecting || false,
    connectedExtensionName: overrides?.connectedExtensionName || null,
    connectionError: overrides?.connectionError || null,
    availableExtensions: overrides?.availableExtensions || ['polkadot-js', 'talisman'],
    isConnected,
    connectWallet: overrides?.connectWallet || vi.fn().mockResolvedValue(undefined),
    disconnectWallet: overrides?.disconnectWallet || vi.fn(),
    selectAccount: overrides?.selectAccount || vi.fn(),
  }
}
