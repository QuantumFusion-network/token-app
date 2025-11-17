/**
 * Custom render utilities for React Testing Library
 *
 * Provides pre-configured render functions that wrap components
 * with necessary providers (QueryClient, etc.)
 *
 * Usage:
 * ```ts
 * import { renderWithProviders } from '@/__tests__/utils/render'
 *
 * test('component renders', () => {
 *   renderWithProviders(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */

import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'

/**
 * Creates a fresh QueryClient for each test
 * Configured to disable retries for faster, more predictable tests
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests for faster failures
        retry: false,
        // Disable automatic refetching
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        // Set stale time to infinity to prevent automatic refetches
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Props for custom render wrapper
 */
interface WrapperProps {
  children: ReactNode
  queryClient?: QueryClient
}

/**
 * Creates a wrapper component with all necessary providers
 *
 * @param queryClient - Optional custom QueryClient (creates new one if not provided)
 */
export const createWrapper =
  (queryClient?: QueryClient) =>
  ({ children }: WrapperProps) => {
    const client = queryClient || createTestQueryClient()

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

/**
 * Custom render function that wraps component with providers
 *
 * @param ui - Component to render
 * @param options - Render options including optional custom queryClient
 * @returns Render result from @testing-library/react
 *
 * @example
 * // Basic usage
 * renderWithProviders(<MyComponent />)
 *
 * @example
 * // With custom QueryClient
 * const queryClient = createTestQueryClient()
 * queryClient.setQueryData(['key'], mockData)
 * renderWithProviders(<MyComponent />, { queryClient })
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
  }
) => {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: createWrapper(queryClient),
    ...renderOptions,
  })
}

/**
 * Re-export everything from @testing-library/react for convenience
 */
export * from '@testing-library/react'
