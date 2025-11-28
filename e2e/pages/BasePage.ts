import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Base page object with common functionality shared across all pages
 */
export abstract class BasePage {
  readonly page: Page
  readonly navigation: NavigationComponent
  readonly accountDisplay: AccountDisplayComponent

  constructor(page: Page) {
    this.page = page
    this.navigation = new NavigationComponent(page)
    this.accountDisplay = new AccountDisplayComponent(page)
  }

  /**
   * Navigate to the app root and wait for connection
   */
  async goto(): Promise<void> {
    await this.page.goto('/')
    await this.waitForConnection()
    await this.closeDevtoolsIfOpen()
  }

  /**
   * Wait for the blockchain connection to be established
   */
  async waitForConnection(timeout = 15_000): Promise<void> {
    await this.page.waitForSelector('text=/QF Balance/', { timeout })
  }

  /**
   * Close TanStack Query devtools if open (it can block clicks)
   */
  async closeDevtoolsIfOpen(): Promise<void> {
    const devtoolsClose = this.page.locator(
      'button[aria-label="Close tanstack query devtools"]'
    )
    if (await devtoolsClose.isVisible({ timeout: 1000 }).catch(() => false)) {
      await devtoolsClose.click()
    }
  }

  /**
   * Wait for a transaction success toast
   */
  async waitForTransactionSuccess(timeout = 30_000): Promise<void> {
    await this.page.waitForSelector(
      'text=/successfully|created|minted|transferred|destroyed/i',
      { timeout }
    )
  }

  /**
   * Wait for a transaction error toast
   */
  async waitForTransactionError(timeout = 30_000): Promise<void> {
    await this.page.waitForSelector('text=/failed|error/i', { timeout })
  }

  /**
   * Wait for signing toast to appear
   */
  async waitForSigningToast(timeout = 10_000): Promise<void> {
    await this.page.waitForSelector('text=/Please sign/i', { timeout })
  }

  /**
   * Get the main content area
   */
  get main(): Locator {
    return this.page.getByRole('main')
  }
}

/**
 * Navigation component shared across all pages
 */
export class NavigationComponent {
  readonly page: Page
  readonly nav: Locator

  constructor(page: Page) {
    this.page = page
    this.nav = page.getByRole('navigation')
  }

  get portfolioButton(): Locator {
    return this.nav.getByRole('button', { name: 'Portfolio' })
  }

  get createAssetButton(): Locator {
    return this.nav.getByRole('button', { name: 'Create Asset' })
  }

  get mintTokensButton(): Locator {
    return this.nav.getByRole('button', { name: 'Mint Tokens' })
  }

  get transferButton(): Locator {
    return this.nav.getByRole('button', { name: 'Transfer' })
  }

  get destroyAssetButton(): Locator {
    return this.nav.getByRole('button', { name: 'Destroy Asset' })
  }

  async goToPortfolio(): Promise<void> {
    await this.portfolioButton.click()
    await this.page.waitForSelector('h2:has-text("Assets")')
  }

  async goToCreateAsset(): Promise<void> {
    await this.createAssetButton.click()
    await this.page.waitForSelector('h1:has-text("Create New Asset")')
  }

  async goToMintTokens(): Promise<void> {
    await this.mintTokensButton.click()
    await this.page.waitForSelector('h1:has-text("Mint Tokens")')
  }

  async goToTransfer(): Promise<void> {
    await this.transferButton.click()
    await this.page.waitForSelector('h1:has-text("Transfer Tokens")')
  }

  async goToDestroyAsset(): Promise<void> {
    await this.destroyAssetButton.click()
    await this.page.waitForSelector('h1:has-text("Destroy Asset")')
  }

  async expectButtonActive(button: Locator): Promise<void> {
    await expect(button).toHaveClass(/bg-primary/)
  }

  async expectButtonInactive(button: Locator): Promise<void> {
    await expect(button).not.toHaveClass(/bg-primary/)
  }
}

/**
 * Account display component (header area)
 */
export class AccountDisplayComponent {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get accountName(): Locator {
    return this.page.getByText(/Alice/)
  }

  get qfBalanceLabel(): Locator {
    return this.page.getByText('QF Balance')
  }

  async expectConnectedAccount(name: string | RegExp = /Alice/): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible()
  }

  async expectQfBalanceVisible(): Promise<void> {
    await expect(this.qfBalanceLabel).toBeVisible()
  }
}
