import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /* ------------------------------------------------------------------
       * Architecture boundaries — see .claude/rules/architecture-boundaries.md
       *
       *   app/  ->  features/*  ->  shared/  ->  (nothing)
       *               `-> features/other (root index.ts only)
       *
       * These rules are why the architecture holds. Do not relax them
       * without changing the documented design first.
       * ------------------------------------------------------------------ */
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: ['./src/features', './src/app', './src/providers'],
              message:
                'shared/ is domain-free: it must not import features, app, or providers. Move the shared thing into shared/, or keep it in the feature.',
            },
            {
              target: './src/providers',
              from: ['./src/features', './src/app'],
              message: 'providers/ must not depend on features or app.',
            },
            {
              // src/test is deliberately absent from the targets below: test
              // helpers are allowed to reach the composition root so that
              // renderWithProviders can wrap components in the real providers.
              target: ['./src/features', './src/shared', './src/providers'],
              from: './src/app',
              message: 'app/ is the composition root; nothing may import it.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import a feature through its public root only: @/features/<name>. Inside a feature, use relative paths.',
            },
            {
              group: ['../../features/*', '../../../features/*'],
              message: 'Use the @/features/<name> alias for cross-feature imports.',
            },
          ],
        },
      ],
      'import/no-cycle': ['error', { maxDepth: 4 }],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  prettier,
);
