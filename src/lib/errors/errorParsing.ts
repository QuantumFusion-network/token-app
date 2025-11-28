/**
 * Type guards and safe parsers for blockchain errors
 * All functions are type-safe and return typed results without throwing
 */

import { InvalidTxError } from 'polkadot-api'

import { getErrorMessage } from './errorMessages'
import {
  DispatchError,
  InvalidTransactionError,
  NetworkError,
  UnknownTransactionError,
  UserRejectionError,
  type TransactionErrorContext,
} from './transactionErrors'

/**
 * Shape of a Module dispatch error from polkadot-api
 */
interface ModuleDispatchError {
  type: 'Module'
  value: {
    type: string // Pallet name
    value: {
      type: string // Error name
    }
  }
}

/**
 * Shape of a Token dispatch error from polkadot-api
 */
interface TokenDispatchError {
  type: 'Token'
  value: {
    type: string // Error name
  }
}

/**
 * Result of parsing a dispatch error
 */
interface ParsedDispatchError {
  pallet: string
  errorName: string
}

/**
 * Type guard to check if an error has the Module dispatch error shape
 */
function isModuleDispatchError(error: unknown): error is ModuleDispatchError {
  if (typeof error !== 'object' || error === null) return false

  const e = error as Record<string, unknown>

  if (e.type !== 'Module') return false

  if (typeof e.value !== 'object' || e.value === null) return false

  const value = e.value as Record<string, unknown>

  if (typeof value.type !== 'string') return false

  if (typeof value.value !== 'object' || value.value === null) return false

  const innerValue = value.value as Record<string, unknown>

  return typeof innerValue.type === 'string'
}

/**
 * Type guard to check if an error has the Token dispatch error shape
 */
function isTokenDispatchError(error: unknown): error is TokenDispatchError {
  if (typeof error !== 'object' || error === null) return false

  const e = error as Record<string, unknown>

  if (e.type !== 'Token') return false

  if (typeof e.value !== 'object' || e.value === null) return false

  const value = e.value as Record<string, unknown>

  return typeof value.type === 'string'
}

/**
 * Safely parses a dispatch error to extract pallet and error name
 * Returns null if the error doesn't match the expected shape
 */
export function parseDispatchError(
  dispatchError: unknown
): ParsedDispatchError | null {
  // Handle Module errors (pallet-based)
  if (isModuleDispatchError(dispatchError)) {
    return {
      pallet: dispatchError.value.type,
      errorName: dispatchError.value.value.type,
    }
  }

  // Handle Token errors (system-level)
  if (isTokenDispatchError(dispatchError)) {
    return {
      pallet: 'Token',
      errorName: dispatchError.value.type,
    }
  }

  // Log unknown error structures for future debugging
  console.warn('Unknown dispatch error structure:', dispatchError)
  return null
}

/**
 * Creates a DispatchError from a raw dispatch error object
 */
export function createDispatchError(
  dispatchError: unknown,
  context: TransactionErrorContext = {}
): DispatchError {
  const parsed = parseDispatchError(dispatchError)

  if (!parsed) {
    // Fallback for non-Module dispatch errors
    return new DispatchError(
      'Unknown',
      'Unknown',
      'Transaction failed during execution',
      context
    )
  }

  const userMessage = getErrorMessage(parsed.pallet, parsed.errorName)

  return new DispatchError(
    parsed.pallet,
    parsed.errorName,
    userMessage,
    context
  )
}

/**
 * Shape of InvalidTxError.error property
 */
interface InvalidTxErrorDetails {
  type: string
  value: {
    type: string
  }
}

/**
 * Type guard for InvalidTxError.error property
 */
function isInvalidTxErrorDetails(
  error: unknown
): error is InvalidTxErrorDetails {
  if (typeof error !== 'object' || error === null) return false

  const e = error as Record<string, unknown>

  if (typeof e.type !== 'string') return false

  if (typeof e.value !== 'object' || e.value === null) return false

  const value = e.value as Record<string, unknown>

  return typeof value.type === 'string'
}

/**
 * Safely parses InvalidTxError to extract type and value
 */
export function parseInvalidTxError(error: InvalidTxError): {
  type: string
  value: string
} {
  if (!isInvalidTxErrorDetails(error.error)) {
    return {
      type: error.name,
      value: 'Unknown',
    }
  }

  return {
    type: error.error.type,
    value: error.error.value.type,
  }
}

/**
 * Creates an InvalidTransactionError from polkadot-api InvalidTxError
 */
export function createInvalidTransactionError(
  error: InvalidTxError,
  context: TransactionErrorContext = {}
): InvalidTransactionError {
  const parsed = parseInvalidTxError(error)

  // Map common invalid transaction errors to user-friendly messages
  let userMessage = 'Transaction is invalid'

  if (parsed.value === 'Payment') {
    userMessage = 'Insufficient balance to pay transaction fees'
  } else if (parsed.value === 'Stale') {
    userMessage = 'Transaction is outdated, please try again'
  } else if (parsed.value === 'BadProof') {
    userMessage = 'Invalid transaction signature'
  }

  return new InvalidTransactionError(
    parsed.type,
    parsed.value,
    userMessage,
    context
  )
}

/**
 * Detects if an error is likely a user rejection
 * Common patterns: "Cancelled", "User rejected", "User denied"
 */
export function isUserRejection(error: Error): boolean {
  const message = error.message.toLowerCase()
  return (
    message.includes('cancel') ||
    message.includes('reject') ||
    message.includes('denied') ||
    message.includes('user abort')
  )
}

/**
 * Creates appropriate TransactionError from any error
 * This is the main entry point for error handling in TransactionContext
 */
export function createTransactionError(
  error: Error,
  context: TransactionErrorContext = {}
):
  | InvalidTransactionError
  | UserRejectionError
  | NetworkError
  | UnknownTransactionError {
  // Check for user rejection patterns
  if (isUserRejection(error)) {
    return new UserRejectionError(context)
  }

  // Handle InvalidTxError specifically
  if (error instanceof InvalidTxError) {
    return createInvalidTransactionError(error, context)
  }

  // Check for network-related errors
  if (
    error.message.includes('network') ||
    error.message.includes('connection') ||
    error.message.includes('timeout') ||
    error.message.includes('RPC')
  ) {
    return new NetworkError(error, context)
  }

  // Fallback to unknown error
  return new UnknownTransactionError(error, context)
}
