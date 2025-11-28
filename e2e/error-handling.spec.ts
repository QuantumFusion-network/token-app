import { test } from '@playwright/test'

import {
  CreateAssetPage,
  DestroyAssetPage,
  MintTokensPage,
  TransferPage,
} from './pages'

test.describe('Error Handling', () => {
  test.describe('Form Input Validation', () => {
    test('create asset form accepts valid input', async ({ page }) => {
      const createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()

      // Fill form with valid data
      await createAssetPage.fillForm({
        name: 'Valid Token',
        symbol: 'VLD',
        decimals: '12',
      })

      // Button should be visible and enabled
      await createAssetPage.expectSubmitEnabled()
    })

    test('mint form accepts valid input', async ({ page }) => {
      const mintPage = new MintTokensPage(page)
      await mintPage.goto()
      await mintPage.navigate()

      await mintPage.fillForm({
        assetId: '1',
        recipient: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '100',
      })

      await mintPage.expectSubmitEnabled()
    })

    test('transfer form accepts valid input', async ({ page }) => {
      const transferPage = new TransferPage(page)
      await transferPage.goto()
      await transferPage.navigate()

      await transferPage.fillForm({
        assetId: '1',
        recipient: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        amount: '10',
      })

      await transferPage.expectSubmitEnabled()
    })

    test('destroy asset button disabled without asset ID', async ({ page }) => {
      const destroyPage = new DestroyAssetPage(page)
      await destroyPage.goto()
      await destroyPage.navigate()

      await destroyPage.expectSubmitDisabled()
    })

    test('destroy asset button enables with asset ID', async ({ page }) => {
      const destroyPage = new DestroyAssetPage(page)
      await destroyPage.goto()
      await destroyPage.navigate()

      await destroyPage.fillForm({ assetId: '999' })

      await destroyPage.expectSubmitEnabled()
    })
  })

  test.describe('Transaction Preview', () => {
    test('shows transaction details before submission', async ({ page }) => {
      const createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()

      // Fill form
      await createAssetPage.fillForm({
        name: 'Preview Test',
        symbol: 'PVT',
        decimals: '10',
      })

      // Should show transaction preview with details
      await createAssetPage.expectTransactionPreviewVisible()
      await createAssetPage.expectDecimalsInPreview('10')
    })

    test('shows estimated fee', async ({ page }) => {
      const createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()

      // Fill form to enable fee calculation
      await createAssetPage.fillForm({
        name: 'Fee Test',
        symbol: 'FEE',
      })

      // Should show estimated fee
      await createAssetPage.expectEstimatedFeeVisible(10_000)
    })
  })

  test.describe('Warning Messages', () => {
    test('destroy asset shows warning', async ({ page }) => {
      const destroyPage = new DestroyAssetPage(page)
      await destroyPage.goto()
      await destroyPage.navigate()

      await destroyPage.expectWarningVisible()
    })
  })
})
