/**
 * Common element selectors for E2E tests
 * Using role-based and text-based selectors for maintainability
 */
export const NAV = {
  portfolio: 'button:has-text("Portfolio")',
  createAsset: 'button:has-text("Create Asset")',
  mintTokens: 'button:has-text("Mint Tokens")',
  transfer: 'button:has-text("Transfer")',
  destroyAsset: 'button:has-text("Destroy Asset")',
} as const

export const ACCOUNT = {
  selector: '[data-testid="account-selector"], button:has-text("Alice"), button:has-text("Bob")',
  disconnect: 'button:has-text("Disconnect")',
  balance: 'text=/QF Balance/',
} as const

export const FORMS = {
  createAsset: {
    name: 'input[placeholder="My Token"]',
    symbol: 'input[placeholder="MTK"]',
    decimals: 'input[type="number"]:near(:text("Decimals"))',
    minBalance: 'input:near(:text("Minimum Balance"))',
    initialMint: 'input[placeholder="Amount to mint"]',
    beneficiary: 'input[placeholder*="5GrwvaEF"]',
    submit: 'button:has-text("Create Asset")',
  },
  mintTokens: {
    assetId: 'input[type="number"]:near(:text("Asset ID"))',
    recipient: 'input[placeholder*="5GrwvaEF"]',
    amount: 'input[type="number"]:near(:text("Amount to Mint"))',
    submit: 'button:has-text("Mint Tokens")',
  },
  transfer: {
    assetId: 'input[type="number"]:near(:text("Asset ID"))',
    recipient: 'input[placeholder*="5GrwvaEF"]',
    amount: 'input[type="number"]:near(:text("Amount to Transfer"))',
    submit: 'button:has-text("Transfer Tokens")',
  },
  destroyAsset: {
    assetId: 'input[type="number"]:near(:text("Asset ID"))',
    submit: 'button:has-text("Destroy Asset")',
  },
} as const

export const PORTFOLIO = {
  assetCount: 'h2:has-text("Assets")',
  filterAll: 'button:has-text("All Assets")',
  filterMy: 'button:has-text("My Assets")',
  filterHold: 'button:has-text("Assets I Hold")',
  assetCard: '[data-testid="asset-card"]',
} as const
