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
import { Button } from "./components/ui/button";
import {
  LayoutDashboard,
  Plus,
  Coins,
  Send,
  Trash2
} from "lucide-react";
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

  const navigationItems = [
    {
      id: "assets" as const,
      label: "Portfolio",
      icon: LayoutDashboard,
      component: AssetList,
      section: "main"
    },
    {
      id: "create" as const,
      label: "Create Asset",
      icon: Plus,
      component: CreateAsset,
      section: "main"
    },
    {
      id: "mint" as const,
      label: "Mint Tokens",
      icon: Coins,
      component: MintTokens,
      section: "operations"
    },
    {
      id: "transfer" as const,
      label: "Transfer",
      icon: Send,
      component: TransferTokens,
      section: "operations"
    },
    {
      id: "destroy" as const,
      label: "Destroy Asset",
      icon: Trash2,
      component: DestroyAsset,
      section: "admin"
    },
  ];

  const ActiveComponent =
    navigationItems.find((item) => item.id === activeTab)?.component || AssetList;


  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-br from-muted/20 to-muted/40">
          <h1 className="text-xl font-bold text-foreground">QF Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Asset Manager</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start h-10 px-3 ${
                    activeTab === item.id
                      ? ""
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with account selector */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">Connected to QF Network</span>
            </div>
            <AccountSelector />
          </div>
        </header>

        <main className="flex-1 p-4 bg-muted/20">
          <ActiveComponent />
        </main>
      </div>

      <Toaster toastOptions={{ duration: 30_000 }} />
    </div>
  );
}
