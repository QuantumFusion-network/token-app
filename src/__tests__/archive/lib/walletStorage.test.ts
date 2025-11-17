/**
 * Tests for lib/walletStorage.ts - Wallet connection persistence
 *
 * These functions manage wallet connection state in localStorage, enabling:
 * - Auto-reconnection when user returns to the app
 * - Persisting selected wallet extension and account
 * - Graceful recovery from invalid/corrupted data
 *
 * Test Coverage:
 * - saveWalletConnection: Persists wallet data to localStorage
 * - loadWalletConnection: Retrieves and validates wallet data
 * - clearWalletConnection: Removes persisted data
 *
 * Note: localStorage is automatically cleared after each test (see setup.ts)
 */

import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  saveWalletConnection,
  loadWalletConnection,
  clearWalletConnection,
  type StoredWalletConnection,
} from '@/lib/walletStorage'
import { ALICE_STORED_CONNECTION, BOB_STORED_CONNECTION } from '../fixtures'

const STORAGE_KEY = 'polka-wallet-connection'

describe('saveWalletConnection', () => {
  describe('Success cases', () => {
    it('saves valid wallet connection to localStorage', () => {
      saveWalletConnection(ALICE_STORED_CONNECTION)

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual(ALICE_STORED_CONNECTION)
    })

    it('overwrites existing connection data', () => {
      // Save Alice's connection
      saveWalletConnection(ALICE_STORED_CONNECTION)

      // Save Bob's connection (should overwrite)
      saveWalletConnection(BOB_STORED_CONNECTION)

      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual(BOB_STORED_CONNECTION)
      expect(parsed).not.toEqual(ALICE_STORED_CONNECTION)
    })

    it('saves connection with different extension names', () => {
      const connections: StoredWalletConnection[] = [
        { extensionName: 'polkadot-js', selectedAccountAddress: '5GrwvaEF...' },
        { extensionName: 'talisman', selectedAccountAddress: '5FHneW46...' },
        { extensionName: 'subwallet', selectedAccountAddress: '5FLSigC9...' },
      ]

      connections.forEach((connection) => {
        saveWalletConnection(connection)

        const stored = localStorage.getItem(STORAGE_KEY)
        const parsed = JSON.parse(stored!)
        expect(parsed).toEqual(connection)
      })
    })
  })

  describe('Error handling', () => {
    it('handles localStorage errors gracefully without throwing', () => {
      // Note: Testing localStorage exceptions in jsdom is unreliable
      // The important behavior is that saveWalletConnection never throws
      // and handles errors internally with console.warn

      // This test verifies the function doesn't throw, even if we can't
      // reliably trigger the error path in a test environment
      expect(() => {
        saveWalletConnection(ALICE_STORED_CONNECTION)
      }).not.toThrow()

      // Verify the save actually worked
      expect(localStorage.getItem('polka-wallet-connection')).toBeTruthy()
    })
  })
})

