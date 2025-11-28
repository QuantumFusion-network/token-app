import { expect, test } from '@playwright/test'

import {
  goToCreateAsset,
  goToDestroyAsset,
  goToMintTokens,
  goToTransfer,
} from './helpers/navigation'
import { waitForConnection } from './helpers/wait'

test.describe('Error Handling', () => {
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

  test.describe('Form Input Validation', () => {
    test('create asset form accepts valid input', async ({ page }) => {
      await goToCreateAsset(page)

      // Fill form with valid data
      await page.locator('#name').fill('Valid Token')
      await page.locator('#symbol').fill('VLD')
      await page.locator('#decimals').clear()
      await page.locator('#decimals').fill('12')

      // Button should be visible and enabled
      const submitBtn = page
        .getByRole('main')
        .getByRole('button', { name: 'Create Asset' })
      await expect(submitBtn).toBeVisible()
      await expect(submitBtn).toBeEnabled()
    })

    test('mint form accepts valid input', async ({ page }) => {
      await goToMintTokens(page)

      await page.locator('#assetId').fill('1')
      await page
        .locator('#recipient')
        .fill('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
      await page.locator('#amount').fill('100')

      const submitBtn = page
        .getByRole('main')
        .getByRole('button', { name: 'Mint Tokens' })
      await expect(submitBtn).toBeEnabled()
    })

    test('transfer form accepts valid input', async ({ page }) => {
      await goToTransfer(page)

      await page.locator('#assetId').fill('1')
      await page
        .locator('#recipient')
        .fill('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty')
      await page.locator('#amount').fill('10')

      const submitBtn = page
        .getByRole('main')
        .getByRole('button', { name: 'Transfer Tokens' })
      await expect(submitBtn).toBeEnabled()
    })

    test('destroy asset button disabled without asset ID', async ({ page }) => {
      await goToDestroyAsset(page)

      const destroyBtn = page
        .getByRole('main')
        .getByRole('button', { name: 'Destroy Asset' })
      await expect(destroyBtn).toBeDisabled()
    })

    test('destroy asset button enables with asset ID', async ({ page }) => {
      await goToDestroyAsset(page)

      await page.locator('#assetId').fill('999')

      const destroyBtn = page
        .getByRole('main')
        .getByRole('button', { name: 'Destroy Asset' })
      await expect(destroyBtn).toBeEnabled()
    })
  })

  test.describe('Transaction Preview', () => {
    test('shows transaction details before submission', async ({ page }) => {
      await goToCreateAsset(page)

      // Fill form
      await page.locator('#name').fill('Preview Test')
      await page.locator('#symbol').fill('PVT')
      await page.locator('#decimals').clear()
      await page.locator('#decimals').fill('10')

      // Should show transaction preview with details
      await expect(page.getByText(/Transaction Details/i)).toBeVisible()
      await expect(page.getByText(/"decimals":\s*"10"/)).toBeVisible()
    })

    test('shows estimated fee', async ({ page }) => {
      await goToCreateAsset(page)

      // Fill form to enable fee calculation
      await page.locator('#name').fill('Fee Test')
      await page.locator('#symbol').fill('FEE')

      // Should show estimated fee
      await expect(page.getByText(/Estimated Fee/i)).toBeVisible({
        timeout: 10_000,
      })
    })
  })

  test.describe('Warning Messages', () => {
    test('destroy asset shows warning', async ({ page }) => {
      await goToDestroyAsset(page)

      await expect(page.getByText(/Warning/)).toBeVisible()
      await expect(page.getByText(/permanent and irreversible/)).toBeVisible()
    })
  })
})
