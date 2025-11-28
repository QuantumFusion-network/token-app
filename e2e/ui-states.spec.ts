import { expect, test } from '@playwright/test'

import {
  CreateAssetPage,
  MintTokensPage,
  PortfolioPage,
  TransferPage,
} from './pages'

test.describe('UI States & Feedback', () => {
  test.describe('Navigation States', () => {
    test('portfolio nav button is active by default', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      await portfolioPage.navigation.expectButtonActive(
        portfolioPage.navigation.portfolioButton
      )
    })

    test('nav button becomes active when clicked', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      const { navigation } = portfolioPage

      // Click Create Asset
      await navigation.createAssetButton.click()

      // Create Asset should now be active
      await navigation.expectButtonActive(navigation.createAssetButton)

      // Portfolio should no longer be active
      await navigation.expectButtonInactive(navigation.portfolioButton)
    })

    test('all nav buttons are visible', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      const { navigation } = portfolioPage

      await expect(navigation.portfolioButton).toBeVisible()
      await expect(navigation.createAssetButton).toBeVisible()
      await expect(navigation.mintTokensButton).toBeVisible()
      await expect(navigation.transferButton).toBeVisible()
      await expect(navigation.destroyAssetButton).toBeVisible()
    })
  })

  test.describe('Account Display', () => {
    test('shows connected account name', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      await portfolioPage.accountDisplay.expectConnectedAccount()
    })

    test('shows QF Balance', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      await portfolioPage.accountDisplay.expectQfBalanceVisible()
    })

    test('account info is displayed', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()

      // Account name should be visible somewhere on the page
      await portfolioPage.accountDisplay.expectConnectedAccount()
    })
  })

  test.describe('Page Headers', () => {
    test('portfolio shows Assets heading', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()
      await portfolioPage.navigate()

      await portfolioPage.expectHeadingVisible()
    })

    test('create asset shows correct heading', async ({ page }) => {
      const createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()

      await createAssetPage.expectHeadingVisible()
    })

    test('mint tokens shows correct heading', async ({ page }) => {
      const mintPage = new MintTokensPage(page)
      await mintPage.goto()
      await mintPage.navigate()

      await mintPage.expectHeadingVisible()
    })

    test('transfer shows correct heading', async ({ page }) => {
      const transferPage = new TransferPage(page)
      await transferPage.goto()
      await transferPage.navigate()

      await transferPage.expectHeadingVisible()
    })
  })

  test.describe('Form Inputs', () => {
    test('create asset form has all inputs', async ({ page }) => {
      const createAssetPage = new CreateAssetPage(page)
      await createAssetPage.goto()
      await createAssetPage.navigate()

      await createAssetPage.expectAllInputsVisible()
    })

    test('mint form has all inputs', async ({ page }) => {
      const mintPage = new MintTokensPage(page)
      await mintPage.goto()
      await mintPage.navigate()

      await mintPage.expectAllInputsVisible()
    })

    test('transfer form has all inputs', async ({ page }) => {
      const transferPage = new TransferPage(page)
      await transferPage.goto()
      await transferPage.navigate()

      await transferPage.expectAllInputsVisible()
    })
  })

  test.describe('Portfolio Filters', () => {
    test('filter buttons are visible', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()
      await portfolioPage.navigate()

      await portfolioPage.filters.expectAllFiltersVisible()
    })

    test('filter buttons show counts', async ({ page }) => {
      const portfolioPage = new PortfolioPage(page)
      await portfolioPage.goto()
      await portfolioPage.navigate()

      // Each filter button should show a count in parentheses
      await portfolioPage.filters.expectFilterShowsCount(
        portfolioPage.filters.allAssetsButton
      )
    })
  })
})
