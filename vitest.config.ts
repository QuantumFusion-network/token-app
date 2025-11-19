import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    tailwindcss(),
  ],
  test: {
    // Test environment - jsdom provides browser-like environment for React
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./src/__tests__/setup.ts'],

    // Enable global test APIs (describe, it, expect) without imports
    globals: true,

    // CSS handling - process CSS imports in tests
    css: true,

    // Mock management - reset all mocks between tests for isolation
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Reporter - tap format has better hierarchy
    reporters: 'tree',

    // Coverage configuration (informational only, not enforced)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/components/ui/', // shadcn/ui primitives (pre-tested)
        '.papi/', // Generated polkadot-api descriptors
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
