import type { Page } from '@playwright/test'

export interface CreateAssetParams {
  name: string
  symbol: string
  decimals?: string
  minBalance?: string
  initialMint?: string
  beneficiary?: string
}

export async function fillCreateAssetForm(
  page: Page,
  params: CreateAssetParams
) {
  // Fill required fields
  await page.locator('#name').fill(params.name)
  await page.locator('#symbol').fill(params.symbol)

  // Fill optional fields if provided
  if (params.decimals) {
    await page.locator('#decimals').clear()
    await page.locator('#decimals').fill(params.decimals)
  }
  if (params.minBalance) {
    await page.locator('#minBalance').clear()
    await page.locator('#minBalance').fill(params.minBalance)
  }
  if (params.initialMint) {
    await page.locator('#initialMintAmount').fill(params.initialMint)
  }
  if (params.beneficiary) {
    await page.locator('#initialMintBeneficiary').clear()
    await page.locator('#initialMintBeneficiary').fill(params.beneficiary)
  }
}

export interface MintTokensParams {
  assetId: string
  recipient: string
  amount: string
}

export async function fillMintForm(page: Page, params: MintTokensParams) {
  await page.locator('#assetId').fill(params.assetId)
  await page.locator('#recipient').fill(params.recipient)
  await page.locator('#amount').fill(params.amount)
}

export interface TransferParams {
  assetId: string
  recipient: string
  amount: string
}

export async function fillTransferForm(page: Page, params: TransferParams) {
  await page.locator('#assetId').fill(params.assetId)
  await page.locator('#recipient').fill(params.recipient)
  await page.locator('#amount').fill(params.amount)
}

export interface DestroyAssetParams {
  assetId: string
}

export async function fillDestroyForm(page: Page, params: DestroyAssetParams) {
  await page.locator('#assetId').fill(params.assetId)
}
