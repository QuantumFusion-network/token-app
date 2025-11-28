import type { Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'

import { BasePage } from './BasePage'

export interface TransferFormData {
  assetId: string
  recipient: string
  amount: string
}

/**
 * Transfer Tokens page - form for transferring tokens
 */
export class TransferPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigate(): Promise<void> {
    await this.navigation.goToTransfer()
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Transfer Tokens' })
  }

  get assetIdInput(): Locator {
    return this.page.locator('#assetId')
  }

  get recipientInput(): Locator {
    return this.page.locator('#recipient')
  }

  get amountInput(): Locator {
    return this.page.locator('#amount')
  }

  get submitButton(): Locator {
    return this.main.getByRole('button', { name: 'Transfer Tokens' })
  }

  async fillForm(data: TransferFormData): Promise<void> {
    await this.assetIdInput.fill(data.assetId)
    await this.recipientInput.fill(data.recipient)
    await this.amountInput.fill(data.amount)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async fillAndSubmit(data: TransferFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async expectAllInputsVisible(): Promise<void> {
    await expect(this.assetIdInput).toBeVisible()
    await expect(this.recipientInput).toBeVisible()
    await expect(this.amountInput).toBeVisible()
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled()
  }
}
