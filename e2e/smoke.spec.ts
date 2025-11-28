import { expect, test } from '@playwright/test'

import {
  goToCreateAsset,
  goToDestroyAsset,
  goToMintTokens,
  goToPortfolio,
  goToTransfer,
} from './helpers/navigation'
import { waitForConnection } from './helpers/wait'

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForConnection(page)

    // Close TanStack Query devtools if open (it can block clicks)
    const devtoolsClose = page.locator(
      'button[aria-label="Close tanstack query devtools"]'
    )
    if (await devtoolsClose.isVisible({ timeout: 1000 }).catch(() => false)) {
      await devtoolsClose.click()
    }
  })

  test('app loads and shows connected account', async ({ page }) => {
    // Should show Alice's address (dev account)
    await expect(page.getByText(/Alice/)).toBeVisible()

    // Should show QF Balance
    await expect(page.getByText('QF Balance')).toBeVisible()
  })

  test('navigation works for all pages', async ({ page }) => {
    // Portfolio (default)
    await goToPortfolio(page)
    await expect(page.getByRole('heading', { name: /Assets/ })).toBeVisible()

    // Create Asset
    await goToCreateAsset(page)
    await expect(
      page.getByRole('heading', { name: 'Create New Asset' })
    ).toBeVisible()

    // Mint Tokens
    await goToMintTokens(page)
    await expect(
      page.getByRole('heading', { name: 'Mint Tokens' })
    ).toBeVisible()

    // Transfer
    await goToTransfer(page)
    await expect(
      page.getByRole('heading', { name: 'Transfer Tokens' })
    ).toBeVisible()

    // Destroy Asset
    await goToDestroyAsset(page)
    await expect(
      page.getByRole('heading', { name: 'Destroy Asset' })
    ).toBeVisible()
  })

  test('active nav button has primary variant', async ({ page }) => {
    const nav = page.getByRole('navigation')

    // Portfolio should be active by default (has bg-primary class)
    const portfolioBtn = nav.getByRole('button', { name: 'Portfolio' })
    await expect(portfolioBtn).toHaveClass(/bg-primary/)

    // Create Asset should not be active (has ghost variant, no bg-primary)
    const createBtn = nav.getByRole('button', { name: 'Create Asset' })
    await expect(createBtn).not.toHaveClass(/bg-primary/)

    // Click Create Asset
    await createBtn.click()
    await expect(createBtn).toHaveClass(/bg-primary/)
    await expect(portfolioBtn).not.toHaveClass(/bg-primary/)
  })
})
