import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './BasePage'

export interface DestroyAssetFormData {
  assetId: string
}

/**
 * Destroy Asset page - form for destroying assets
 */
export class DestroyAssetPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigate(): Promise<void> {
    await this.navigation.goToDestroyAsset()
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Destroy Asset' })
  }

  get assetIdInput(): Locator {
    return this.page.locator('#assetId')
  }

  get submitButton(): Locator {
    return this.main.getByRole('button', { name: 'Destroy Asset' })
  }

  get warningText(): Locator {
    return this.page.getByText(/Warning/)
  }

  get permanentWarningText(): Locator {
    return this.page.getByText(/permanent and irreversible/)
  }

  async fillForm(data: DestroyAssetFormData): Promise<void> {
    await this.assetIdInput.fill(data.assetId)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async fillAndSubmit(data: DestroyAssetFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async expectWarningVisible(): Promise<void> {
    await expect(this.warningText).toBeVisible()
    await expect(this.permanentWarningText).toBeVisible()
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled()
  }
}
