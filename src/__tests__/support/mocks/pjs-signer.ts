/**
 * Mock factory for polkadot-api/pjs-signer
 *
 * Provides controllable mocks for wallet extension interactions
 * without requiring actual browser extensions during tests.
 *
 * Usage:
 * ```ts
 * const { mockExtension, mockAccounts } = createMockExtension('polkadot-js', [
 *   { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', name: 'Alice' }
 * ])
 * ```
 */

import { vi } from 'vitest'
import type {
  InjectedExtension,
  InjectedPolkadotAccount,
} from 'polkadot-api/pjs-signer'

/**
 * Creates a mock InjectedPolkadotAccount
 */
export const createMockAccount = (
  overrides?: Partial<InjectedPolkadotAccount>
): InjectedPolkadotAccount => ({
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  polkadotSigner: {} as InjectedPolkadotAccount['polkadotSigner'],
  ...overrides,
})

/**
 * Creates a mock InjectedExtension
 */
export const createMockExtension = (
  name: string,
  accounts: InjectedPolkadotAccount[]
): InjectedExtension => ({
  name,
  getAccounts: vi.fn(() => accounts),
  disconnect: vi.fn(),
})

/**
 * Test accounts matching the factory pattern from asset-params
 */
export const MOCK_ACCOUNTS = {
  ALICE: createMockAccount({
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  }),
  BOB: createMockAccount({
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  }),
  CHARLIE: createMockAccount({
    address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  }),
} as const

/**
 * Global mock state for polkadot-api/pjs-signer
 * Reset this between tests using resetMockPjsSigner()
 */
export const mockPjsSignerState = {
  availableExtensions: ['polkadot-js'] as string[],
  extensions: new Map<string, InjectedExtension>(),
  connectionErrors: new Map<string, Error>(),
}

/**
 * Resets all mock state between tests
 */
export const resetMockPjsSigner = () => {
  mockPjsSignerState.availableExtensions = ['polkadot-js']
  mockPjsSignerState.extensions.clear()
  mockPjsSignerState.connectionErrors.clear()
}

/**
 * Registers an extension that can be connected
 */
export const registerMockExtension = (
  name: string,
  accounts: InjectedPolkadotAccount[]
) => {
  if (!mockPjsSignerState.availableExtensions.includes(name)) {
    mockPjsSignerState.availableExtensions.push(name)
  }
  mockPjsSignerState.extensions.set(name, createMockExtension(name, accounts))
}

/**
 * Makes an extension throw an error when connecting
 */
export const setMockExtensionError = (name: string, error: Error) => {
  mockPjsSignerState.connectionErrors.set(name, error)
}

/**
 * Mock implementation of getInjectedExtensions
 */
export const getInjectedExtensions = vi.fn(
  () => mockPjsSignerState.availableExtensions
)

/**
 * Mock implementation of connectInjectedExtension
 */
export const connectInjectedExtension = vi.fn(
  async (extensionName: string): Promise<InjectedExtension> => {
    // Check for configured error
    const error = mockPjsSignerState.connectionErrors.get(extensionName)
    if (error) {
      throw error
    }

    // Check if extension exists
    const extension = mockPjsSignerState.extensions.get(extensionName)
    if (!extension) {
      throw new Error(`Extension '${extensionName}' not found`)
    }

    return extension
  }
)
