import { useState } from "react";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";

export function useWallet() {
  const [extension, setExtension] = useState<InjectedExtension | null>(null);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const availableExtensions = getInjectedExtensions();

  const connectWallet = async (extensionName: string) => {
    try {
      setIsConnecting(true);
      console.log("Connecting to extension:", extensionName);
      const ext = await connectInjectedExtension(extensionName);
      console.log("Extension connected:", ext);
      setExtension(ext);

      const availableAccounts = ext.getAccounts();
      console.log("Available accounts:", availableAccounts);
      setAccounts(availableAccounts);

      if (availableAccounts.length > 0) {
        setSelectedAccount(availableAccounts[0]);
      }
      console.log("Wallet connection completed");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    extension?.disconnect();
    setExtension(null);
    setAccounts([]);
    setSelectedAccount(null);
  };

  const isConnected = !!extension;
  console.log("useWallet - extension:", extension, "isConnected:", isConnected);

  return {
    extension,
    accounts,
    selectedAccount,
    setSelectedAccount,
    availableExtensions,
    isConnecting,
    connectWallet,
    disconnect,
    isConnected,
  };
}
