import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/', 'migration/', '.responsive/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { rules: { '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }] } },
  {
    files: ['scripts/**/*.mjs', 'src/lib/*.mjs', 'server.mjs', '*.config.{js,mjs}'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly', URL: 'readonly', fetch: 'readonly', Buffer: 'readonly', setTimeout: 'readonly' } },
  },
  {
    files: ['scripts/check-responsive.mjs'],
    languageOptions: { globals: { fetch: 'readonly', setTimeout: 'readonly', document: 'readonly', window: 'readonly', getComputedStyle: 'readonly', NodeFilter: 'readonly', PerformanceObserver: 'readonly' } },
  },
];
