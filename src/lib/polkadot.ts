// src/lib/polkadot.ts
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { paseo_asset_hub as assetHub } from "@polkadot-api/descriptors";

// const dot = "wss://polkadot-asset-hub-rpc.polkadot.io";
const paseo = "wss://asset-hub-paseo-rpc.n.dwellir.com";

// Create WebSocket provider for Asset Hub
const provider = getWsProvider(paseo);

// Create client and typed API
export const client = createClient(provider);
export const api = client.getTypedApi(assetHub);
