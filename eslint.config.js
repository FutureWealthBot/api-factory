import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Use `ignores` per ESLint config recommendation instead of .eslintignore
const IGNORES = [
  '**/dist/**',
  'build/**',
  'node_modules/**',
  'node_modules/.pnpm/**',
  '.pnpm/**',
  '.output/**',
  'packages/**/public/dist/**',
  'apps/**/dist/**',
  'apps/**/public/dist/**',
  'build-logs/**',
  'packages/**/dist/**',
  '**/*.log',
  '**/*.min.js',
];

export default tseslint.config([
  {
    ignores: IGNORES,
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
]);
