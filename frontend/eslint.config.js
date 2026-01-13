import js from '@eslint/js';

const enableTypeAwareLintRules = false;

import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: enableTypeAwareLintRules
        ? {
            ecmaVersion: 'latest',
            sourceType: 'module',
            project: ['./tsconfig.json'],
            tsconfigRootDir: import.meta.dirname,
          }
        : {
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      // Many files export non-components (services/constants). Keep signal low.
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
