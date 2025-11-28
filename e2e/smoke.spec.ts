import { expect, test } from '@playwright/test'

import {
  CreateAssetPage,
  DestroyAssetPage,
  MintTokensPage,
  PortfolioPage,
  TransferPage,
} from './pages'

test.describe('Smoke Tests', () => {
  test('app loads and shows connected account', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()

    // Should show Alice's address (dev account)
    await portfolioPage.accountDisplay.expectConnectedAccount()

    // Should show QF Balance
    await portfolioPage.accountDisplay.expectQfBalanceVisible()
  })

  test('navigation works for all pages', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()

    // Portfolio (default)
    await portfolioPage.navigate()
    await portfolioPage.expectHeadingVisible()

    // Create Asset
    const createAssetPage = new CreateAssetPage(page)
    await createAssetPage.navigate()
    await createAssetPage.expectHeadingVisible()

    // Mint Tokens
    const mintPage = new MintTokensPage(page)
    await mintPage.navigate()
    await mintPage.expectHeadingVisible()

    // Transfer
    const transferPage = new TransferPage(page)
    await transferPage.navigate()
    await transferPage.expectHeadingVisible()

    // Destroy Asset
    const destroyPage = new DestroyAssetPage(page)
    await destroyPage.navigate()
    await destroyPage.expectHeadingVisible()
  })

  test('active nav button has primary variant', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()

    const { navigation } = portfolioPage

    // Portfolio should be active by default (has bg-primary class)
    await navigation.expectButtonActive(navigation.portfolioButton)

    // Create Asset should not be active (has ghost variant, no bg-primary)
    await navigation.expectButtonInactive(navigation.createAssetButton)

    // Click Create Asset
    await navigation.createAssetButton.click()
    await navigation.expectButtonActive(navigation.createAssetButton)
    await navigation.expectButtonInactive(navigation.portfolioButton)
  })
})
