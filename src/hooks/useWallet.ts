import { useState, useEffect } from "react";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import {
  saveWalletConnection,
  loadWalletConnection,
  clearWalletConnection,
} from "../utils/walletStorage";

export function useWallet() {
  const [extension, setExtension] = useState<InjectedExtension | null>(null);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);
  const [connectedExtensionName, setConnectedExtensionName] = useState<
    string | null
  >(null);

  const availableExtensions = getInjectedExtensions();

  // Auto-reconnect on mount if we have saved connection data
  useEffect(() => {
    const attemptAutoReconnect = async () => {
      const saved = loadWalletConnection();
      if (!saved) {
        setIsAutoConnecting(false);
        return;
      }

      const { extensionName, selectedAccountAddress } = saved;

      // Check if the saved extension is still available
      if (!availableExtensions.includes(extensionName)) {
        console.log(
          `Saved extension '${extensionName}' is no longer available`
        );
        clearWalletConnection();
        setIsAutoConnecting(false);
        return;
      }

      console.log(`Auto-reconnecting to ${extensionName}...`);
      try {
        await connectWallet(extensionName, selectedAccountAddress);
        console.log("Auto-reconnection successful");
      } catch (error) {
        console.log("Auto-reconnection failed:", error);
        clearWalletConnection();
      } finally {
        setIsAutoConnecting(false);
      }
    };

    // Only attempt auto-reconnect if we're not already connected
    if (!extension) {
      attemptAutoReconnect().catch(console.error);
    } else {
      setIsAutoConnecting(false);
    }
  }, [availableExtensions, extension]); // Re-run if available extensions change or connection status changes

  const connectWallet = async (
    extensionName: string,
    selectedAccountAddress?: string
  ) => {
    try {
      setIsConnecting(true);
      console.log("Connecting to extension:", extensionName);
      const ext = await connectInjectedExtension(extensionName);
      console.log("Extension connected:", ext);
      setExtension(ext);

      const availableAccounts = ext.getAccounts();
      console.log("Available accounts:", availableAccounts);
      setAccounts(availableAccounts);

      let accountToSelect = availableAccounts[0];

      // Try to find the previously selected account
      if (selectedAccountAddress) {
        const foundAccount = availableAccounts.find(
          (account) => account.address === selectedAccountAddress
        );
        if (foundAccount) {
          accountToSelect = foundAccount;
          console.log(
            "Restored previously selected account:",
            selectedAccountAddress
          );
        } else {
          console.log(
            "Previously selected account not found, using first available"
          );
        }
      }

      if (accountToSelect) {
        setSelectedAccount(accountToSelect);
        setConnectedExtensionName(extensionName);
        // Save the connection to localStorage
        saveWalletConnection({
          extensionName,
          selectedAccountAddress: accountToSelect.address,
        });
      }

      console.log("Wallet connection completed");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      clearWalletConnection();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    extension?.disconnect();
    setExtension(null);
    setAccounts([]);
    setSelectedAccount(null);
    setConnectedExtensionName(null);
    clearWalletConnection();
  };

  // Custom setSelectedAccount that also persists to localStorage
  const updateSelectedAccount = (account: InjectedPolkadotAccount | null) => {
    setSelectedAccount(account);

    if (account && connectedExtensionName) {
      saveWalletConnection({
        extensionName: connectedExtensionName,
        selectedAccountAddress: account.address,
      });
    }
  };

  const isConnected = !!extension;
  console.log("useWallet - extension:", extension, "isConnected:", isConnected);

  return {
    extension,
    accounts,
    selectedAccount,
    setSelectedAccount: updateSelectedAccount,
    availableExtensions,
    isConnecting: isConnecting || isAutoConnecting,
    connectWallet,
    disconnect,
    isConnected,
  };
}
