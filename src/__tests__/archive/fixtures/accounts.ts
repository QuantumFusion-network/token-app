/**
 * Test fixtures for QF Network accounts
 *
 * These are realistic Substrate addresses using SS58 format.
 * The addresses follow the pattern used in QF Network testnet.
 */

import type { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import type { StoredWalletConnection } from '@/lib'

/**
 * Primary test account - Alice
 * Use this as the default signer for most tests
 */
export const ALICE_ACCOUNT: InjectedPolkadotAccount = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  polkadotSigner: {} as InjectedPolkadotAccount['polkadotSigner'], // Mock signer
  name: 'Alice',
}

/**
 * Secondary test account - Bob
 * Use this for transfer/recipient scenarios
 */
export const BOB_ACCOUNT: InjectedPolkadotAccount = {
  address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  polkadotSigner: {} as InjectedPolkadotAccount['polkadotSigner'],
  name: 'Bob',
}

/**
 * Third test account - Charlie
 * Use for multi-party scenarios
 */
export const CHARLIE_ACCOUNT: InjectedPolkadotAccount = {
  address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  polkadotSigner: {} as InjectedPolkadotAccount['polkadotSigner'],
  name: 'Charlie',
}

/**
 * Account with no name (edge case)
 */
export const UNNAMED_ACCOUNT: InjectedPolkadotAccount = {
  address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
  polkadotSigner: {} as InjectedPolkadotAccount['polkadotSigner'],
}

/**
 * All test accounts for iteration
 */
export const TEST_ACCOUNTS = [
  ALICE_ACCOUNT,
  BOB_ACCOUNT,
  CHARLIE_ACCOUNT,
  UNNAMED_ACCOUNT,
]

/**
 * Stored wallet connection fixtures
 */
export const ALICE_STORED_CONNECTION: StoredWalletConnection = {
  extensionName: 'polkadot-js',
  selectedAccountAddress: ALICE_ACCOUNT.address,
}

export const BOB_STORED_CONNECTION: StoredWalletConnection = {
  extensionName: 'talisman',
  selectedAccountAddress: BOB_ACCOUNT.address,
}

/**
 * Invalid stored connection (for error testing)
 */
export const INVALID_STORED_CONNECTION = {
  extensionName: '', // Invalid: empty string
  selectedAccountAddress: ALICE_ACCOUNT.address,
}

/**
 * Account info response from System.Account query
 * Represents the native token balance and account data
 */
export const ALICE_ACCOUNT_INFO = {
  consumers: 0,
  data: {
    flags: 0n,
    free: 10000000000000000000n, // 10 QFN (18 decimals)
    frozen: 0n,
    reserved: 0n,
  },
  nonce: 5,
  providers: 1,
  sufficients: 0,
}

export const BOB_ACCOUNT_INFO = {
  consumers: 0,
  data: {
    flags: 0n,
    free: 5000000000000000000n, // 5 QFN
    frozen: 0n,
    reserved: 0n,
  },
  nonce: 2,
  providers: 1,
  sufficients: 0,
}

/**
 * Account info with zero balance (for insufficient balance tests)
 */
export const ZERO_BALANCE_ACCOUNT_INFO = {
  consumers: 0,
  data: {
    flags: 0n,
    free: 0n,
    frozen: 0n,
    reserved: 0n,
  },
  nonce: 0,
  providers: 1,
  sufficients: 0,
}
