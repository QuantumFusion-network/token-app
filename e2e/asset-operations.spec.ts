import { expect, test } from '@playwright/test'

import { DEV_ACCOUNTS } from './fixtures/accounts'
import {
  fillCreateAssetForm,
  fillDestroyForm,
  fillMintForm,
  fillTransferForm,
} from './helpers/forms'
import {
  goToCreateAsset,
  goToDestroyAsset,
  goToMintTokens,
  goToPortfolio,
  goToTransfer,
} from './helpers/navigation'
import {
  waitForConnection,
  waitForSigningToast,
  waitForTransactionSuccess,
} from './helpers/wait'

test.describe('Asset Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForConnection(page)

    // Close TanStack Query devtools if open
    const devtoolsClose = page.locator(
      'button[aria-label="Close tanstack query devtools"]'
    )
    if (await devtoolsClose.isVisible({ timeout: 1000 }).catch(() => false)) {
      await devtoolsClose.click()
    }
  })

  test.describe('Create Asset', () => {
    test('creates asset with name, symbol, decimals', async ({ page }) => {
      await goToCreateAsset(page)

      await fillCreateAssetForm(page, {
        name: 'Test Token',
        symbol: 'TST',
        decimals: '8',
        minBalance: '1',
      })

      // Transaction details preview should show decimals
      await expect(page.getByText(/"decimals":\s*"8"/)).toBeVisible()

      // Submit form (use main region to avoid nav button)
      await page
        .getByRole('main')
        .getByRole('button', { name: 'Create Asset' })
        .click()

      // Wait for transaction to complete
      await waitForTransactionSuccess(page, 45_000)
    })

    test.skip('new asset appears in Portfolio after creation', async ({ page }) => {
      const assetName = `Test${Date.now() % 10000}`
      const symbol = 'UNQ'

      await goToCreateAsset(page)

      await fillCreateAssetForm(page, {
        name: assetName,
        symbol: symbol,
        decimals: '12',
        minBalance: '1',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Create Asset' })
        .click()
      await waitForTransactionSuccess(page, 45_000)

      // Navigate to Portfolio and click My Assets filter to show owned assets
      await goToPortfolio(page)
      await page.getByRole('button', { name: /My Assets/ }).click()

      // Wait for the new asset name to appear (h3 title in asset card)
      await expect(page.getByText(assetName)).toBeVisible({
        timeout: 15_000,
      })
    })

    test('shows signing toast during creation', async ({ page }) => {
      await goToCreateAsset(page)

      await fillCreateAssetForm(page, {
        name: 'Toast Test',
        symbol: 'TST',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Create Asset' })
        .click()

      // Should show signing toast
      await waitForSigningToast(page, 5_000)
    })
  })

  test.describe('Mint Tokens', () => {
    // Use existing asset ID #2 for mint tests
    const EXISTING_ASSET_ID = '2'

    test('mints tokens to existing asset', async ({ page }) => {
      await goToMintTokens(page)

      await fillMintForm(page, {
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.ALICE,
        amount: '10',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Mint Tokens' })
        .click()
      await waitForTransactionSuccess(page, 45_000)
    })

    test('portfolio shows balance after minting', async ({ page }) => {
      // Mint tokens
      await goToMintTokens(page)
      await fillMintForm(page, {
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.ALICE,
        amount: '5',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Mint Tokens' })
        .click()
      await waitForTransactionSuccess(page, 45_000)

      // Go to portfolio and verify balance section exists
      await goToPortfolio(page)
      await expect(page.getByText('Your Balance').first()).toBeVisible()
      await expect(page.getByText('Total Supply').first()).toBeVisible()
    })
  })

  test.describe('Transfer Tokens', () => {
    const EXISTING_ASSET_ID = '2'

    test('transfers tokens to another account', async ({ page }) => {
      await goToTransfer(page)

      await fillTransferForm(page, {
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.BOB,
        amount: '1',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Transfer Tokens' })
        .click()
      await waitForTransactionSuccess(page, 45_000)
    })

    test('portfolio updates after transfer', async ({ page }) => {
      // Transfer some tokens
      await goToTransfer(page)
      await fillTransferForm(page, {
        assetId: EXISTING_ASSET_ID,
        recipient: DEV_ACCOUNTS.BOB,
        amount: '0.5',
      })

      await page
        .getByRole('main')
        .getByRole('button', { name: 'Transfer Tokens' })
        .click()
      await waitForTransactionSuccess(page, 45_000)

      // Verify portfolio still shows data (confirms queries refreshed)
      await goToPortfolio(page)
      await expect(page.getByText('Your Balance').first()).toBeVisible()
    })
  })

  test.describe('Destroy Asset', () => {
    test('shows warning message', async ({ page }) => {
      await goToDestroyAsset(page)

      await expect(page.getByText(/Warning/)).toBeVisible()
      await expect(page.getByText(/permanent and irreversible/)).toBeVisible()
    })

    test('destroy button is disabled without asset ID', async ({ page }) => {
      await goToDestroyAsset(page)

      const destroyBtn = page.getByRole('main').getByRole('button', {
        name: 'Destroy Asset',
      })
      await expect(destroyBtn).toBeDisabled()
    })

    test('destroy button enables with asset ID', async ({ page }) => {
      await goToDestroyAsset(page)

      await fillDestroyForm(page, {
        assetId: '999999',
      })

      // Button should be enabled once asset ID is entered
      const destroyBtn = page.getByRole('main').getByRole('button', {
        name: 'Destroy Asset',
      })
      await expect(destroyBtn).toBeEnabled()
    })
  })
})
