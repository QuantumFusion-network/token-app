import { expect, test } from '@playwright/test'

import { PortfolioPage } from './pages'

test.describe('Portfolio Display', () => {
  let portfolioPage: PortfolioPage

  test.beforeEach(async ({ page }) => {
    portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()
    await portfolioPage.navigate()
  })

  test.describe('Asset List', () => {
    test('displays existing assets with correct data', async () => {
      // Wait for assets to load
      await portfolioPage.expectHeadingVisible()

      // Should show at least one asset card
      await portfolioPage.assetList.expectFirstAssetVisible()
    })

    test('shows asset name, ID, supply, and holders', async () => {
      // Should show common data elements
      await portfolioPage.assetList.expectAssetDataVisible()
    })

    test('shows user balance for held assets', async () => {
      // Should show "Your Balance" section for assets user holds
      await portfolioPage.assetList.expectYourBalanceVisible()
    })
  })

  test.describe('Filters', () => {
    test('All Assets filter shows all assets on chain', async () => {
      await portfolioPage.filters.clickAllAssets()

      // Should show asset count in heading
      await portfolioPage.filters.expectAssetCountHeading()
    })

    test('My Assets filter shows only owned assets', async () => {
      await portfolioPage.filters.clickMyAssets()

      // Filter should be active and show count
      await portfolioPage.filters.expectFilterShowsCount(
        portfolioPage.filters.myAssetsButton
      )
    })

    test('Assets I Hold filter shows assets with balance', async () => {
      await portfolioPage.filters.clickAssetsIHold()

      // Filter should be active and show count
      await portfolioPage.filters.expectFilterShowsCount(
        portfolioPage.filters.assetsIHoldButton
      )
    })

    test('filter counts update based on data', async () => {
      const counts = await portfolioPage.filters.getAllCounts()

      // My assets and held assets should be <= all assets
      expect(counts.my).toBeLessThanOrEqual(counts.all)
      expect(counts.hold).toBeLessThanOrEqual(counts.all)
    })
  })

  test.describe('Asset Card', () => {
    test('displays decimals and sufficient flag', async () => {
      await portfolioPage.assetList.expectAssetDetailsVisible()
    })

    test('shows owner address with "You" badge if owner', async () => {
      await portfolioPage.assetList.expectOwnerVisible()

      // If user owns the asset, should show "You" badge next to shortened address
      // Alice owns asset ID #2, so we should see "You" badge
      const hasYouBadge = await portfolioPage.assetList.hasYouBadge()

      // Should have either "You" badge (for owned assets) or just show owner address
      // Since Alice owns asset #2, we expect the "You" badge
      expect(hasYouBadge).toBe(true)
    })
  })
})
