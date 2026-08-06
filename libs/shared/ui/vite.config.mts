import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/ui',
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: '@org/ui',
    watch: false,
    globals: true,
    environment: 'jsdom',
    // No component tests yet — these are thin, mostly-visual wrappers
    // around Tailwind classes; typecheck + lint + being used by every
    // storefront/admin page is the coverage for now. Real component tests
    // (Testing Library) are a documented next step, not skipped silently.
    passWithNoTests: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
