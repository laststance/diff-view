import { defineConfig } from 'eslint/config';
import tsPrefixer from 'eslint-config-ts-prefixer';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  ...tsPrefixer,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'require-atomic-updates': 'off', // Disable for test files where reassignment is intentional
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      '*.config.js',
      '*.config.ts',
      '.vite/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'scripts/**',
    ],
  },
]);
