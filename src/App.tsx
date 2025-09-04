import { useState } from "react";
import { useWalletContext } from "./hooks/useWalletContext";
import { WalletConnector } from "./components/WalletConnector";
import { CreateAsset } from "./components/CreateAsset";
import { AssetList } from "./components/AssetList";
import { MintTokens } from "./components/MintTokens";
import { TransferTokens } from "./components/TransferTokens";
import "./App.css";

type Tab = "assets" | "create" | "mint" | "transfer";

export default function App() {
  const { isConnected, selectedAccount } = useWalletContext();
  const [activeTab, setActiveTab] = useState<Tab>("assets");

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
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || AssetList;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Asset Hub Manager</h1>
            <div className="text-sm text-gray-600">
              Connected:{" "}
              {selectedAccount?.name || selectedAccount?.address.slice(0, 8)}...
            </div>
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
    </div>
  );
}
