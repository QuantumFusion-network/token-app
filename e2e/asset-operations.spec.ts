import { expect, test } from '@playwright/test'

import { DEV_ACCOUNTS } from './fixtures/accounts'
import {
  CreateAssetPage,
  DestroyAssetPage,
  MintTokensPage,
  PortfolioPage,
  TransferPage,
} from './pages'

test.describe('Asset Operations', () => {
  test.describe('Create Asset', () => {
    let createAssetPage: CreateAssetPage

    test.beforeEach(async ({ page }) => {
      createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()
    })

    test('creates asset with name, symbol, decimals', async () => {
      await createAssetPage.fillForm({
        name: 'Test Token',
        symbol: 'TST',
        decimals: '8',
        minBalance: '1',
      })

      // Transaction details preview should show decimals
      await createAssetPage.expectDecimalsInPreview('8')

      // Submit form
      await createAssetPage.submit()

      // Wait for transaction to complete
      await createAssetPage.waitForTransactionSuccess(45_000)
    })

    test.skip('new asset appears in Portfolio after creation', async ({
      page,
    }) => {
      const assetName = `Test${Date.now() % 10000}`
      const symbol = 'UNQ'

      await createAssetPage.fillForm({
        name: assetName,
        symbol: symbol,
        decimals: '12',
        minBalance: '1',
      })

      await createAssetPage.submit()
      await createAssetPage.waitForTransactionSuccess(45_000)

      // Navigate to Portfolio and click My Assets filter to show owned assets
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.navigate()
      await portfolioPage.filters.clickMyAssets()

      // Wait for the new asset name to appear (h3 title in asset card)
      await expect(page.getByText(assetName)).toBeVisible({
        timeout: 15_000,
      })
    })

    test('shows signing toast during creation', async () => {
      await createAssetPage.fillForm({
        name: 'Toast Test',
        symbol: 'TST',
      })

      await createAssetPage.submit()

      // Should show signing toast
      await createAssetPage.waitForSigningToast(5_000)
    })
  })

  test.describe('Mint Tokens', () => {
    // Use existing asset ID #2 for mint tests
    const EXISTING_ASSET_ID = '2'
    let mintPage: MintTokensPage
    let portfolioPage: PortfolioPage

    test.beforeEach(async ({ page }) => {
      mintPage = new MintTokensPage(page)
      portfolioPage = new PortfolioPage(page)
      await mintPage.goto()
      await mintPage.navigate()
    })

    test('mints tokens to existing asset', async () => {
      await mintPage.fillForm({
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.ALICE,
        amount: '10',
      })

      await mintPage.submit()
      await mintPage.waitForTransactionSuccess(45_000)
    })

    test('portfolio shows balance after minting', async () => {
      // Mint tokens
      await mintPage.fillForm({
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.ALICE,
        amount: '5',
      })

      await mintPage.submit()
      await mintPage.waitForTransactionSuccess(45_000)

      // Go to portfolio and verify balance section exists
      await portfolioPage.navigate()
      await portfolioPage.assetList.expectYourBalanceVisible()
      await expect(portfolioPage.assetList.totalSupplyLabel).toBeVisible()
    })
  })

  test.describe('Transfer Tokens', () => {
    const EXISTING_ASSET_ID = '2'
    let transferPage: TransferPage
    let portfolioPage: PortfolioPage

    test.beforeEach(async ({ page }) => {
      transferPage = new TransferPage(page)
      portfolioPage = new PortfolioPage(page)
      await transferPage.goto()
      await transferPage.navigate()
    })

    test('transfers tokens to another account', async () => {
      await transferPage.fillForm({
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.BOB,
        amount: '1',
      })

      await transferPage.submit()
      await transferPage.waitForTransactionSuccess(45_000)
    })

    test('portfolio updates after transfer', async () => {
      // Transfer some tokens
      await transferPage.fillForm({
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.BOB,
        amount: '0.5',
      })

      await transferPage.submit()
      await transferPage.waitForTransactionSuccess(45_000)

      // Verify portfolio still shows data (confirms queries refreshed)
      await portfolioPage.navigate()
      await portfolioPage.assetList.expectYourBalanceVisible()
    })
  })

  test.describe('Destroy Asset', () => {
    let destroyPage: DestroyAssetPage

    test.beforeEach(async ({ page }) => {
      destroyPage = new DestroyAssetPage(page)
      await destroyPage.goto()
      await destroyPage.navigate()
    })

    test('shows warning message', async () => {
      await destroyPage.expectWarningVisible()
    })

    test('destroy button is disabled without asset ID', async () => {
      await destroyPage.expectSubmitDisabled()
    })

    test('destroy button enables with asset ID', async () => {
      await destroyPage.fillForm({
        assetId: '999999',
      })

      // Button should be enabled once asset ID is entered
      await destroyPage.expectSubmitEnabled()
    })
  })
})
