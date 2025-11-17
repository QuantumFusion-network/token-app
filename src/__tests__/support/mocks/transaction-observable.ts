/**
 * Mock factory for polkadot-api transaction observables
 *
 * Creates controllable observables for testing transaction lifecycle.
 * Simulates the events emitted by api.tx.*.signSubmitAndWatch()
 *
 * Usage:
 * ```ts
 * const observable = createMockObservable([
 *   { type: 'signed' },
 *   { type: 'broadcasted', txHash: '0x123' },
 *   { type: 'finalized', ok: true, txHash: '0x123', block: { hash: '0xabc' }, events: [] }
 * ])
 * ```
 */

import type { TxBroadcastEvent } from 'polkadot-api'

type ObservableHandlers = {
  next: (event: TxBroadcastEvent) => void
  error: (error: Error) => void
}

/**
 * Creates a mock observable that emits events in sequence
 * Events are emitted synchronously for reliable testing with React 19
 */
export const createMockObservable = (events: TxBroadcastEvent[]) => {
  return {
    subscribe: (handlers: ObservableHandlers) => {
      // Emit events synchronously wrapped in microtasks for React state batching
      events.forEach((event) => {
        queueMicrotask(() => {
          handlers.next(event)
        })
      })

      return {
        unsubscribe: () => {
          // No-op for synchronous emissions
        },
      }
    },
  }
}

/**
 * Creates an observable that emits an error after initial events
 */
export const createMockObservableWithError = (
  events: TxBroadcastEvent[],
  error: Error
) => {
  return {
    subscribe: (handlers: ObservableHandlers) => {
      // Emit events synchronously wrapped in microtasks
      events.forEach((event) => {
        queueMicrotask(() => {
          handlers.next(event)
        })
      })

      // Emit error after all events
      queueMicrotask(() => {
        handlers.error(error)
      })

      return {
        unsubscribe: () => {
          // No-op for synchronous emissions
        },
      }
    },
  }
}

/**
 * Creates an observable that completes successfully (full lifecycle)
 */
export const createSuccessfulObservable = (overrides?: {
  txHash?: string
  blockHash?: string
  events?: unknown[]
}) => {
  const txHash = overrides?.txHash || '0x1234567890abcdef'
  const blockHash = overrides?.blockHash || '0xabcdef1234567890'
  const events = overrides?.events || []

  return createMockObservable([
    { type: 'signed' },
    { type: 'broadcasted', txHash },
    { type: 'txBestBlocksState', txHash, found: true },
    {
      type: 'finalized',
      ok: true,
      txHash,
      block: { hash: blockHash, number: 100, index: 0 },
      events,
    },
  ] as TxBroadcastEvent[])
}

/**
 * Creates an observable that fails with a dispatch error during finalization
 */
export const createFailedObservable = (dispatchError: unknown) => {
  const txHash = '0xfailed123'
  const blockHash = '0xblock456'

  return createMockObservable([
    { type: 'signed' },
    { type: 'broadcasted', txHash },
    { type: 'txBestBlocksState', txHash, found: true },
    {
      type: 'finalized',
      ok: false,
      txHash,
      block: { hash: blockHash, number: 100, index: 0 },
      dispatchError,
    },
  ] as TxBroadcastEvent[])
}

/**
 * Creates an observable that throws an error (network failure, user rejection, etc.)
 */
export const createErrorObservable = (error: Error) => {
  return createMockObservableWithError(
    [{ type: 'signed' }, { type: 'broadcasted', txHash: '0xabort' }] as TxBroadcastEvent[],
    error
  )
}

/**
 * Standard dispatch errors for testing
 */
export const MOCK_DISPATCH_ERRORS = {
  InsufficientBalance: {
    type: 'Module',
    value: {
      type: 'Assets',
      value: {
        type: 'BalanceLow',
      },
    },
  },
  NoPermission: {
    type: 'Module',
    value: {
      type: 'Assets',
      value: {
        type: 'NoPermission',
      },
    },
  },
  TokenNoFunds: {
    type: 'Token',
    value: {
      type: 'NoFunds',
    },
  },
}
