/**
 * Global test setup for Vitest + React Testing Library
 * Updated for Testing Trophy methodology
 *
 * This file runs before each test file and configures:
 * - Testing Library matchers (toBeInTheDocument, etc.)
 * - Global cleanup after each test
 * - Browser API mocks required by Radix UI
 * - MSW (Mock Service Worker) for network mocking
 */

import '@testing-library/jest-dom'

import { afterEach, vi } from 'vitest'

import { cleanup } from '@testing-library/react'

// Cleanup React Testing Library after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

// Mock window.matchMedia (required for Radix UI responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.ResizeObserver (required for Radix UI Portal and Dialog)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver (required for Radix UI Tooltip and Popover)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => []),
}))

// Mock window.HTMLElement.prototype.scrollIntoView (used by Radix UI)
window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock window.HTMLElement.prototype.releasePointerCapture (used by Radix UI)
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

// Mock window.HTMLElement.prototype.setPointerCapture (used by Radix UI)
window.HTMLElement.prototype.setPointerCapture = vi.fn()

// Suppress console.error and console.warn in tests (opt-in per test if needed)
// Uncomment if tests are too noisy:
// beforeAll(() => {
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   vi.spyOn(console, 'warn').mockImplementation(() => {})
// })
