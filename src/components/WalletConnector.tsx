import { useWalletContext } from "../hooks/useWalletContext";

export function WalletConnector() {
  const { availableExtensions, isConnecting, connectWallet } =
    useWalletContext();

  if (availableExtensions.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">
          No Wallet Extensions Found
        </h2>
        <p className="text-gray-600 mb-4">
          Please install a compatible wallet extension like:
        </p>
        <ul className="text-left space-y-2">
          <li>• QF Network Extension</li>
          <li>• Talisman</li>
          <li>• SubWallet</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">Connect Wallet</h2>
      <div className="space-y-2">
        {availableExtensions.map((extension) => (
          <button
            key={extension}
            onClick={() => void connectWallet(extension)}
            disabled={isConnecting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : `Connect ${extension}`}
          </button>
        ))}
      </div>
    </div>
  );
}
