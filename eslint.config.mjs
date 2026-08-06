import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/test-output',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // Shared libs are intentionally non-buildable (bundler: none) —
          // apps consume their TS source directly for tighter HMR/DX, so
          // there's no "buildable output" for this rule to require.
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Web apps may use universal shared code and the web-only UI kit,
            // but never reach into each other or into the API/mobile apps.
            {
              sourceTag: 'scope:storefront',
              onlyDependOnLibsWithTags: [
                'scope:storefront',
                'scope:shared-universal',
                'scope:shared-web',
              ],
            },
            {
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: [
                'scope:admin',
                'scope:shared-universal',
                'scope:shared-web',
              ],
            },
            // Mobile has no DOM, so it may depend on universal shared code
            // only — never the web UI kit, storefront, admin, or API source.
            {
              sourceTag: 'scope:mobile',
              onlyDependOnLibsWithTags: ['scope:mobile', 'scope:shared-universal'],
            },
            // The API is a separate runtime; it may only reuse the
            // framework-agnostic contracts/utils, never frontend code.
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:api', 'scope:shared-universal'],
            },
            // Shared libs may only depend on other shared libs. The web UI
            // kit may sit on top of universal code; universal code must stay
            // framework-agnostic and never depend on the web UI kit.
            {
              sourceTag: 'scope:shared-web',
              onlyDependOnLibsWithTags: ['scope:shared-web', 'scope:shared-universal'],
            },
            {
              sourceTag: 'scope:shared-universal',
              onlyDependOnLibsWithTags: ['scope:shared-universal'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
