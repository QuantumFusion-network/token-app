import { MultiAddress } from "@polkadot-api/descriptors";
import { type TxCallData } from "polkadot-api";
import { type InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { Binary } from "polkadot-api";
import { api } from "./polkadot";
import { parseUnits } from "../utils/format";

interface CreateAssetParams {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
  initialMintAmount: string;
}

interface MintTokensParams {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

interface TransferTokensParams {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

export const createAssetBatch = (params: CreateAssetParams, signer: InjectedPolkadotAccount) => {
  const assetId = parseInt(params.assetId);
  const minBalance = BigInt(params.minBalance) * 10n ** BigInt(params.decimals);

  const createCall = api.tx.Assets.create({
    id: assetId,
    admin: MultiAddress.Id(signer.address),
    min_balance: minBalance,
  }).decodedCall;

  const metadataCall = api.tx.Assets.set_metadata({
    id: assetId,
    name: Binary.fromText(params.name),
    symbol: Binary.fromText(params.symbol),
    decimals: parseInt(params.decimals),
  }).decodedCall;

  const calls: TxCallData[] = [createCall, metadataCall];

  if (params.initialMintAmount && parseFloat(params.initialMintAmount) > 0) {
    const mintAmount = parseUnits(params.initialMintAmount, parseInt(params.decimals));
    const mintTx = api.tx.Assets.mint({
      id: assetId,
      beneficiary: MultiAddress.Id(signer.address),
      amount: mintAmount,
    }).decodedCall;

    calls.push(mintTx);
  }

  const batch = api.tx.Utility.batch_all({ calls });
  return batch.signSubmitAndWatch(signer.polkadotSigner);
};

export const mintTokens = (params: MintTokensParams, signer: InjectedPolkadotAccount) => {
  const assetId = parseInt(params.assetId);
  const amount = parseUnits(params.amount, params.decimals);

  const tx = api.tx.Assets.mint({
    id: assetId,
    beneficiary: MultiAddress.Id(params.recipient),
    amount,
  });

  return tx.signSubmitAndWatch(signer.polkadotSigner);
};

export const transferTokens = (params: TransferTokensParams, signer: InjectedPolkadotAccount) => {
  const assetId = parseInt(params.assetId);
  const amount = parseUnits(params.amount, params.decimals);

  const tx = api.tx.Assets.transfer({
    id: assetId,
    target: MultiAddress.Id(params.recipient),
    amount,
  });

  return tx.signSubmitAndWatch(signer.polkadotSigner);
};