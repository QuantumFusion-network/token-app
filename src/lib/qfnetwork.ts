// src/lib/qfnetwork.ts
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { qfn as chain } from "@polkadot-api/descriptors";

// const wsUrl = "wss://polkadot-asset-hub-rpc.polkadot.io";
// const wsUrl = "wss://asset-hub-paseo-rpc.n.dwellir.com";
const wsUrl = "wss://test.qfnetwork.xyz";

const provider = getWsProvider(wsUrl);

export const client = createClient(provider);
export const api = client.getTypedApi(chain);
