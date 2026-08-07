const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  // The Stripe SDK ships .js.map files that reference its original .ts
  // sources, which aren't published — harmless, just noisy.
  // BullMQ optionally supports a Postgres-backed queue and a Valkey-Glide
  // Redis client we don't use; neither package is intentionally installed.
  ignoreWarnings: [
    /Failed to parse source map/,
    /Can't resolve 'pg'/,
    /Can't resolve '@valkey\/valkey-glide'/,
    /Critical dependency: the request of a dependency is an expression/,
  ],
  resolve: {
    alias: {
      // @nestjs/mapped-types feature-detects class-transformer's storage
      // module with `require('class-transformer/cjs/storage')` falling
      // back to `require('class-transformer/storage')`. The fallback path
      // isn't published by this class-transformer version — the first
      // require always succeeds, but webpack still statically resolves
      // both requires inside the try/catch, so the second one needs an
      // alias or the build fails even though it's never actually reached.
      'class-transformer/storage': require.resolve('class-transformer/cjs/storage'),
    },
  },
  // bcrypt ships a native .node addon that it locates at runtime via
  // `__dirname`-relative lookup into its own package's prebuilds/ folder.
  // pino's dev transport (pino-pretty) spawns a worker thread through
  // thread-stream, which likewise does a `__dirname`-relative lookup for its
  // own lib/worker.js. Webpack's default `externalDependencies: 'all'` only
  // externalizes deps it finds hoisted in the workspace-root node_modules,
  // which pnpm doesn't do — so these get bundled into main.js instead,
  // `__dirname` resolves to dist/, and the file/native-binary lookups break.
  // Force the whole pino family + thread-stream external so each package's
  // real installed copy (with its own correctly pnpm-linked node_modules)
  // handles its own internal requires, instead of inlining them.
  externals: [
    {
      bcrypt: 'commonjs bcrypt',
      pino: 'commonjs pino',
      'pino-http': 'commonjs pino-http',
      'pino-pretty': 'commonjs pino-pretty',
      'nestjs-pino': 'commonjs nestjs-pino',
      'thread-stream': 'commonjs thread-stream',
    },
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
      mergeExternals: true,
    }),
  ],
};
