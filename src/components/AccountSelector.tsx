import { useWalletContext } from "../hooks/useWalletContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";

export function AccountSelector() {
  const { accounts, selectedAccount, setSelectedAccount, disconnect } = useWalletContext();

  const truncateAddress = (address: string, length = 8) => {
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  };

  const formatAccountDisplay = (account: typeof selectedAccount) => {
    if (!account) return "";

    const displayName = account.name || "Unknown Account";
    const truncatedAddress = truncateAddress(account.address);

    return `${displayName} (${truncatedAddress})`;
  };

  if (!selectedAccount || accounts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedAccount.address}
        onValueChange={(address) => {
          const account = accounts.find(acc => acc.address === address);
          if (account) {
            setSelectedAccount(account);
          }
        }}
      >
        <SelectTrigger className="w-[280px] h-8 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <User className="size-4 text-gray-500" />
            <SelectValue>
              <span className="truncate">
                {formatAccountDisplay(selectedAccount)}
              </span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem
              key={account.address}
              value={account.address}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-start gap-0.5">
                <div className="font-medium text-sm">
                  {account.name || "Unknown Account"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {truncateAddress(account.address, 12)}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={disconnect}
        className="flex items-center gap-1 text-sm hover:text-red-600 hover:bg-red-50"
        title="Disconnect wallet"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </Button>
    </div>
  );
}