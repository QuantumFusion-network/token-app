import type { ReactNode } from "react";
import { useWallet } from "../hooks/useWallet";
import { WalletContext } from "../hooks/useWalletContext";

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}
