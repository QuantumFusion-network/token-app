import { expect, test } from '@playwright/test'

import {
  goToCreateAsset,
  goToMintTokens,
  goToPortfolio,
  goToTransfer,
} from './helpers/navigation'
import { waitForConnection } from './helpers/wait'

test.describe('UI States & Feedback', () => {
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

  test.describe('Navigation States', () => {
    test('portfolio nav button is active by default', async ({ page }) => {
      const nav = page.getByRole('navigation')
      const portfolioBtn = nav.getByRole('button', { name: 'Portfolio' })

      await expect(portfolioBtn).toHaveClass(/bg-primary/)
    })

    test('nav button becomes active when clicked', async ({ page }) => {
      const nav = page.getByRole('navigation')

      // Click Create Asset
      const createBtn = nav.getByRole('button', { name: 'Create Asset' })
      await createBtn.click()

      // Create Asset should now be active
      await expect(createBtn).toHaveClass(/bg-primary/)

      // Portfolio should no longer be active
      const portfolioBtn = nav.getByRole('button', { name: 'Portfolio' })
      await expect(portfolioBtn).not.toHaveClass(/bg-primary/)
    })

    test('all nav buttons are visible', async ({ page }) => {
      const nav = page.getByRole('navigation')

      await expect(nav.getByRole('button', { name: 'Portfolio' })).toBeVisible()
      await expect(
        nav.getByRole('button', { name: 'Create Asset' })
      ).toBeVisible()
      await expect(
        nav.getByRole('button', { name: 'Mint Tokens' })
      ).toBeVisible()
      await expect(nav.getByRole('button', { name: 'Transfer' })).toBeVisible()
      await expect(
        nav.getByRole('button', { name: 'Destroy Asset' })
      ).toBeVisible()
    })
  })

  test.describe('Account Display', () => {
    test('shows connected account name', async ({ page }) => {
      await expect(page.getByText(/Alice/)).toBeVisible()
    })

    test('shows QF Balance', async ({ page }) => {
      await expect(page.getByText('QF Balance')).toBeVisible()
    })

    test('account info is displayed', async ({ page }) => {
      // Account name should be visible somewhere on the page
      await expect(page.getByText(/Alice/)).toBeVisible()
    })
  })

  test.describe('Page Headers', () => {
    test('portfolio shows Assets heading', async ({ page }) => {
      await goToPortfolio(page)
      await expect(page.getByRole('heading', { name: /Assets/ })).toBeVisible()
    })

    test('create asset shows correct heading', async ({ page }) => {
      await goToCreateAsset(page)
      await expect(
        page.getByRole('heading', { name: 'Create New Asset' })
      ).toBeVisible()
    })

    test('mint tokens shows correct heading', async ({ page }) => {
      await goToMintTokens(page)
      await expect(
        page.getByRole('heading', { name: 'Mint Tokens' })
      ).toBeVisible()
    })

    test('transfer shows correct heading', async ({ page }) => {
      await goToTransfer(page)
      await expect(
        page.getByRole('heading', { name: 'Transfer Tokens' })
      ).toBeVisible()
    })
  })

  test.describe('Form Inputs', () => {
    test('create asset form has all inputs', async ({ page }) => {
      await goToCreateAsset(page)

      // Check for form inputs by their IDs
      await expect(page.locator('#name')).toBeVisible()
      await expect(page.locator('#symbol')).toBeVisible()
      await expect(page.locator('#decimals')).toBeVisible()
      await expect(page.locator('#minBalance')).toBeVisible()
    })

    test('mint form has all inputs', async ({ page }) => {
      await goToMintTokens(page)

      await expect(page.locator('#assetId')).toBeVisible()
      await expect(page.locator('#recipient')).toBeVisible()
      await expect(page.locator('#amount')).toBeVisible()
    })

    test('transfer form has all inputs', async ({ page }) => {
      await goToTransfer(page)

      await expect(page.locator('#assetId')).toBeVisible()
      await expect(page.locator('#recipient')).toBeVisible()
      await expect(page.locator('#amount')).toBeVisible()
    })
  })

  test.describe('Portfolio Filters', () => {
    test('filter buttons are visible', async ({ page }) => {
      await goToPortfolio(page)

      await expect(page.getByRole('button', { name: /All Assets/ })).toBeVisible()
      await expect(page.getByRole('button', { name: /My Assets/ })).toBeVisible()
      await expect(
        page.getByRole('button', { name: /Assets I Hold/ })
      ).toBeVisible()
    })

    test('filter buttons show counts', async ({ page }) => {
      await goToPortfolio(page)

      // Each filter button should show a count in parentheses
      const allBtn = page.getByRole('button', { name: /All Assets/ })
      await expect(allBtn).toContainText(/\d+/)
    })
  })
})