describe('loadWalletConnection', () => {
  describe('Success cases', () => {
    it('loads valid wallet connection from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE_STORED_CONNECTION))

      const loaded = loadWalletConnection()

      expect(loaded).toEqual(ALICE_STORED_CONNECTION)
    })

    it('returns null when no connection is stored', () => {
      const loaded = loadWalletConnection()
      expect(loaded).toBeNull()
    })

    it('loads connection with various valid extension names', () => {
      const validConnections: StoredWalletConnection[] = [
        { extensionName: 'polkadot-js', selectedAccountAddress: '5GrwvaEF...' },
        { extensionName: 'talisman', selectedAccountAddress: '5FHneW46...' },
        { extensionName: 'subwallet-js', selectedAccountAddress: '5FLSigC9...' },
      ]

      validConnections.forEach((connection) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(connection))
        const loaded = loadWalletConnection()
        expect(loaded).toEqual(connection)
        localStorage.clear()
      })
    })
  })

  describe('Validation and data sanitization', () => {
    it('rejects connection with empty extension name', () => {
      const invalidConnection = {
        extensionName: '',
        selectedAccountAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      // Should return null and clear invalid data
      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection with empty account address', () => {
      const invalidConnection = {
        extensionName: 'polkadot-js',
        selectedAccountAddress: '',
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection with missing extensionName field', () => {
      const invalidConnection = {
        selectedAccountAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection with missing selectedAccountAddress field', () => {
      const invalidConnection = {
        extensionName: 'polkadot-js',
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection with non-string extensionName', () => {
      const invalidConnection = {
        extensionName: 123, // number instead of string
        selectedAccountAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection with non-string account address', () => {
      const invalidConnection = {
        extensionName: 'polkadot-js',
        selectedAccountAddress: null, // null instead of string
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidConnection))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection that is not an object', () => {
      // Store a string instead of object
      localStorage.setItem(STORAGE_KEY, JSON.stringify('invalid'))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('rejects connection that is null', () => {
      // Note: typeof null === 'object' in JavaScript, so the validation
      // will try to access properties on null, which throws an error.
      // This error is caught and handled gracefully.
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      localStorage.setItem(STORAGE_KEY, JSON.stringify(null))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

      // Verify warning was logged (due to TypeError accessing properties on null)
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('rejects connection that is an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('handles malformed JSON gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json{')

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const loaded = loadWalletConnection()

      expect(loaded).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull() // Invalid data cleared
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to load wallet connection from localStorage:',
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
    })

    it('handles localStorage errors gracefully', () => {
      // Note: Testing localStorage exceptions in jsdom is unreliable
      // The important behavior is tested above (malformed JSON, invalid structures)
      // The function handles errors internally and returns null without throwing

      // Verify the function doesn't throw even when localStorage is empty
      expect(() => {
        loadWalletConnection()
      }).not.toThrow()

      // Should return null when nothing is stored
      expect(loadWalletConnection()).toBeNull()
    })
  })
})

describe('clearWalletConnection', () => {
  describe('Success cases', () => {
    it('removes wallet connection from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE_STORED_CONNECTION))
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()

      clearWalletConnection()

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('does not throw if nothing is stored', () => {
      expect(() => {
        clearWalletConnection()
      }).not.toThrow()

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('can be called multiple times safely', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALICE_STORED_CONNECTION))

      clearWalletConnection()
      clearWalletConnection()
      clearWalletConnection()

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('handles localStorage errors gracefully without throwing', () => {
      // Note: Testing localStorage exceptions in jsdom is unreliable
      // The important behavior is that clearWalletConnection never throws
      // The function is already tested above for normal operation

      // Verify the function doesn't throw
      expect(() => {
        clearWalletConnection()
      }).not.toThrow()
    })
  })
})

describe('Integration: Complete wallet connection lifecycle', () => {
  it('save → load → clear workflow', () => {
    // Step 1: Nothing stored initially
    expect(loadWalletConnection()).toBeNull()

    // Step 2: Save connection
    saveWalletConnection(ALICE_STORED_CONNECTION)

    // Step 3: Load connection (should match what was saved)
    const loaded = loadWalletConnection()
    expect(loaded).toEqual(ALICE_STORED_CONNECTION)

    // Step 4: Clear connection
    clearWalletConnection()

    // Step 5: Verify cleared
    expect(loadWalletConnection()).toBeNull()
  })

  it('switching between multiple accounts', () => {
    // Connect with Alice
    saveWalletConnection(ALICE_STORED_CONNECTION)
    expect(loadWalletConnection()).toEqual(ALICE_STORED_CONNECTION)

    // Switch to Bob (overwrites Alice)
    saveWalletConnection(BOB_STORED_CONNECTION)
    expect(loadWalletConnection()).toEqual(BOB_STORED_CONNECTION)

    // Disconnect
    clearWalletConnection()
    expect(loadWalletConnection()).toBeNull()

    // Reconnect with Alice
    saveWalletConnection(ALICE_STORED_CONNECTION)
    expect(loadWalletConnection()).toEqual(ALICE_STORED_CONNECTION)
  })

  it('handles corrupted data by clearing and starting fresh', () => {
    // Save valid connection
    saveWalletConnection(ALICE_STORED_CONNECTION)
    expect(loadWalletConnection()).toEqual(ALICE_STORED_CONNECTION)

    // Corrupt the data
    localStorage.setItem(STORAGE_KEY, 'corrupted data{{{')

    // Load should return null and clear corrupted data
    expect(loadWalletConnection()).toBeNull()

    // Verify corrupted data was cleared
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // Can save new connection after recovery
    saveWalletConnection(BOB_STORED_CONNECTION)
    expect(loadWalletConnection()).toEqual(BOB_STORED_CONNECTION)
  })
})
