import { getPolkadotSigner, type PolkadotSigner } from 'polkadot-api/signer'

import { sr25519CreateDerive } from '@polkadot-labs/hdkd'
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers'

const entropy = mnemonicToEntropy(DEV_PHRASE)
const miniSecret = entropyToMiniSecret(entropy)
const derive = sr25519CreateDerive(miniSecret)

export const getDevSigner = (uri: string) => {
  const keypair = derive(uri)
  return getPolkadotSigner(keypair.publicKey, 'Sr25519', (input) =>
    keypair.sign(input)
  )
}

// Dev account types and utilities
export type DevAccountName =
  | 'Alice'
  | 'Bob'
  | 'Charlie'
  | 'Dave'
  | 'Eve'
  | 'Ferdie'

export interface DevAccount {
  name: DevAccountName
  address: string
  polkadotSigner: PolkadotSigner
}

export const DEV_ACCOUNT_NAMES: DevAccountName[] = [
  'Alice',
  'Bob',
  'Charlie',
  'Dave',
  'Eve',
  'Ferdie',
]

export function getDevAccount(name: DevAccountName): DevAccount {
  const keypair = derive(`//${name}`)
  const signer = getPolkadotSigner(keypair.publicKey, 'Sr25519', (input) =>
    keypair.sign(input)
  )
  return {
    name,
    address: ss58Address(keypair.publicKey),
    polkadotSigner: signer,
  }
}

export function getAllDevAccounts(): DevAccount[] {
  return DEV_ACCOUNT_NAMES.map(getDevAccount)
}
