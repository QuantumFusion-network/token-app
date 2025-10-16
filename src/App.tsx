import { useState } from "react";
import { useWalletContext } from "./hooks/useWalletContext";
import { useTransactionToasts } from "./hooks/useTransactionToasts";
import { WalletConnector } from "./components/WalletConnector";
import { CreateAsset } from "./components/CreateAsset";
import { AssetList } from "./components/AssetList";
import { MintTokens } from "./components/MintTokens";
import { TransferTokens } from "./components/TransferTokens";
import { DestroyAsset } from "./components/DestroyAsset";
import { AccountSelector } from "./components/AccountSelector";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

type Tab = "assets" | "create" | "mint" | "transfer" | "destroy";

export default function App() {
  const { isConnected } = useWalletContext();
  const [activeTab, setActiveTab] = useState<Tab>("assets");

  // Initialize transaction toasts
  useTransactionToasts();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <WalletConnector />
      </div>
    );
  }

  const tabs = [
    { id: "assets" as const, label: "Assets", component: AssetList },
    { id: "create" as const, label: "Create", component: CreateAsset },
    { id: "mint" as const, label: "Mint", component: MintTokens },
    { id: "transfer" as const, label: "Transfer", component: TransferTokens },
    { id: "destroy" as const, label: "Destroy", component: DestroyAsset },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || AssetList;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">QF Network Manager</h1>
            <AccountSelector />
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>
      <Toaster />
    </div>
  );
}
