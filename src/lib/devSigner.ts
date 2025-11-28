import { getPolkadotSigner } from 'polkadot-api/signer'

import { sr25519CreateDerive } from '@polkadot-labs/hdkd'
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers'

const entropy = mnemonicToEntropy(DEV_PHRASE)
const miniSecret = entropyToMiniSecret(entropy)
const derive = sr25519CreateDerive(miniSecret)

export const getDevSigner = (uri: string) => {
  const keypair = derive(uri)
  return getPolkadotSigner(keypair.publicKey, 'Sr25519', keypair.sign)
}
