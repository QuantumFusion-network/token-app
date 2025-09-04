// src/lib/polkadot.ts
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { dot_asset_hub } from "@polkadot-api/descriptors";

// Create WebSocket provider for Asset Hub
const provider = getWsProvider("wss://polkadot-asset-hub-rpc.polkadot.io");

// Create client and typed API
export const client = createClient(provider);
export const api = client.getTypedApi(dot_asset_hub);
