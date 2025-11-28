const WALLET_STORAGE_KEY = 'polka-wallet-connection'

export interface StoredWalletConnection {
  extensionName: string
  selectedAccountAddress: string
}

export function saveWalletConnection(connection: StoredWalletConnection): void {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(connection))
  } catch (error) {
    console.warn('Failed to save wallet connection to localStorage:', error)
  }
}

export function loadWalletConnection(): StoredWalletConnection | null {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored) as StoredWalletConnection

    // Validate the structure
    if (
      typeof parsed === 'object' &&
      typeof parsed.extensionName === 'string' &&
      typeof parsed.selectedAccountAddress === 'string' &&
      parsed.extensionName.length > 0 &&
      parsed.selectedAccountAddress.length > 0
    ) {
      return parsed
    }

    // Invalid data, clear it
    clearWalletConnection()
    return null
  } catch (error) {
    console.warn('Failed to load wallet connection from localStorage:', error)
    clearWalletConnection()
    return null
  }
}

export function clearWalletConnection(): void {
  try {
    localStorage.removeItem(WALLET_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear wallet connection from localStorage:', error)
  }
}
