import { useState } from 'react'

import { Globe } from 'lucide-react'

import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useConnectionContext } from '@/hooks'
import { loadLocalUrl, type NetworkId } from '@/lib'

export function NetworkSelector() {
  const { networkId, currentUrl, availableNetworks, switchNetwork, isConnected } =
    useConnectionContext()

  const [localUrlInput, setLocalUrlInput] = useState(() => loadLocalUrl())

  const handleNetworkChange = (newNetworkId: string) => {
    if (newNetworkId === 'local') {
      switchNetwork(newNetworkId as NetworkId, localUrlInput)
    } else {
      switchNetwork(newNetworkId as NetworkId)
    }
  }

  const handleLocalUrlSubmit = () => {
    if (networkId === 'local' && localUrlInput !== currentUrl) {
      switchNetwork('local', localUrlInput)
    }
  }

  const handleLocalUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLocalUrlSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={networkId} onValueChange={handleNetworkChange}>
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-destructive'
              }`}
            />
            <Globe className="size-4 text-gray-500" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableNetworks.map((network) => (
            <SelectItem
              key={network.id}
              value={network.id}
              className="cursor-pointer"
            >
              <div className="text-sm font-medium">{network.name}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {networkId === 'local' && (
        <Input
          type="text"
          value={localUrlInput}
          onChange={(e) => setLocalUrlInput(e.target.value)}
          onBlur={handleLocalUrlSubmit}
          onKeyDown={handleLocalUrlKeyDown}
          placeholder="ws://127.0.0.1:9944"
          className="h-8 w-[200px] text-sm"
        />
      )}
    </div>
  )
}
