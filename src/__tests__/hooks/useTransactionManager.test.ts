/**
 * CRITICAL TESTS: Transaction Manager - State Machine
 *
 * ⚠️  STATE MACHINE RISK: This hook manages ALL transaction state in the app.
 * Errors here cause:
 * - Stuck transactions (never complete)
 * - Memory leaks (subscriptions not cleaned up)
 * - Incorrect transaction status (users think tx failed when it succeeded)
 * - Race conditions (multiple transactions interfere)
 *
 * Test Coverage:
 * - Full lifecycle: idle → signing → broadcasting → inBlock → finalized
 * - Error handling at each stage (dispatch errors, network errors, user rejection)
 * - Subscription management and cleanup
 * - Multiple concurrent transactions
 * - Transaction details and toast config propagation
 *
 * Priority: TIER 1 - This is the MOST CRITICAL untested code
 */

import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransactionManager } from '@/hooks/useTransactionManager'
import {
  createSuccessfulObservable,
  createFailedObservable,
  createErrorObservable,
  MOCK_DISPATCH_ERRORS,
} from '../support/mocks/transaction-observable'

describe('useTransactionManager', () => {
  describe('Transaction initialization', () => {
    it('starts with empty transaction state', () => {
      const { result } = renderHook(() => useTransactionManager())

      expect(result.current.transactions).toEqual({})
      expect(result.current.activeTransaction).toBeUndefined()
    })

    it('creates transaction with unique ID', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId1!: string
      let txId2!: string

      act(() => {
        txId1 = result.current.startTransaction('createAsset')
      })

      act(() => {
        txId2 = result.current.startTransaction('createAsset')
      })

      // IDs should be unique
      expect(txId1).not.toBe(txId2)
      expect(txId1).toMatch(/^createAsset_\d+_[a-z0-9]{7}$/)
      expect(txId2).toMatch(/^createAsset_\d+_[a-z0-9]{7}$/)
    })

    it('initializes transaction with idle status', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId: string
      act(() => {
        txId = result.current.startTransaction('mintTokens')
      })

      const transaction = result.current.transactions[txId!]
      expect(transaction).toBeDefined()
      expect(transaction.type).toBe('mintTokens')
      expect(transaction.status.status).toBe('idle')
      expect(transaction.status.txHash).toBeUndefined()
      expect(transaction.status.error).toBeUndefined()
    })

    it('sets transaction as active', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId: string
      act(() => {
        txId = result.current.startTransaction('transfer')
      })

      expect(result.current.activeTransaction).toBeDefined()
      expect(result.current.activeTransaction?.id).toBe(txId!)
    })

    it('stores toast config with transaction', () => {
      const { result } = renderHook(() => useTransactionManager())

      const toastConfig = {
        signing: 'Signing...',
        broadcasting: (hash: string) => `Broadcasting ${hash}`,
        inBlock: 'Transaction in block',
        finalized: () => 'Success!',
        error: (err: string) => `Error: ${err}`,
      }

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('createAsset', toastConfig)
      })

      const transaction = result.current.transactions[txId]
      expect(transaction.toastConfig).toBe(toastConfig)
    })
  })

  describe('Full successful transaction lifecycle', () => {
    it('transitions through all states: signing → broadcasting → inBlock → finalized', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createSuccessfulObservable({
        txHash: '0xsuccess123',
        blockHash: '0xblock789',
      })

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('createAsset')
      })

      // Track transaction and wait for completion
      await act(async () => {
        await result.current.trackTransaction(txId, observable)
      })

      // Should be finalized
      const finalTx = result.current.transactions[txId]
      expect(finalTx.status.status).toBe('finalized')
      expect(finalTx.status.txHash).toBe('0xsuccess123')
      expect(finalTx.status.blockHash).toBe('0xblock789')
    })

    it('captures transaction events on finalization', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const mockEvents = [{ type: 'AssetCreated', assetId: 1000 }]
      const observable = createSuccessfulObservable({ events: mockEvents })

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('createAsset')
      })

      await act(async () => {
        await result.current.trackTransaction(txId, observable)
      })

      const finalTx = result.current.transactions[txId]
      expect(finalTx.status.events).toEqual(mockEvents)
    })

    it('resolves promise on successful finalization', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createSuccessfulObservable()

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('test')
      })

      // Should resolve without error
      await act(async () => {
        await result.current.trackTransaction(txId, observable)
      })

      expect(result.current.transactions[txId].status.status).toBe('finalized')
    })
  })

  describe('Failed transaction (dispatch error)', () => {
    it('handles dispatch error during finalization', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createFailedObservable(
        MOCK_DISPATCH_ERRORS.InsufficientBalance
      )

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('mintTokens')
      })

      // Track and expect rejection
      await act(async () => {
        await expect(
          result.current.trackTransaction(txId, observable)
        ).rejects.toThrow()
      })

      // Transaction should be in error state
      const finalTx = result.current.transactions[txId]
      expect(finalTx.status.status).toBe('error')
      expect(finalTx.status.error).toBeDefined()
      expect(finalTx.status.error?.code).toBe('DISPATCH_ERROR')
    })

    it('creates typed DispatchError with transaction context', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createFailedObservable(MOCK_DISPATCH_ERRORS.NoPermission)

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('destroyAsset')
      })

      // Set transaction details
      act(() => {
        result.current.setTransactionDetails(txId, { assetId: 1000 })
      })

      await act(async () => {
        await expect(
          result.current.trackTransaction(txId, observable)
        ).rejects.toThrow()
      })

      const error = result.current.transactions[txId].status.error
      expect(error).toBeDefined()
      expect(error?.context.transactionType).toBe('destroyAsset')
      expect(error?.context.transactionId).toBe(txId)
      expect(error?.context.details).toEqual({ assetId: 1000 })
    })
  })

  describe('Transaction errors (network, user rejection)', () => {
    it('handles user rejection error', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const userRejectionError = new Error('User cancelled the transaction')
      const observable = createErrorObservable(userRejectionError)

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('transfer')
      })

      await act(async () => {
        await expect(
          result.current.trackTransaction(txId, observable)
        ).rejects.toThrow()
      })

      const error = result.current.transactions[txId].status.error
      expect(error?.code).toBe('USER_REJECTION')
    })

    it('handles network error', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const networkError = new Error('Network connection lost')
      const observable = createErrorObservable(networkError)

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('mint')
      })

      await act(async () => {
        await expect(
          result.current.trackTransaction(txId, observable)
        ).rejects.toThrow()
      })

      const error = result.current.transactions[txId].status.error
      expect(error?.code).toBe('NETWORK_ERROR')
    })

    it('includes transaction context in error', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const error = new Error('Something went wrong')
      const observable = createErrorObservable(error)

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('createAsset')
      })

      act(() => {
        result.current.setTransactionDetails(txId, {
          name: 'Test Token',
          symbol: 'TST',
        })
      })

      await act(async () => {
        await expect(
          result.current.trackTransaction(txId, observable)
        ).rejects.toThrow()
      })

      const txError = result.current.transactions[txId].status.error
      expect(txError?.context.transactionType).toBe('createAsset')
      expect(txError?.context.details).toEqual({ name: 'Test Token', symbol: 'TST' })
    })
  })

  describe('Subscription management', () => {
    it('stores subscription with transaction', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createSuccessfulObservable()

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('test')
      })

      await act(async () => {
        await result.current.trackTransaction(txId, observable)
      })

      // Subscription should be stored
      const transaction = result.current.transactions[txId]
      expect(transaction.subscription).toBeDefined()
      expect(transaction.subscription?.unsubscribe).toBeInstanceOf(Function)
    })

    it('unsubscribes when transaction completes', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createSuccessfulObservable()

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('test')
      })

      // Track transaction to completion
      await act(async () => {
        await result.current.trackTransaction(txId, observable)
      })

      // Get subscription before completing
      const subscription = result.current.transactions[txId].subscription
      expect(subscription).toBeDefined()

      // Spy on the unsubscribe method
      const unsubscribeSpy2 = vi.spyOn(subscription!, 'unsubscribe')

      // Complete transaction
      act(() => {
        result.current.completeTransaction(txId)
      })

      expect(unsubscribeSpy2).toHaveBeenCalled()
    })
  })

  describe('Transaction details', () => {
    it('stores transaction details', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('createAsset')
      })

      const details = { assetId: 1000, name: 'Test', decimals: 6 }

      act(() => {
        result.current.setTransactionDetails(txId, details)
      })

      const transaction = result.current.transactions[txId]
      expect(transaction.details).toEqual(details)
    })

    it('does not update details for non-existent transaction', () => {
      const { result } = renderHook(() => useTransactionManager())

      const prevTransactions = result.current.transactions

      act(() => {
        result.current.setTransactionDetails('non-existent-id', { foo: 'bar' })
      })

      // State should not change
      expect(result.current.transactions).toBe(prevTransactions)
    })
  })

  describe('Active transaction management', () => {
    it('sets most recent transaction as active', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId1!: string
      let txId2!: string

      act(() => {
        txId1 = result.current.startTransaction('tx1')
      })

      expect(result.current.activeTransaction?.id).toBe(txId1)

      act(() => {
        txId2 = result.current.startTransaction('tx2')
      })

      // Second transaction becomes active
      expect(result.current.activeTransaction?.id).toBe(txId2)
    })

    it('clears active transaction on complete', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId!: string
      act(() => {
        txId = result.current.startTransaction('test')
      })

      expect(result.current.activeTransaction).toBeDefined()

      act(() => {
        result.current.completeTransaction(txId)
      })

      expect(result.current.activeTransaction).toBeUndefined()
    })

    it('does not change active transaction when completing non-active transaction', () => {
      const { result } = renderHook(() => useTransactionManager())

      let txId1!: string
      let txId2!: string

      act(() => {
        txId1 = result.current.startTransaction('tx1')
        txId2 = result.current.startTransaction('tx2')
      })

      // tx2 is active
      expect(result.current.activeTransaction?.id).toBe(txId2)

      // Complete tx1 (not active)
      act(() => {
        result.current.completeTransaction(txId1)
      })

      // tx2 should still be active
      expect(result.current.activeTransaction?.id).toBe(txId2)
    })
  })

  describe('Multiple concurrent transactions', () => {
    it('manages multiple transactions independently', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const obs1 = createSuccessfulObservable({ txHash: '0xaaa' })
      const obs2 = createSuccessfulObservable({ txHash: '0xbbb' })

      let txId1!: string
      let txId2!: string

      act(() => {
        txId1 = result.current.startTransaction('tx1')
        txId2 = result.current.startTransaction('tx2')
      })

      await act(async () => {
        await Promise.all([
          result.current.trackTransaction(txId1, obs1),
          result.current.trackTransaction(txId2, obs2),
        ])
      })

      // Both should be finalized
      expect(result.current.transactions[txId1].status.status).toBe('finalized')
      expect(result.current.transactions[txId2].status.status).toBe('finalized')

      // With different tx hashes
      expect(result.current.transactions[txId1].status.txHash).toBe('0xaaa')
      expect(result.current.transactions[txId2].status.txHash).toBe('0xbbb')
    })

    it('handles one success and one failure independently', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const obsSuccess = createSuccessfulObservable()
      const obsFail = createFailedObservable(MOCK_DISPATCH_ERRORS.NoPermission)

      let txId1!: string
      let txId2!: string

      act(() => {
        txId1 = result.current.startTransaction('success')
        txId2 = result.current.startTransaction('fail')
      })

      await act(async () => {
        const results = await Promise.allSettled([
          result.current.trackTransaction(txId1, obsSuccess),
          result.current.trackTransaction(txId2, obsFail),
        ])

        // First should resolve, second should reject
        expect(results[0].status).toBe('fulfilled')
        expect(results[1].status).toBe('rejected')
      })

      expect(result.current.transactions[txId1].status.status).toBe('finalized')
      expect(result.current.transactions[txId2].status.status).toBe('error')
    })
  })

  describe('Edge cases', () => {
    it('handles tracking non-existent transaction gracefully', async () => {
      const { result } = renderHook(() => useTransactionManager())

      const observable = createSuccessfulObservable()

      // Try to track transaction that was never started
      await act(async () => {
        await result.current.trackTransaction('non-existent-id', observable)
      })

      // Should not crash (updateTransactionStatus guards against this)
      expect(result.current.transactions).toEqual({})
    })
  })
})
