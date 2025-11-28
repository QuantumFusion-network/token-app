/**
 * Transaction error type system for type-safe error handling
 */

export const TransactionErrorCode = {
  DISPATCH_ERROR: 'DISPATCH_ERROR',
  INVALID_TRANSACTION: 'INVALID_TRANSACTION',
  USER_REJECTION: 'USER_REJECTION',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type TransactionErrorCode =
  (typeof TransactionErrorCode)[keyof typeof TransactionErrorCode]

/**
 * Context attached to errors for debugging and user feedback
 */
export interface TransactionErrorContext {
  transactionType?: string
  transactionId?: string
  details?: unknown
  txHash?: string
  blockHash?: string
}

/**
 * Base error class for all transaction errors
 * Provides structured error information for both users and developers
 */
export abstract class TransactionError extends Error {
  readonly code: TransactionErrorCode
  readonly userMessage: string
  readonly technicalDetails: string
  readonly context: TransactionErrorContext
  readonly timestamp: number

  constructor(
    code: TransactionErrorCode,
    userMessage: string,
    technicalDetails: string,
    context: TransactionErrorContext = {}
  ) {
    super(userMessage)
    this.name = this.constructor.name
    this.code = code
    this.userMessage = userMessage
    this.technicalDetails = technicalDetails
    this.context = context
    this.timestamp = Date.now()

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Serializes error for error tracking services (Sentry, etc.)
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * Error for transactions that were finalized but failed during runtime execution
 * This represents a successful blockchain transaction that failed at the pallet level
 */
export class DispatchError extends TransactionError {
  readonly pallet: string
  readonly errorName: string

  constructor(
    pallet: string,
    errorName: string,
    userMessage: string,
    context: TransactionErrorContext = {}
  ) {
    const technicalDetails = `${pallet}.${errorName}`
    super(
      TransactionErrorCode.DISPATCH_ERROR,
      userMessage,
      technicalDetails,
      context
    )
    this.pallet = pallet
    this.errorName = errorName
  }

  /**
   * Full error identifier in format: Pallet.ErrorName
   */
  get fullError(): string {
    return `${this.pallet}.${this.errorName}`
  }
}

/**
 * Error for transactions that failed validation before finalization
 * Examples: bad signature, bad nonce, insufficient fees
 */
export class InvalidTransactionError extends TransactionError {
  readonly invalidTxType: string
  readonly invalidTxValue: string

  constructor(
    invalidTxType: string,
    invalidTxValue: string,
    userMessage: string,
    context: TransactionErrorContext = {}
  ) {
    const technicalDetails = `${invalidTxType} - ${invalidTxValue}`
    super(
      TransactionErrorCode.INVALID_TRANSACTION,
      userMessage,
      technicalDetails,
      context
    )
    this.invalidTxType = invalidTxType
    this.invalidTxValue = invalidTxValue
  }
}

/**
 * Error for when user rejects transaction in wallet
 */
export class UserRejectionError extends TransactionError {
  constructor(context: TransactionErrorContext = {}) {
    super(
      TransactionErrorCode.USER_REJECTION,
      'Transaction was cancelled',
      'User rejected the transaction signature in wallet',
      context
    )
  }
}

/**
 * Error for network/connection failures
 */
export class NetworkError extends TransactionError {
  readonly originalError: Error

  constructor(originalError: Error, context: TransactionErrorContext = {}) {
    super(
      TransactionErrorCode.NETWORK_ERROR,
      'Network error occurred',
      originalError.message,
      context
    )
    this.originalError = originalError
  }
}

/**
 * Fallback error for unexpected error types
 */
export class UnknownTransactionError extends TransactionError {
  readonly originalError: Error

  constructor(originalError: Error, context: TransactionErrorContext = {}) {
    super(
      TransactionErrorCode.UNKNOWN_ERROR,
      'An unexpected error occurred',
      originalError.message,
      context
    )
    this.originalError = originalError
  }
}
