import type { Page } from '@playwright/test'

import { NAV } from '../fixtures/selectors'

export async function goToPortfolio(page: Page) {
  await page.click(NAV.portfolio)
  await page.waitForSelector('h2:has-text("Assets")')
}

export async function goToCreateAsset(page: Page) {
  await page.click(NAV.createAsset)
  await page.waitForSelector('h1:has-text("Create New Asset")')
}

export async function goToMintTokens(page: Page) {
  await page.click(NAV.mintTokens)
  await page.waitForSelector('h1:has-text("Mint Tokens")')
}

export async function goToTransfer(page: Page) {
  await page.click(NAV.transfer)
  await page.waitForSelector('h1:has-text("Transfer Tokens")')
}

export async function goToDestroyAsset(page: Page) {
  await page.click(NAV.destroyAsset)
  await page.waitForSelector('h1:has-text("Destroy Asset")')
}
