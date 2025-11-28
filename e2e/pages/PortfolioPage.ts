import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './BasePage'

/**
 * Portfolio page - displays assets and filters
 */
export class PortfolioPage extends BasePage {
  readonly filters: PortfolioFilters
  readonly assetList: AssetList

  constructor(page: Page) {
    super(page)
    this.filters = new PortfolioFilters(page)
    this.assetList = new AssetList(page)
  }

  async navigate(): Promise<void> {
    await this.navigation.goToPortfolio()
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /Assets/ })
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async waitForLoad(timeout = 10_000): Promise<void> {
    await this.page.waitForSelector('h2:has-text("Assets")', { timeout })
  }
}

/**
 * Portfolio filter buttons component
 */
export class PortfolioFilters {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get allAssetsButton(): Locator {
    return this.page.getByRole('button', { name: /All Assets/ })
  }

  get myAssetsButton(): Locator {
    return this.page.getByRole('button', { name: /My Assets/ })
  }

  get assetsIHoldButton(): Locator {
    return this.page.getByRole('button', { name: /Assets I Hold/ })
  }

  async clickAllAssets(): Promise<void> {
    await this.allAssetsButton.click()
  }

  async clickMyAssets(): Promise<void> {
    await this.myAssetsButton.click()
  }

  async clickAssetsIHold(): Promise<void> {
    await this.assetsIHoldButton.click()
  }

  async getCount(button: Locator): Promise<number> {
    const text = await button.textContent()
    const match = text?.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
  }

  async getAllCounts(): Promise<{
    all: number
    my: number
    hold: number
  }> {
    return {
      all: await this.getCount(this.allAssetsButton),
      my: await this.getCount(this.myAssetsButton),
      hold: await this.getCount(this.assetsIHoldButton),
    }
  }

  async expectAllFiltersVisible(): Promise<void> {
    await expect(this.allAssetsButton).toBeVisible()
    await expect(this.myAssetsButton).toBeVisible()
    await expect(this.assetsIHoldButton).toBeVisible()
  }

  async expectFilterShowsCount(button: Locator): Promise<void> {
    await expect(button).toContainText(/\d+/)
  }

  async expectAssetCountHeading(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /Assets \(\d+\)/ })
    ).toBeVisible()
  }
}

/**
 * Asset list and card components
 */
export class AssetList {
  readonly page: Page
  readonly main: Locator

  constructor(page: Page) {
    this.page = page
    this.main = page.getByRole('main')
  }

  get assetHeadings(): Locator {
    return this.page.locator('h3')
  }

  get totalSupplyLabel(): Locator {
    return this.main.getByText('Total Supply').first()
  }

  get holdersLabel(): Locator {
    return this.main.getByText('Holders').first()
  }

  get yourBalanceLabel(): Locator {
    return this.main.getByText('Your Balance').first()
  }

  get decimalsLabel(): Locator {
    return this.main.getByText('Decimals').first()
  }

  get sufficientLabel(): Locator {
    return this.main.getByText('Sufficient').first()
  }

  get ownerLabel(): Locator {
    return this.main.getByText('Owner').first()
  }

  get youBadge(): Locator {
    return this.main.getByText('You', { exact: true }).first()
  }

  getAssetIdBadge(): Locator {
    return this.main.getByText(/ID #\d+/).first()
  }

  async expectFirstAssetVisible(): Promise<void> {
    await expect(this.assetHeadings.first()).toBeVisible()
  }

  async expectAssetDataVisible(): Promise<void> {
    await expect(this.totalSupplyLabel).toBeVisible()
    await expect(this.holdersLabel).toBeVisible()
    await expect(this.getAssetIdBadge()).toBeVisible()
  }

  async expectYourBalanceVisible(): Promise<void> {
    await expect(this.yourBalanceLabel).toBeVisible()
  }

  async expectAssetDetailsVisible(): Promise<void> {
    await expect(this.decimalsLabel).toBeVisible()
    await expect(this.sufficientLabel).toBeVisible()
    await expect(this.main.getByText(/Yes|No/).first()).toBeVisible()
  }

  async expectOwnerVisible(): Promise<void> {
    await expect(this.ownerLabel).toBeVisible()
  }

  async hasYouBadge(): Promise<boolean> {
    return await this.youBadge.isVisible().catch(() => false)
  }
}
