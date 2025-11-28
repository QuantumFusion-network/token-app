import type { Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'

import { BasePage } from './BasePage'

export interface CreateAssetFormData {
  name: string
  symbol: string
  decimals?: string
  minBalance?: string
  initialMint?: string
  beneficiary?: string
}

/**
 * Create Asset page - form for creating new assets
 */
export class CreateAssetPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigate(): Promise<void> {
    await this.navigation.goToCreateAsset()
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Create New Asset' })
  }

  get nameInput(): Locator {
    return this.page.locator('#name')
  }

  get symbolInput(): Locator {
    return this.page.locator('#symbol')
  }

  get decimalsInput(): Locator {
    return this.page.locator('#decimals')
  }

  get minBalanceInput(): Locator {
    return this.page.locator('#minBalance')
  }

  get initialMintAmountInput(): Locator {
    return this.page.locator('#initialMintAmount')
  }

  get initialMintBeneficiaryInput(): Locator {
    return this.page.locator('#initialMintBeneficiary')
  }

  get submitButton(): Locator {
    return this.main.getByRole('button', { name: 'Create Asset' })
  }

  get transactionDetailsText(): Locator {
    return this.page.getByText(/Transaction Details/i)
  }

  get estimatedFeeText(): Locator {
    return this.page.getByText(/Estimated Fee/i)
  }

  async fillForm(data: CreateAssetFormData): Promise<void> {
    await this.nameInput.fill(data.name)
    await this.symbolInput.fill(data.symbol)

    if (data.decimals !== undefined) {
      await this.decimalsInput.clear()
      await this.decimalsInput.fill(data.decimals)
    }
    if (data.minBalance !== undefined) {
      await this.minBalanceInput.clear()
      await this.minBalanceInput.fill(data.minBalance)
    }
    if (data.initialMint !== undefined) {
      await this.initialMintAmountInput.fill(data.initialMint)
    }
    if (data.beneficiary !== undefined) {
      await this.initialMintBeneficiaryInput.clear()
      await this.initialMintBeneficiaryInput.fill(data.beneficiary)
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async fillAndSubmit(data: CreateAssetFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async expectAllInputsVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible()
    await expect(this.symbolInput).toBeVisible()
    await expect(this.decimalsInput).toBeVisible()
    await expect(this.minBalanceInput).toBeVisible()
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled()
  }

  async expectTransactionPreviewVisible(): Promise<void> {
    await expect(this.transactionDetailsText).toBeVisible()
  }

  async expectDecimalsInPreview(decimals: string): Promise<void> {
    await expect(
      this.page.getByText(new RegExp(`"decimals":\\s*"${decimals}"`))
    ).toBeVisible()
  }

  async expectEstimatedFeeVisible(timeout = 10_000): Promise<void> {
    await expect(this.estimatedFeeText).toBeVisible({ timeout })
  }
}
