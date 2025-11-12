/**
 * Maps pallet dispatch errors to user-friendly messages
 * Provides actionable guidance where possible
 */

interface ErrorMessageMap {
  [pallet: string]: {
    [errorName: string]: string
  }
}

/**
 * User-friendly error messages for common pallet errors
 */
const ERROR_MESSAGES: ErrorMessageMap = {
  Token: {
    CannotCreate:
      "Can't mint to this account - add more balance or use an account with fewer assets",
    NoFunds: 'Insufficient funds to complete this operation',
    Frozen: 'Token is frozen and cannot be used',
    Underflow: 'Operation would result in negative balance',
    Overflow: 'Operation would exceed maximum token supply',
    UnknownAsset: 'Token does not exist',
  },
  Assets: {
    NoPermission: "You don't have permission to perform this operation",
    AssetNotLive:
      'This asset is not active and cannot be used for transactions',
    BalanceLow: 'Insufficient asset balance for this operation',
    NoAccount: 'Account does not exist for this asset',
    InUse: 'Asset is currently in use and cannot be modified',
    MinBalanceZero: 'Minimum balance must be greater than zero',
    BadWitness: 'Invalid account or balance information provided',
    IncorrectStatus: 'Asset is in an incorrect state for this operation',
    NotFrozen: 'Asset must be frozen before performing this operation',
    CallbackFailed: 'Asset callback operation failed',
    Unknown: 'Asset with this ID does not exist',
    Frozen: 'Asset or account is frozen',
    WrongOwner: 'You are not the owner of this asset',
    LiveAsset: 'Asset is still active and has accounts or approvals',
    BadMetadata: 'Invalid metadata provided',
    Unapproved: 'Operation requires approval from asset owner',
  },
  Balances: {
    InsufficientBalance: 'Insufficient balance to complete this transaction',
    VestingBalance: 'Balance is locked in vesting schedule',
    LiquidityRestrictions: 'Balance is locked and cannot be transferred',
    ExistentialDeposit: 'Balance would drop below minimum required amount',
    Expendability: 'Account balance cannot be reduced for this operation',
    KeepAlive: 'Transaction would remove account, keeping minimum balance',
    ExistingVestingSchedule: 'Account already has a vesting schedule',
    DeadAccount: 'Target account does not exist',
    TooManyReserves: 'Account has too many reserve locks',
    TooManyHolds: 'Account has too many holds',
    TooManyFreezes: 'Account has too many freezes',
  },
  System: {
    InvalidSpecName: 'Invalid runtime specification name',
    SpecVersionNeedsToIncrease: 'Runtime version must be higher',
    FailedToExtractRuntimeVersion: 'Cannot determine runtime version',
    NonDefaultComposite: 'Non-default composite detected',
    NonZeroRefCount: 'Account has non-zero reference count',
    CallFiltered: 'This call is not allowed',
  },
  Utility: {
    TooManyCalls: 'Batch contains too many transactions',
  },
}

/**
 * Gets a user-friendly error message for a pallet error
 * Falls back to technical message if no mapping exists
 */
export function getErrorMessage(pallet: string, errorName: string): string {
  const palletErrors = ERROR_MESSAGES[pallet]

  if (palletErrors?.[errorName]) {
    return palletErrors[errorName]
  }

  // Fallback to formatted technical error
  return `Transaction failed: ${pallet}.${errorName}`
}

/**
 * Checks if an error has a user-friendly message mapping
 */
export function hasErrorMessage(pallet: string, errorName: string): boolean {
  return Boolean(ERROR_MESSAGES[pallet]?.[errorName])
}

/**
 * Gets all mapped pallets
 */
export function getMappedPallets(): string[] {
  return Object.keys(ERROR_MESSAGES)
}
