import type { Page } from '@playwright/test'

/**
 * Wait for a transaction to complete by watching for success toast
 * Toast messages contain "successfully" or "created"
 */
export async function waitForTransactionSuccess(page: Page, timeout = 30_000) {
  // Sonner toasts have data-sonner-toast attribute
  // Wait for success message patterns
  await page.waitForSelector(
    'text=/successfully|created|minted|transferred|destroyed/i',
    { timeout }
  )
}

/**
 * Wait for a transaction error toast
 */
export async function waitForTransactionError(page: Page, timeout = 30_000) {
  await page.waitForSelector('text=/failed|error/i', { timeout })
}

/**
 * Wait for the connection to be established
 */
export async function waitForConnection(page: Page, timeout = 15_000) {
  // Wait for balance to show (indicates connection is established)
  await page.waitForSelector('text=/QF Balance/', { timeout })
}

/**
 * Wait for portfolio to load with assets
 */
export async function waitForPortfolioLoad(page: Page, timeout = 10_000) {
  await page.waitForSelector('h2:has-text("Assets")', { timeout })
}

/**
 * Wait for signing toast to appear
 */
export async function waitForSigningToast(page: Page, timeout = 10_000) {
  await page.waitForSelector('text=/Please sign/i', { timeout })
}
