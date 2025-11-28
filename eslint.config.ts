// eslint.config.ts
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import js from '@eslint/js'

export default defineConfig([
  // Ignore build and generated folders
  {
    ignores: [
      'dist',
      'build',
      'coverage',
      '.papi',
      '.vite',
      '.vscode',
      '.wrangler',
      'node_modules',
      '*.config.{js,mjs,cjs}',
      '.prettierrc.*',
      'src/__tests__',
    ],
  },

  // Base JS preset
  js.configs.recommended,

  // Type-checked TS presets (require parserOptions.project)
  ...tseslint.configs.recommendedTypeChecked,
  // Optionally add stricter stylistic, non-formatting rules:
  // ...tseslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        // Point to all tsconfigs that represent code you lint
        project: ['tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Compiler guidance: Hooks flat preset
      ...reactHooks.configs.recommended.rules,

      // Vite React Fast Refresh rule (adjust as you like)
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true },
      ],

      // Useful TS ergonomics
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Keep last to disable stylistic rules that conflict with Prettier
  eslintConfigPrettier,
])
