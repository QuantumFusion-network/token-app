import { expect, test } from '@playwright/test'

import { DEV_ACCOUNTS } from './fixtures/accounts'
import { goToPortfolio } from './helpers/navigation'
import { waitForConnection } from './helpers/wait'

test.describe('Portfolio Display', () => {
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

    await goToPortfolio(page)
  })

  test.describe('Asset List', () => {
    test('displays existing assets with correct data', async ({ page }) => {
      // Wait for assets to load
      await expect(page.getByRole('heading', { name: /Assets/ })).toBeVisible()

      // Should show at least one asset card
      const assetHeadings = page.locator('h3')
      await expect(assetHeadings.first()).toBeVisible()
    })

    test('shows asset name, ID, supply, and holders', async ({ page }) => {
      // Look for an asset card with common data elements
      const main = page.getByRole('main')

      // Should show Total Supply label (use first() since multiple assets)
      await expect(main.getByText('Total Supply').first()).toBeVisible()

      // Should show Holders label
      await expect(main.getByText('Holders').first()).toBeVisible()

      // Should show ID badge (e.g., "ID #2")
      await expect(main.getByText(/ID #\d+/).first()).toBeVisible()
    })

    test('shows user balance for held assets', async ({ page }) => {
      const main = page.getByRole('main')

      // Should show "Your Balance" section for assets user holds
      await expect(main.getByText('Your Balance').first()).toBeVisible()
    })
  })

  test.describe('Filters', () => {
    test('All Assets filter shows all assets on chain', async ({ page }) => {
      const allAssetsBtn = page.getByRole('button', { name: /All Assets/ })
      await allAssetsBtn.click()

      // Should show asset count in heading
      await expect(
        page.getByRole('heading', { name: /Assets \(\d+\)/ })
      ).toBeVisible()
    })

    test('My Assets filter shows only owned assets', async ({ page }) => {
      const myAssetsBtn = page.getByRole('button', { name: /My Assets/ })
      await myAssetsBtn.click()

      // Filter should be active and show count
      await expect(myAssetsBtn).toContainText(/\d+/)
    })

    test('Assets I Hold filter shows assets with balance', async ({ page }) => {
      const holdBtn = page.getByRole('button', { name: /Assets I Hold/ })
      await holdBtn.click()

      // Filter should be active and show count
      await expect(holdBtn).toContainText(/\d+/)
    })

    test('filter counts update based on data', async ({ page }) => {
      // Get counts from all three filters
      const allCount = await page
        .getByRole('button', { name: /All Assets/ })
        .textContent()
      const myCount = await page
        .getByRole('button', { name: /My Assets/ })
        .textContent()
      const holdCount = await page
        .getByRole('button', { name: /Assets I Hold/ })
        .textContent()

      // Extract numbers from text
      const extractNumber = (text: string | null) => {
        const match = text?.match(/\d+/)
        return match ? parseInt(match[0], 10) : 0
      }

      const all = extractNumber(allCount)
      const my = extractNumber(myCount)
      const hold = extractNumber(holdCount)

      // My assets and held assets should be <= all assets
      expect(my).toBeLessThanOrEqual(all)
      expect(hold).toBeLessThanOrEqual(all)
    })
  })

  test.describe('Asset Card', () => {
    test('displays decimals and sufficient flag', async ({ page }) => {
      const main = page.getByRole('main')

      // Should show Decimals label (use first() since multiple assets)
      await expect(main.getByText('Decimals').first()).toBeVisible()

      // Should show Sufficient label with Yes/No
      await expect(main.getByText('Sufficient').first()).toBeVisible()
      await expect(main.getByText(/Yes|No/).first()).toBeVisible()
    })

    test('shows owner address with "You" badge if owner', async ({ page }) => {
      const main = page.getByRole('main')

      // Should show Owner label (use first() since multiple assets)
      await expect(main.getByText('Owner').first()).toBeVisible()

      // If user owns the asset, should show "You" badge next to shortened address
      // Alice owns asset ID #2, so we should see "You" badge
      const youBadge = main.getByText('You', { exact: true }).first()
      const hasYouBadge = await youBadge.isVisible().catch(() => false)

      // Should have either "You" badge (for owned assets) or just show owner address
      // Since Alice owns asset #2, we expect the "You" badge
      expect(hasYouBadge).toBe(true)
    })
  })
})
