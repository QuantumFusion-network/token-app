import { useWalletContext } from '@/hooks'

export function WalletConnector() {
  const { availableExtensions, isConnecting, connectWallet, connectionError } =
    useWalletContext()

  if (availableExtensions.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <h2 className="mb-2 text-xl font-semibold">
          No Wallet Extensions Found
        </h2>
        <p className="mb-4 text-gray-600">
          Please install a compatible wallet extension like:
        </p>
        <ul className="space-y-2 text-left">
          <li>• QF Network Extension</li>
          <li>• Talisman</li>
          <li>• SubWallet</li>
        </ul>
      </div>
    )
  }

  return (
    <div className="mx-auto w-sm rounded-lg border p-4">
      <h2 className="mb-4 text-center text-xl font-semibold">Connect Wallet</h2>
      <div className="space-y-2">
        {availableExtensions.map((extension) => (
          <button
            key={extension}
            onClick={() => void connectWallet(extension)}
            disabled={isConnecting}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : `Connect ${extension}`}
          </button>
        ))}
      </div>
      {connectionError && (
        <div className="border-destructive/20 bg-destructive/5 mt-4 space-y-1 rounded-lg border p-3">
          <p className="text-destructive text-sm font-semibold">
            Connection Failed
          </p>
          <p className="text-destructive/80 text-sm">{connectionError}</p>
        </div>
      )}
    </div>
  )
}
