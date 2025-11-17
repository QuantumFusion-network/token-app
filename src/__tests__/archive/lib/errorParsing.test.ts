/**
 * Tests for lib/errorParsing.ts - Blockchain error parsing and type safety
 *
 * These functions parse blockchain errors from polkadot-api and convert them
 * into type-safe, user-friendly error messages. Proper error handling ensures:
 * - Users understand what went wrong
 * - Developers can debug issues effectively
 * - Error tracking services receive structured data
 *
 * Test Coverage:
 * - parseDispatchError: Extracts pallet and error name from dispatch errors
 * - createDispatchError: Creates typed DispatchError instances
 * - parseInvalidTxError: Parses InvalidTxError from polkadot-api
 * - createInvalidTransactionError: Creates typed InvalidTransactionError
 * - isUserRejection: Detects when user cancelled a transaction
 * - createTransactionError: Main entry point that routes to appropriate error type
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { InvalidTxError } from 'polkadot-api'
import {
  parseDispatchError,
  createDispatchError,
  parseInvalidTxError,
  createInvalidTransactionError,
  isUserRejection,
  createTransactionError,
} from '@/lib/errorParsing'
import {
  DispatchError,
  InvalidTransactionError,
  UserRejectionError,
  NetworkError,
  UnknownTransactionError,
} from '@/lib/transactionErrors'

// Suppress console.log and console.warn during tests
let consoleLogSpy: ReturnType<typeof vi.spyOn>
let consoleWarnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleLogSpy.mockRestore()
  consoleWarnSpy.mockRestore()
})

describe('parseDispatchError', () => {
  describe('Module dispatch errors (pallet-based)', () => {
    it('parses Assets.InsufficientBalance error correctly', () => {
      const moduleError = {
        type: 'Module',
        value: {
          type: 'Assets',
          value: {
            type: 'BalanceLow',
          },
        },
      }

      const parsed = parseDispatchError(moduleError)

      expect(parsed).toEqual({
        pallet: 'Assets',
        errorName: 'BalanceLow',
      })
    })

    it('parses Assets.NoPermission error correctly', () => {
      const moduleError = {
        type: 'Module',
        value: {
          type: 'Assets',
          value: {
            type: 'NoPermission',
          },
        },
      }

      const parsed = parseDispatchError(moduleError)

      expect(parsed).toEqual({
        pallet: 'Assets',
        errorName: 'NoPermission',
      })
    })

    it('parses Assets.AssetNotLive error correctly', () => {
      const moduleError = {
        type: 'Module',
        value: {
          type: 'Assets',
          value: {
            type: 'AssetNotLive',
          },
        },
      }

      const parsed = parseDispatchError(moduleError)

      expect(parsed).toEqual({
        pallet: 'Assets',
        errorName: 'AssetNotLive',
      })
    })

    it('parses System pallet errors', () => {
      const moduleError = {
        type: 'Module',
        value: {
          type: 'System',
          value: {
            type: 'NonceOverflow',
          },
        },
      }

      const parsed = parseDispatchError(moduleError)

      expect(parsed).toEqual({
        pallet: 'System',
        errorName: 'NonceOverflow',
      })
    })

    it('parses Balances pallet errors', () => {
      const moduleError = {
        type: 'Module',
        value: {
          type: 'Balances',
          value: {
            type: 'InsufficientBalance',
          },
        },
      }

      const parsed = parseDispatchError(moduleError)

      expect(parsed).toEqual({
        pallet: 'Balances',
        errorName: 'InsufficientBalance',
      })
    })
  })

  describe('Token dispatch errors (system-level)', () => {
    it('parses Token.NoFunds error correctly', () => {
      const tokenError = {
        type: 'Token',
        value: {
          type: 'NoFunds',
        },
      }

      const parsed = parseDispatchError(tokenError)

      expect(parsed).toEqual({
        pallet: 'Token',
        errorName: 'NoFunds',
      })
    })

    it('parses Token.BelowMinimum error correctly', () => {
      const tokenError = {
        type: 'Token',
        value: {
          type: 'BelowMinimum',
        },
      }

      const parsed = parseDispatchError(tokenError)

      expect(parsed).toEqual({
        pallet: 'Token',
        errorName: 'BelowMinimum',
      })
    })

    it('parses Token.CannotCreate error correctly', () => {
      const tokenError = {
        type: 'Token',
        value: {
          type: 'CannotCreate',
        },
      }

      const parsed = parseDispatchError(tokenError)

      expect(parsed).toEqual({
        pallet: 'Token',
        errorName: 'CannotCreate',
      })
    })
  })

  describe('Invalid error structures', () => {
    it('returns null for non-object errors', () => {
      expect(parseDispatchError(null)).toBeNull()
      expect(parseDispatchError(undefined)).toBeNull()
      expect(parseDispatchError('string error')).toBeNull()
      expect(parseDispatchError(123)).toBeNull()
      expect(parseDispatchError(true)).toBeNull()
    })

    it('returns null for errors with wrong type field', () => {
      const invalidError = {
        type: 'UnknownType',
        value: {},
      }

      const parsed = parseDispatchError(invalidError)

      expect(parsed).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Unknown dispatch error structure:',
        invalidError
      )
    })

    it('returns null for errors missing value field', () => {
      const invalidError = {
        type: 'Module',
        // Missing value field
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })

    it('returns null for errors with non-object value', () => {
      const invalidError = {
        type: 'Module',
        value: 'not an object',
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })

    it('returns null for Module errors missing nested value', () => {
      const invalidError = {
        type: 'Module',
        value: {
          type: 'Assets',
          // Missing nested value field
        },
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })

    it('returns null for Module errors with non-object nested value', () => {
      const invalidError = {
        type: 'Module',
        value: {
          type: 'Assets',
          value: 'not an object',
        },
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })

    it('returns null for Module errors missing nested type', () => {
      const invalidError = {
        type: 'Module',
        value: {
          type: 'Assets',
          value: {
            // Missing type field
          },
        },
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })

    it('returns null for Token errors with non-string error name', () => {
      const invalidError = {
        type: 'Token',
        value: {
          type: 123, // Should be string
        },
      }

      expect(parseDispatchError(invalidError)).toBeNull()
    })
  })
})

describe('createDispatchError', () => {
  it('creates DispatchError from valid Module error', () => {
    const moduleError = {
      type: 'Module',
      value: {
        type: 'Assets',
        value: {
          type: 'BalanceLow',
        },
      },
    }

    const error = createDispatchError(moduleError)

    expect(error).toBeInstanceOf(DispatchError)
    expect(error.pallet).toBe('Assets')
    expect(error.errorName).toBe('BalanceLow')
    expect(error.code).toBe('DISPATCH_ERROR')
    expect(error.userMessage).toBeTruthy()
  })

  it('creates DispatchError from valid Token error', () => {
    const tokenError = {
      type: 'Token',
      value: {
        type: 'NoFunds',
      },
    }

    const error = createDispatchError(tokenError)

    expect(error).toBeInstanceOf(DispatchError)
    expect(error.pallet).toBe('Token')
    expect(error.errorName).toBe('NoFunds')
    expect(error.code).toBe('DISPATCH_ERROR')
  })

  it('creates fallback DispatchError for unknown error structure', () => {
    const unknownError = {
      type: 'UnknownType',
      value: {},
    }

    const error = createDispatchError(unknownError)

    expect(error).toBeInstanceOf(DispatchError)
    expect(error.pallet).toBe('Unknown')
    expect(error.errorName).toBe('Unknown')
    expect(error.userMessage).toBe('Transaction failed during execution')
  })

  it('includes context in created error', () => {
    const moduleError = {
      type: 'Module',
      value: {
        type: 'Assets',
        value: {
          type: 'NoPermission',
        },
      },
    }

    const context = {
      transactionType: 'mintTokens',
      transactionId: 'tx-123',
    }

    const error = createDispatchError(moduleError, context)

    expect(error.context).toEqual(context)
  })
})

describe('parseInvalidTxError', () => {
  it('parses InvalidTxError with Payment type correctly', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'Payment',
        },
      },
    } as InvalidTxError

    const parsed = parseInvalidTxError(invalidTxError)

    expect(parsed).toEqual({
      type: 'Invalid',
      value: 'Payment',
    })
  })

  it('parses InvalidTxError with Stale type correctly', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'Stale',
        },
      },
    } as InvalidTxError

    const parsed = parseInvalidTxError(invalidTxError)

    expect(parsed).toEqual({
      type: 'Invalid',
      value: 'Stale',
    })
  })

  it('parses InvalidTxError with BadProof type correctly', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'BadProof',
        },
      },
    } as InvalidTxError

    const parsed = parseInvalidTxError(invalidTxError)

    expect(parsed).toEqual({
      type: 'Invalid',
      value: 'BadProof',
    })
  })

  it('returns fallback values for malformed InvalidTxError', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: 'not an object',
    } as unknown as InvalidTxError

    const parsed = parseInvalidTxError(invalidTxError)

    expect(parsed).toEqual({
      type: 'InvalidTxError',
      value: 'Unknown',
    })
  })
})

describe('createInvalidTransactionError', () => {
  it('creates InvalidTransactionError with Payment message', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'Payment',
        },
      },
    } as InvalidTxError

    const error = createInvalidTransactionError(invalidTxError)

    expect(error).toBeInstanceOf(InvalidTransactionError)
    expect(error.code).toBe('INVALID_TRANSACTION')
    expect(error.userMessage).toBe('Insufficient balance to pay transaction fees')
  })

  it('creates InvalidTransactionError with Stale message', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'Stale',
        },
      },
    } as InvalidTxError

    const error = createInvalidTransactionError(invalidTxError)

    expect(error.userMessage).toBe('Transaction is outdated, please try again')
  })

  it('creates InvalidTransactionError with BadProof message', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'BadProof',
        },
      },
    } as InvalidTxError

    const error = createInvalidTransactionError(invalidTxError)

    expect(error.userMessage).toBe('Invalid transaction signature')
  })

  it('creates InvalidTransactionError with generic message for unknown types', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'UnknownType',
        },
      },
    } as InvalidTxError

    const error = createInvalidTransactionError(invalidTxError)

    expect(error.userMessage).toBe('Transaction is invalid')
  })

  it('includes context in created error', () => {
    const invalidTxError = {
      name: 'InvalidTxError',
      error: {
        type: 'Invalid',
        value: {
          type: 'Payment',
        },
      },
    } as InvalidTxError

    const context = {
      transactionType: 'transfer',
      transactionId: 'tx-456',
    }

    const error = createInvalidTransactionError(invalidTxError, context)

    expect(error.context).toEqual(context)
  })
})

describe('isUserRejection', () => {
  describe('Detects user rejection patterns', () => {
    it('detects "cancel" in error message (case insensitive)', () => {
      expect(isUserRejection(new Error('User cancelled the transaction'))).toBe(true)
      expect(isUserRejection(new Error('Cancelled by user'))).toBe(true)
      expect(isUserRejection(new Error('CANCEL'))).toBe(true)
    })

    it('detects "reject" in error message (case insensitive)', () => {
      expect(isUserRejection(new Error('User rejected the request'))).toBe(true)
      expect(isUserRejection(new Error('Rejected'))).toBe(true)
      expect(isUserRejection(new Error('REJECT'))).toBe(true)
    })

    it('detects "denied" in error message (case insensitive)', () => {
      expect(isUserRejection(new Error('Access denied by user'))).toBe(true)
      expect(isUserRejection(new Error('User denied the transaction'))).toBe(true)
      expect(isUserRejection(new Error('DENIED'))).toBe(true)
    })

    it('detects "user abort" in error message', () => {
      expect(isUserRejection(new Error('User abort'))).toBe(true)
      // Note: "aborted by user" doesn't contain "user abort" so it won't match
      // The function looks for the exact substring "user abort", not just "abort"
      expect(isUserRejection(new Error('Transaction user abort'))).toBe(true)
    })
  })

  describe('Does not detect non-rejection errors', () => {
    it('returns false for network errors', () => {
      expect(isUserRejection(new Error('Network connection failed'))).toBe(false)
    })

    it('returns false for insufficient balance errors', () => {
      expect(isUserRejection(new Error('Insufficient balance'))).toBe(false)
    })

    it('returns false for generic errors', () => {
      expect(isUserRejection(new Error('Something went wrong'))).toBe(false)
      expect(isUserRejection(new Error('Transaction failed'))).toBe(false)
    })

    it('returns false for empty error messages', () => {
      expect(isUserRejection(new Error(''))).toBe(false)
    })
  })
})

describe('createTransactionError', () => {
  describe('Routes to appropriate error type', () => {
    it('creates UserRejectionError for user cancellation', () => {
      const error = new Error('User cancelled the transaction')

      const txError = createTransactionError(error)

      expect(txError).toBeInstanceOf(UserRejectionError)
      expect(txError.code).toBe('USER_REJECTION')
    })

    it('creates InvalidTransactionError for InvalidTxError', () => {
      // Create actual InvalidTxError instance (polkadot-api class)
      const invalidTxError = new InvalidTxError({
        type: 'Invalid',
        value: {
          type: 'Payment',
        },
      })

      const txError = createTransactionError(invalidTxError)

      expect(txError).toBeInstanceOf(InvalidTransactionError)
      expect(txError.code).toBe('INVALID_TRANSACTION')
    })

    it('creates NetworkError for network-related errors', () => {
      const networkErrors = [
        new Error('network connection lost'),
        new Error('RPC call failed'),
        new Error('connection timeout'),
        new Error('timeout occurred'),
      ]

      networkErrors.forEach((error) => {
        const txError = createTransactionError(error)

        expect(txError).toBeInstanceOf(NetworkError)
        expect(txError.code).toBe('NETWORK_ERROR')
      })
    })

    it('creates UnknownTransactionError for unrecognized errors', () => {
      const error = new Error('Something unexpected happened')

      const txError = createTransactionError(error)

      expect(txError).toBeInstanceOf(UnknownTransactionError)
      expect(txError.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('Priority order (user rejection checked first)', () => {
    it('prioritizes user rejection over network errors', () => {
      // Error message contains both "cancelled" and "network"
      const error = new Error('User cancelled due to network issues')

      const txError = createTransactionError(error)

      // Should be UserRejectionError (checked first)
      expect(txError).toBeInstanceOf(UserRejectionError)
      expect(txError).not.toBeInstanceOf(NetworkError)
    })
  })

  describe('Context propagation', () => {
    it('includes context in all error types', () => {
      const context = {
        transactionType: 'createAsset',
        transactionId: 'tx-789',
      }

      const userRejectionError = new Error('User rejected')
      const txError1 = createTransactionError(userRejectionError, context)
      expect(txError1.context).toEqual(context)

      const networkError = new Error('Network error')
      const txError2 = createTransactionError(networkError, context)
      expect(txError2.context).toEqual(context)

      const unknownError = new Error('Unknown error')
      const txError3 = createTransactionError(unknownError, context)
      expect(txError3.context).toEqual(context)
    })
  })
})

describe('Error instance properties', () => {
  it('DispatchError has correct structure', () => {
    const error = new DispatchError('Assets', 'NoPermission', 'Permission denied')

    expect(error.name).toBe('DispatchError')
    expect(error.code).toBe('DISPATCH_ERROR')
    expect(error.pallet).toBe('Assets')
    expect(error.errorName).toBe('NoPermission')
    expect(error.userMessage).toBe('Permission denied')
    expect(error.technicalDetails).toBe('Assets.NoPermission')
    expect(error.timestamp).toBeGreaterThan(0)
    expect(error.context).toEqual({})
  })

  it('Error instances are serializable to JSON', () => {
    const error = new DispatchError(
      'Assets',
      'BalanceLow',
      'Insufficient balance',
      {
        transactionId: 'tx-123',
      }
    )

    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'DispatchError')
    expect(json).toHaveProperty('code', 'DISPATCH_ERROR')
    expect(json).toHaveProperty('userMessage', 'Insufficient balance')
    expect(json).toHaveProperty('technicalDetails', 'Assets.BalanceLow')
    expect(json).toHaveProperty('context')
    expect(json).toHaveProperty('timestamp')
    expect(json).toHaveProperty('stack')
  })
})
